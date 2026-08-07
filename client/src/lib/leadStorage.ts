const STORAGE_KEY = "booth-lead";

export type LeadData = {
  name: string;
  email: string;
};

export function loadLead(): LeadData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: "", email: "" };
    const parsed = JSON.parse(raw) as Partial<LeadData>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return { name: "", email: "" };
  }
}

export function saveLead(name: string, email: string): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ name: name.trim(), email: email.trim() }),
  );
}
