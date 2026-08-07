export async function createSubmission(payload: {
  name: string;
  email: string;
  answers: { questionId: string; choice: string }[];
  resultKey: string;
  tiebreaker?: string;
}) {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal menyimpan hasil");
  return res.json() as Promise<{ id: number }>;
}

export async function adminLogin(password: string) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error("Password salah");
}

export async function adminList() {
  const res = await fetch("/api/admin/submissions", { credentials: "include" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export function adminExportUrl() {
  return "/api/admin/export";
}
