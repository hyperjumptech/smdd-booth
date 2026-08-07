import { useState, type FormEvent } from "react";
import {
  QUESTIONS,
  RESULTS,
  type Answer,
  type Choice,
} from "@booth/shared";
import { adminExportUrl, adminList, adminLogin } from "../lib/api";

const PAGE_SIZE = 10;

type Submission = {
  id: number;
  name: string;
  email: string;
  answers: Answer[];
  result_key: Choice;
  result_label: string;
  created_at: string;
};

function formatWaktu(createdAt: string): string {
  const date = new Date(createdAt.replace(" ", "T") + "Z");
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatAnswer(answer: Answer): { title: string; body: string } {
  if (answer.questionId === "tiebreaker") {
    const service = RESULTS[answer.choice]?.service ?? answer.choice;
    return {
      title: "Tiebreaker",
      body: `${answer.choice} — ${service}`,
    };
  }

  const question = QUESTIONS.find((q) => q.id === answer.questionId);
  const option = question?.options[answer.choice];
  return {
    title: question?.prompt ?? answer.questionId,
    body: option ? `${answer.choice}. ${option}` : answer.choice,
  };
}

async function downloadCsv() {
  const res = await fetch(adminExportUrl(), { credentials: "include" });
  if (!res.ok) throw new Error("Export gagal");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "submissions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  async function loadList() {
    setLoadingList(true);
    try {
      const data = (await adminList()) as Submission[];
      setSubmissions(data);
      setPage(0);
      setExpandedId(null);
    } catch {
      setLoggedIn(false);
      setSubmissions(null);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await adminLogin(password);
      setLoggedIn(true);
      await loadList();
    } catch {
      setLoginError("Password salah");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadCsv();
    } catch {
      setExportError("Export gagal");
    } finally {
      setExporting(false);
    }
  }

  if (!loggedIn) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold">Admin</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-3 text-base shadow-sm outline-none focus:border-[var(--hj-cyan)]"
              autoComplete="current-password"
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-400" role="alert">
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loggingIn || password.length === 0}
            className="rounded-lg bg-[var(--hj-cyan)] px-4 py-3 font-semibold text-[var(--hj-on-accent)] disabled:opacity-50"
          >
            {loggingIn ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </main>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil((submissions?.length ?? 0) / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows =
    submissions?.slice(
      currentPage * PAGE_SIZE,
      currentPage * PAGE_SIZE + PAGE_SIZE,
    ) ?? [];

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg bg-[var(--hj-yellow)] px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {exporting ? "Mengekspor..." : "Export CSV"}
        </button>
      </div>

      {exportError && (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {exportError}
        </p>
      )}

      {loadingList ? (
        <p className="text-[var(--hj-muted)]">Memuat...</p>
      ) : submissions && submissions.length === 0 ? (
        <p className="text-[var(--hj-muted)]">Belum ada data.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {pageRows.map((row) => {
              const open = expandedId === row.id;
              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)]"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : row.id)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left"
                    aria-expanded={open}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold">{row.name}</span>
                      <span className="shrink-0 text-xs text-[var(--hj-muted)]">
                        {open ? "Tutup" : "Jawaban"}
                      </span>
                    </div>
                    <span className="break-all text-sm text-[var(--hj-muted)]">
                      {row.email}
                    </span>
                    <span className="text-sm text-[var(--hj-cyan)]">
                      {row.result_label}
                    </span>
                    <span className="text-xs text-[var(--hj-muted)]">
                      {formatWaktu(row.created_at)}
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-[var(--hj-border)] px-4 py-3">
                      <ol className="flex flex-col gap-4">
                        {row.answers.map((answer, index) => {
                          const { title, body } = formatAnswer(answer);
                          return (
                            <li key={`${answer.questionId}-${index}`}>
                              <p className="mb-1 text-xs font-medium text-[var(--hj-muted)]">
                                {answer.questionId === "tiebreaker"
                                  ? "Tiebreaker"
                                  : `Q${index + 1}`}
                              </p>
                              <p className="mb-1 text-sm leading-snug">{title}</p>
                              <p className="text-sm leading-snug text-[var(--hj-cyan)]">
                                {body}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => {
                setPage(currentPage - 1);
                setExpandedId(null);
              }}
              className="rounded-lg border border-[var(--hj-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <p className="text-center text-sm text-[var(--hj-muted)]">
              {currentPage + 1} / {totalPages}
              <span className="mt-0.5 block text-xs">
                {submissions?.length ?? 0} total
              </span>
            </p>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => {
                setPage(currentPage + 1);
                setExpandedId(null);
              }}
              className="rounded-lg border border-[var(--hj-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </>
      )}
    </main>
  );
}
