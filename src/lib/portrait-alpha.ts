/** Remove only edge-connected near-black pixels (safe for dark clothing). */
export function applyEdgeBlackKey(
  image: HTMLImageElement,
  threshold = 28,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return image.src;

  ctx.drawImage(image, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = frame;

  const isBackground = (offset: number) =>
    data[offset] <= threshold &&
    data[offset + 1] <= threshold &&
    data[offset + 2] <= threshold;

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const seed = (x: number, y: number) => {
    const index = y * width + x;
    if (visited[index]) return;
    const offset = index * 4;
    if (!isBackground(offset)) return;
    visited[index] = 1;
    queue.push(index);
  };

  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }

  while (queue.length > 0) {
    const index = queue.pop()!;
    const offset = index * 4;
    data[offset + 3] = 0;

    const x = index % width;
    const y = (index - x) / width;
    const neighbors: [number, number][] = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx;
      if (visited[next]) continue;
      const nextOffset = next * 4;
      if (!isBackground(nextOffset)) continue;
      visited[next] = 1;
      queue.push(next);
    }
  }

  ctx.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}

export function portraitHasTransparency(image: HTMLImageElement): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const corners = [
    0,
    (canvas.width - 1) * 4 + 3,
    (canvas.height - 1) * canvas.width * 4 + 3,
    ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4 + 3,
  ];

  return corners.some((offset) => data[offset] < 200);
}
