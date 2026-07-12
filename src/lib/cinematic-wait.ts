export async function waitCinematicMs(
  ms: number,
  isCancelled: () => boolean,
  isPaused: () => boolean,
) {
  let remaining = ms;
  while (remaining > 0) {
    if (isCancelled()) return;
    if (isPaused()) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 100);
      });
      continue;
    }
    const step = Math.min(40, remaining);
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, step);
    });
    remaining -= step;
  }
}
