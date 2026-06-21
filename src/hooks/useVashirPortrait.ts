import { useEffect, useState } from "react";
import {
  applyEdgeBlackKey,
  portraitHasTransparency,
} from "../lib/portrait-alpha";

const VASHIR_PORTRAIT = "/vashir.png";

export const VASHIR_PORTRAIT_WIDTH = 475;
export const VASHIR_PORTRAIT_HEIGHT = 525;

export function useVashirPortrait() {
  const [portraitSrc, setPortraitSrc] = useState<string | null>(null);

  useEffect(() => {
    const image = new Image();
    image.decoding = "sync";
    image.onload = () => {
      setPortraitSrc(
        portraitHasTransparency(image)
          ? VASHIR_PORTRAIT
          : applyEdgeBlackKey(image),
      );
    };
    image.onerror = () => setPortraitSrc(VASHIR_PORTRAIT);
    image.src = VASHIR_PORTRAIT;
  }, []);

  return portraitSrc;
}
