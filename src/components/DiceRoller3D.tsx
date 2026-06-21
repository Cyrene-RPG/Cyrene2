import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import "./DiceRoller3D.css";

const DICE_SIZE = 0.92;
const DICE_HALF = DICE_SIZE / 2;
const DICE_SPACING = 1.45;
const MIN_TUMBLE_MS = 1200;
const MAX_TUMBLE_MS = 2200;
const SETTLE_MS = 480;
const RESET_MIN_TUMBLE_MS = 650;
const RESET_MAX_TUMBLE_MS = 1200;

const FACE_EULERS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
  5: [Math.PI / 2, 0, 0],
  6: [Math.PI, 0, 0],
};

const FACE_QUATERNIONS = Object.fromEntries(
  Object.entries(FACE_EULERS).map(([value, euler]) => {
    const rotation = new THREE.Euler(euler[0], euler[1], euler[2], "XYZ");
    return [Number(value), new THREE.Quaternion().setFromEuler(rotation)];
  }),
) as Record<number, THREE.Quaternion>;

const _spinAxis = new THREE.Vector3();
const _spinQuat = new THREE.Quaternion();

type DiePhase = "idle" | "tumbling" | "settling" | "settled";

type DieActor = {
  mesh: THREE.Mesh;
  homeX: number;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  targetQuaternion: THREE.Quaternion;
  settleFromQuaternion: THREE.Quaternion;
  settleFromPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  settleStart: number;
  phase: DiePhase;
  faceValue: number;
};

export type DiceRollSettledPayload = {
  rollId: number;
  total: number;
};

export type DiceRoller3DProps = {
  values: number[] | null;
  kept: number[] | null;
  total: number | null;
  droppedIndex: number | null;
  rollTrigger: number;
  resetKey: number;
  onRollSettled?: (payload: DiceRollSettledPayload) => void;
};

function createDieMaterials(): THREE.MeshStandardMaterial[] {
  const materials: THREE.MeshStandardMaterial[] = [];

  for (let face = 1; face <= 6; face += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#221033");
    gradient.addColorStop(1, "#080010");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = "rgba(168, 85, 255, 0.75)";
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, 228, 228);

    ctx.fillStyle = "#39ff14";
    const pipRadius = 14;
    const pipPositions: Record<number, [number, number][]> = {
      1: [[128, 118]],
      2: [
        [72, 72],
        [184, 164],
      ],
      3: [
        [72, 72],
        [128, 118],
        [184, 164],
      ],
      4: [
        [72, 72],
        [184, 72],
        [72, 164],
        [184, 164],
      ],
      5: [
        [72, 72],
        [184, 72],
        [128, 118],
        [72, 164],
        [184, 164],
      ],
      6: [
        [72, 72],
        [184, 72],
        [72, 118],
        [184, 118],
        [72, 164],
        [184, 164],
      ],
    };

    for (const [x, y] of pipPositions[face]) {
      ctx.beginPath();
      ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = '700 56px "Share Tech Mono", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#d7b4ff";
    ctx.fillText(String(face), 128, 212);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    materials.push(
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.45,
        metalness: 0.12,
      }),
    );
  }

  return [
    materials[2],
    materials[3],
    materials[0],
    materials[5],
    materials[1],
    materials[4],
  ];
}

function getDroppedIndex(values: number[]): number | null {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const index = values.indexOf(min);
  return index >= 0 ? index : null;
}

function applyDieHighlight(die: DieActor, isDropped: boolean) {
  const materials = die.mesh.material;
  if (!Array.isArray(materials)) return;

  for (const material of materials) {
    const standard = material as THREE.MeshStandardMaterial;
    standard.emissive.setHex(isDropped ? 0x5a1020 : 0x000000);
    standard.emissiveIntensity = isDropped ? 0.55 : 0;
    standard.color.setHex(isDropped ? 0xb8b8b8 : 0xffffff);
  }
}

function applySpin(mesh: THREE.Mesh, angularVelocity: THREE.Vector3, delta: number) {
  const speed = angularVelocity.length();
  if (speed < 0.001) return;

  _spinAxis.copy(angularVelocity).multiplyScalar(1 / speed);
  _spinQuat.setFromAxisAngle(_spinAxis, speed * delta);
  mesh.quaternion.multiply(_spinQuat).normalize();
}

type SceneState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  dice: DieActor[];
  frameId: number;
  rollStartedAt: number;
  lastFrameTime: number;
  rolling: boolean;
  lastRollTrigger: number;
  minTumbleMs: number;
  maxTumbleMs: number;
  suppressTotals: boolean;
};

function launchDiceTumble(
  state: SceneState,
  options: {
    resetToFace?: number;
    highlightDroppedIndex?: number | null;
    minTumbleMs: number;
    maxTumbleMs: number;
    suppressTotals: boolean;
    lift?: number;
    spinScale?: number;
  },
) {
  const {
    resetToFace,
    highlightDroppedIndex = null,
    minTumbleMs,
    maxTumbleMs,
    suppressTotals,
    lift = 2.2,
    spinScale = 14,
  } = options;

  state.minTumbleMs = minTumbleMs;
  state.maxTumbleMs = maxTumbleMs;
  state.suppressTotals = suppressTotals;
  state.rolling = true;
  state.rollStartedAt = performance.now();
  state.lastFrameTime = performance.now();

  state.dice.forEach((die, index) => {
    if (resetToFace != null) {
      die.faceValue = resetToFace;
      die.targetQuaternion.copy(
        FACE_QUATERNIONS[resetToFace] ?? FACE_QUATERNIONS[1],
      );
    }
    die.targetPosition.set(die.homeX, DICE_HALF, 0);
    die.phase = "tumbling";
    die.mesh.position.set(
      die.homeX + (Math.random() - 0.5) * 1.2,
      lift + Math.random() * 1.2,
      (Math.random() - 0.5) * 0.8,
    );
    die.velocity.set(
      (Math.random() - 0.5) * 3.5,
      Math.random() * 1.8 + 0.5,
      (Math.random() - 0.5) * 2.5,
    );
    die.angularVelocity.set(
      (Math.random() - 0.5) * spinScale,
      (Math.random() - 0.5) * spinScale,
      (Math.random() - 0.5) * spinScale,
    );
    applyDieHighlight(die, highlightDroppedIndex === index);
  });
}

export default function DiceRoller3D({
  values,
  kept,
  total,
  droppedIndex,
  rollTrigger,
  resetKey,
  onRollSettled,
}: DiceRoller3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showTotals, setShowTotals] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [displayedRollId, setDisplayedRollId] = useState(0);
  const settledRef = useRef(false);
  const onRollSettledRef = useRef(onRollSettled);
  const totalRef = useRef(total);

  const sceneRef = useRef<SceneState | null>(null);

  useEffect(() => {
    onRollSettledRef.current = onRollSettled;
  }, [onRollSettled]);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 7.1);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const keyLight = new THREE.DirectionalLight(0xd7b4ff, 1.1);
    keyLight.position.set(4, 9, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x39ff14, 0.45);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 6),
      new THREE.MeshStandardMaterial({
        color: 0x12001f,
        roughness: 1,
        metalness: 0,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const dice: DieActor[] = [];

    for (let index = 0; index < 4; index += 1) {
      const homeX = (index - 1.5) * DICE_SPACING;
      const geometry = new RoundedBoxGeometry(
        DICE_SIZE,
        DICE_SIZE,
        DICE_SIZE,
        6,
        0.12,
      );
      const materials = createDieMaterials();
      const mesh = new THREE.Mesh(geometry, materials);
      mesh.position.set(homeX, DICE_HALF, 0);
      mesh.quaternion.copy(FACE_QUATERNIONS[1]);

      scene.add(mesh);
      dice.push({
        mesh,
        homeX,
        velocity: new THREE.Vector3(),
        angularVelocity: new THREE.Vector3(),
        targetQuaternion: FACE_QUATERNIONS[1].clone(),
        settleFromQuaternion: new THREE.Quaternion(),
        settleFromPosition: new THREE.Vector3(),
        targetPosition: new THREE.Vector3(homeX, DICE_HALF, 0),
        settleStart: 0,
        phase: "idle",
        faceValue: 1,
      });
    }

    const state: SceneState = {
      renderer,
      scene,
      camera,
      dice,
      frameId: 0,
      rollStartedAt: 0,
      lastFrameTime: 0,
      rolling: false,
      lastRollTrigger: -1,
      minTumbleMs: MIN_TUMBLE_MS,
      maxTumbleMs: MAX_TUMBLE_MS,
      suppressTotals: false,
    };
    sceneRef.current = state;

    const animate = (timestamp: number) => {
      if (!state.lastFrameTime) state.lastFrameTime = timestamp;
      const delta = Math.min((timestamp - state.lastFrameTime) / 1000, 0.032);
      state.lastFrameTime = timestamp;

      const elapsed = state.rolling ? timestamp - state.rollStartedAt : 0;
      let allSettled = state.rolling;

      for (const die of dice) {
        if (die.phase === "tumbling") {
          die.velocity.y -= 16 * delta;
          die.mesh.position.addScaledVector(die.velocity, delta);
          applySpin(die.mesh, die.angularVelocity, delta);
          die.angularVelocity.multiplyScalar(0.988);
          die.velocity.multiplyScalar(0.994);

          if (die.mesh.position.y < DICE_HALF) {
            die.mesh.position.y = DICE_HALF;
            if (die.velocity.y < -0.5) {
              die.velocity.y *= -0.38;
              die.velocity.x *= 0.72;
              die.velocity.z *= 0.72;
              die.angularVelocity.multiplyScalar(0.92);
            } else {
              die.velocity.y = 0;
            }
          }

          const bounds = 2.6;
          if (die.mesh.position.x < -bounds) {
            die.mesh.position.x = -bounds;
            die.velocity.x = Math.abs(die.velocity.x) * 0.45;
          } else if (die.mesh.position.x > bounds) {
            die.mesh.position.x = bounds;
            die.velocity.x = -Math.abs(die.velocity.x) * 0.45;
          }
          if (die.mesh.position.z < -1) {
            die.mesh.position.z = -1;
            die.velocity.z = Math.abs(die.velocity.z) * 0.45;
          } else if (die.mesh.position.z > 1) {
            die.mesh.position.z = 1;
            die.velocity.z = -Math.abs(die.velocity.z) * 0.45;
          }

          const spinMag = die.angularVelocity.length();
          const speed = die.velocity.length();
          const canSettle =
            elapsed > state.minTumbleMs && spinMag < 1.8 && speed < 0.55;
          const mustSettle = elapsed > state.maxTumbleMs;

          if (canSettle || mustSettle) {
            die.phase = "settling";
            die.settleStart = timestamp;
            die.settleFromQuaternion.copy(die.mesh.quaternion);
            die.settleFromPosition.copy(die.mesh.position);
            die.targetPosition.set(die.homeX, DICE_HALF, 0);
            die.velocity.set(0, 0, 0);
            die.angularVelocity.set(0, 0, 0);
          }
        } else if (die.phase === "settling") {
          const settleElapsed = timestamp - die.settleStart;
          const t = Math.min(settleElapsed / SETTLE_MS, 1);
          const eased = 1 - (1 - t) ** 3;

          die.mesh.quaternion.slerpQuaternions(
            die.settleFromQuaternion,
            die.targetQuaternion,
            eased,
          );
          die.mesh.position.lerpVectors(
            die.settleFromPosition,
            die.targetPosition,
            eased,
          );

          if (t >= 1) {
            die.phase = "settled";
            die.mesh.quaternion.copy(die.targetQuaternion);
            die.mesh.position.copy(die.targetPosition);
          }
        } else if (die.phase === "settled" || die.phase === "idle") {
          die.mesh.position.copy(die.targetPosition);
          die.mesh.quaternion.copy(die.targetQuaternion);
        }

        if (die.phase === "tumbling" || die.phase === "settling") {
          allSettled = false;
        }
      }

      if (state.rolling && allSettled && !settledRef.current) {
        settledRef.current = true;
        state.rolling = false;
        setIsRolling(false);
        if (!state.suppressTotals) {
          setDisplayedRollId(state.lastRollTrigger);
          setShowTotals(true);
          const settledTotal = totalRef.current;
          if (settledTotal != null) {
            onRollSettledRef.current?.({
              rollId: state.lastRollTrigger,
              total: settledTotal,
            });
          }
        }
      }

      renderer.render(scene, camera);
      state.frameId = window.requestAnimationFrame(animate);
    };

    state.frameId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      const nextWidth = container.clientWidth || width;
      const nextHeight = container.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(state.frameId);
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      for (const die of dice) {
        die.mesh.geometry.dispose();
        const materials = die.mesh.material;
        if (Array.isArray(materials)) {
          for (const material of materials) {
            const standard = material as THREE.MeshStandardMaterial;
            standard.map?.dispose();
            standard.dispose();
          }
        }
      }
      renderer.dispose();
      container.removeChild(renderer.domElement);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state || rollTrigger === 0 || rollTrigger === state.lastRollTrigger) {
      return;
    }
    if (!values || values.length !== 4) return;

    state.lastRollTrigger = rollTrigger;
    settledRef.current = false;
    setShowTotals(false);
    setDisplayedRollId(0);
    setIsRolling(true);

    const dropIndex = droppedIndex ?? getDroppedIndex(values);

    state.dice.forEach((die, index) => {
      const value = values[index] ?? 1;
      die.faceValue = value;
      die.targetQuaternion.copy(FACE_QUATERNIONS[value] ?? FACE_QUATERNIONS[1]);
    });

    launchDiceTumble(state, {
      highlightDroppedIndex: dropIndex,
      minTumbleMs: MIN_TUMBLE_MS,
      maxTumbleMs: MAX_TUMBLE_MS,
      suppressTotals: false,
    });
  }, [rollTrigger, values, droppedIndex]);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state || resetKey === 0) return;

    settledRef.current = false;
    setShowTotals(false);
    setDisplayedRollId(0);
    setIsRolling(true);
    state.lastRollTrigger = -1;

    launchDiceTumble(state, {
      resetToFace: 1,
      highlightDroppedIndex: null,
      minTumbleMs: RESET_MIN_TUMBLE_MS,
      maxTumbleMs: RESET_MAX_TUMBLE_MS,
      suppressTotals: true,
      lift: 1.6,
      spinScale: 10,
    });
  }, [resetKey]);

  useEffect(() => {
    if (rollTrigger !== 0) return;

    settledRef.current = false;
    setShowTotals(false);
    setDisplayedRollId(0);

    const state = sceneRef.current;
    if (!state) return;

    state.lastRollTrigger = -1;
    state.suppressTotals = false;
  }, [rollTrigger]);

  const keptLabel = kept && kept.length > 0 ? kept.join(" + ") : null;

  return (
    <div className="diceRoller3d">
      <div
        ref={containerRef}
        className="diceRoller3d__canvas"
        aria-label="3D dice roller"
        role="img"
      />

      {values && values.length === 4 ? (
        <div
          className={`diceRoller3d__faceLabels${
            showTotals && displayedRollId === rollTrigger
              ? " diceRoller3d__faceLabels--visible"
              : ""
          }`}
        >
          {values.map((value, index) => (
            <span
              key={`${rollTrigger}-${index}`}
              className={`diceRoller3d__faceLabel${
                droppedIndex === index ? " diceRoller3d__faceLabel--dropped" : ""
              }`}
            >
              {showTotals && displayedRollId === rollTrigger ? value : "?"}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={`diceRoller3d__totalBadge${
          showTotals && displayedRollId === rollTrigger && total != null
            ? " diceRoller3d__totalBadge--visible"
            : ""
        }${isRolling ? " diceRoller3d__totalBadge--rolling" : ""}`}
      >
        {isRolling ? (
          <span className="diceRoller3d__rollingText">ROLLING...</span>
        ) : showTotals && displayedRollId === rollTrigger && total != null ? (
          <>
            <span className="diceRoller3d__keptLabel">
              {keptLabel ?? values?.join(" + ")}
            </span>
            <span className="diceRoller3d__totalValue">= {total}</span>
          </>
        ) : (
          <span className="diceRoller3d__prompt">ROLL 4D6</span>
        )}
      </div>
    </div>
  );
}

export function getDiceDroppedIndex(values: number[]): number | null {
  return getDroppedIndex(values);
}
