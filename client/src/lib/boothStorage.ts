import type { Badge } from "@booth/shared";

const KEY = "booth-progress-v1";

export type BoothProgress = {
  name: string;
  email: string;
  badges: Badge[];
  submitted: boolean;
  submissionId?: number;
};

export function loadBoothProgress(): BoothProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { name: "", email: "", badges: [], submitted: false };
    }
    const parsed = JSON.parse(raw) as Partial<BoothProgress>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      badges: Array.isArray(parsed.badges) ? (parsed.badges as Badge[]) : [],
      submitted: Boolean(parsed.submitted),
      submissionId:
        typeof parsed.submissionId === "number" ? parsed.submissionId : undefined,
    };
  } catch {
    return { name: "", email: "", badges: [], submitted: false };
  }
}

export function saveBoothProgress(progress: BoothProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
