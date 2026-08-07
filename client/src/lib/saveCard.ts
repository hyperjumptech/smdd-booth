import { toPng } from "html-to-image";
import type { Choice } from "@booth/shared";

/** iPhone / iPod / iPad (including iPadOS that spoofs Mac). */
function isIOS(): boolean {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ may report as Macintosh with touch
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function downloadPng(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function sharePngFile(file: File) {
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };

  if (!nav.share || !nav.canShare?.({ files: [file] })) {
    throw new Error("Share API unavailable");
  }

  try {
    await navigator.share({
      files: [file],
      title: "Hasil Kuis Hyperjump",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return;
    }
    throw err;
  }
}

/**
 * Desktop + Android: download PNG file.
 * iOS: system share sheet (Save Image / share to apps).
 */
export async function saveResultCard(node: HTMLElement, resultKey: Choice) {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const filename = `hyperjump-quiz-${resultKey}.png`;
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], filename, { type: "image/png" });

  if (isIOS()) {
    await sharePngFile(file);
    return;
  }

  downloadPng(dataUrl, filename);
}
