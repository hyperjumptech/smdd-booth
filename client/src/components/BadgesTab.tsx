import { useCallback, useState } from "react";
import {
  CASES,
  canSubmitBadges,
  countKinds,
  MIN_PRODUCT_BADGES,
  MIN_SERVICE_BADGES,
  type Badge,
  type CaseKind,
} from "@booth/shared";
import { createSubmission } from "../lib/api";
import { getRank, TOTAL_CASES } from "../lib/rank";
import { successFeedback, tapFeedback } from "../lib/haptics";
import { Confetti } from "./Confetti";
import { useCelebration } from "../hooks/useCelebration";

type BadgesTabProps = {
  name: string;
  email: string;
  badges: Badge[];
  submitted: boolean;
  markSubmitted: (submissionId: number) => void;
  resetProgress: () => void;
};

type SubmitStatus = "idle" | "loading" | "error";

function kindLabel(kind: CaseKind): string {
  return kind === "service" ? "Service" : "Product";
}

function accentColor(kind: CaseKind): string {
  return kind === "service" ? "var(--hj-cyan)" : "var(--hj-amber)";
}

// Short, stable badge number so the ID card feels issued rather than generic.
function detectiveCode(email: string, name: string): string {
  const seed = `${email}|${name}`.toLowerCase();
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  const suffix = hash.toString(36).toUpperCase().padStart(4, "0").slice(-4);

  return `HJ-${suffix}`;
}

export function BadgesTab({
  name,
  email,
  badges,
  submitted,
  markSubmitted,
  resetProgress,
}: BadgesTabProps) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const { targetRef, celebrating } = useCelebration(justSubmitted);
  const counts = countKinds(badges);
  const eligible = canSubmitBadges(badges);
  const canSubmit = eligible && !submitted && submitStatus !== "loading";
  const rank = getRank(badges.length);
  const detectiveName = name.trim() || "Detektif";
  const code = detectiveCode(email, name);

  const handleSubmit = useCallback(async () => {
    if (!eligible || submitted) return;
    tapFeedback();
    setSubmitStatus("loading");
    try {
      const { id } = await createSubmission({ name, email, badges });
      markSubmitted(id);
      successFeedback();
      setJustSubmitted(true);
      setSubmitStatus("idle");
    } catch {
      setSubmitStatus("error");
    }
  }, [name, email, badges, eligible, submitted, markSubmitted]);

  return (
    <div className="relative flex flex-col gap-6">
      {submitted && (
        <div ref={targetRef} className="relative">
          {celebrating && <Confetti />}
          <div
            className="reveal-in hj-dossier relative overflow-hidden rounded-2xl border-4 border-[var(--hj-cyan)] bg-[var(--hj-surface)] px-6 py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <p
              className={`hj-mono mx-auto mb-4 inline-block rounded border-4 border-[var(--hj-red)] px-3 py-2 text-lg font-black uppercase tracking-widest text-[var(--hj-red)] ${
                celebrating ? "stamp-slam" : ""
              }`}
              style={celebrating ? undefined : { transform: "rotate(-8deg)" }}
            >
              Kasus Ditutup
            </p>
            <p className="text-4xl font-black tracking-wider text-[var(--hj-cyan)] sm:text-5xl">
              SIAP STAMP
            </p>
            <p className="mt-3 text-base font-medium text-[var(--hj-muted)]">
              Tunjukkan layar ini ke staff booth
            </p>
          </div>
        </div>
      )}

      <div className="hj-dossier rounded-2xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="hj-mono text-[10px] uppercase tracking-[0.2em] text-[var(--hj-muted)]">
              Kartu Detektif
            </p>
            <p className="truncate text-xl font-bold">{detectiveName}</p>
            <p className="text-sm font-semibold text-[var(--hj-cyan)]">
              {rank.title}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="hj-mono text-sm font-bold tracking-widest text-[var(--hj-yellow)]">
              {code}
            </p>
            <p className="hj-mono mt-1 text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
              {badges.length}/{TOTAL_CASES} badge
            </p>
          </div>
        </div>

        <p className="hj-mono mt-3 border-t border-[var(--hj-border)] pt-3 text-[11px] uppercase tracking-widest text-[var(--hj-muted)]">
          Service {counts.service}/{MIN_SERVICE_BADGES}
          <span className="mx-2 text-[var(--hj-border)]">|</span>
          Product {counts.product}/{MIN_PRODUCT_BADGES}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CASES.map((boothCase, index) => {
          const badge = badges.find((item) => item.caseId === boothCase.id);
          const paddedNumber = String(index + 1).padStart(2, "0");

          if (!badge) {
            return (
              <div
                key={boothCase.id}
                className="flex min-h-24 flex-col justify-between rounded-xl border border-dashed border-[var(--hj-border)] bg-transparent px-3 py-3 opacity-50"
              >
                <span className="hj-mono text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
                  #{paddedNumber}
                </span>
                <span className="text-base font-bold text-[var(--hj-muted)]">
                  ? ? ?
                </span>
                <span className="hj-mono text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
                  Terkunci
                </span>
              </div>
            );
          }

          const accent = accentColor(badge.kind);

          return (
            <div
              key={boothCase.id}
              className="card-in flex min-h-24 flex-col justify-between rounded-xl border px-3 py-3"
              style={{
                borderColor: accent,
                backgroundColor: "var(--hj-surface)",
              }}
            >
              <span className="hj-mono text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
                #{paddedNumber}
              </span>
              <span className="text-sm font-bold leading-snug">
                {badge.revealName}
              </span>
              <span
                className="hj-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ color: accent }}
              >
                {kindLabel(badge.kind)}
              </span>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex flex-col gap-3">
          {!eligible && (
            <p className="text-center text-sm text-[var(--hj-muted)]">
              Butuh minimal {MIN_SERVICE_BADGES} badge Service dan{" "}
              {MIN_PRODUCT_BADGES} badge Product untuk ambil doorprize.
            </p>
          )}

          {submitStatus === "error" && (
            <div className="text-center">
              <p className="mb-2 text-sm text-[var(--hj-red)]">
                Gagal mengirim. Coba lagi.
              </p>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                className="text-sm font-semibold text-[var(--hj-cyan)] underline underline-offset-4"
              >
                Coba lagi
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className={`min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 ${
              canSubmit ? "pulse-ring" : ""
            }`}
          >
            {submitStatus === "loading" ? "Mengirim…" : "Tutup berkas & klaim"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setSubmitStatus("idle");
          setJustSubmitted(false);
          resetProgress();
        }}
        className="min-h-12 w-full rounded-xl border border-[var(--hj-border)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--hj-muted)] transition-opacity active:opacity-80"
      >
        Detektif berikutnya (reset)
      </button>
    </div>
  );
}
