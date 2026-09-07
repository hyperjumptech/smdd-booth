function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  navigator.vibrate(pattern);
}

export function tapFeedback(): void {
  vibrate(12);
}

export function successFeedback(): void {
  vibrate([18, 45, 90]);
}
