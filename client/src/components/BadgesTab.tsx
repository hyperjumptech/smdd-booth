import {
  canSubmitBadges,
  countKinds,
  MIN_PRODUCT_BADGES,
  MIN_SERVICE_BADGES,
  type Badge,
} from "@booth/shared";
import { useCallback, useState } from "react";
import { createSubmission } from "../lib/api";

type BadgesTabProps = {
  name: string;
  email: string;
  badges: Badge[];
  submitted: boolean;
  markSubmitted: (submissionId: number) => void;
  resetProgress: () => void;
};

type SubmitStatus = "idle" | "loading" | "error";

function kindLabel(kind: Badge["kind"]): string {
  return kind === "service" ? "Service" : "Product";
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
  const counts = countKinds(badges);
  const eligible = canSubmitBadges(badges);
  const canSubmit = eligible && !submitted && submitStatus !== "loading";

  const handleSubmit = useCallback(async () => {
    if (!eligible || submitted) return;
    setSubmitStatus("loading");
    try {
      const { id } = await createSubmission({ name, email, badges });
      markSubmitted(id);
      setSubmitStatus("idle");
    } catch {
      setSubmitStatus("error");
    }
  }, [name, email, badges, eligible, submitted, markSubmitted]);

  return (
    <div className="flex flex-col gap-6">
      {submitted && (
        <div
          className="rounded-2xl border-4 border-[var(--hj-cyan)] bg-[var(--hj-surface)] px-6 py-10 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-4xl font-black tracking-wider text-[var(--hj-cyan)] sm:text-5xl">
            SIAP STAMP
          </p>
          <p className="mt-3 text-base font-medium text-[var(--hj-muted)]">
            Tunjukkan layar ini ke staff booth
          </p>
        </div>
      )}

      <p className="text-center text-sm font-semibold text-[var(--hj-muted)]">
        Service {counts.service}/{MIN_SERVICE_BADGES} · Product {counts.product}/
        {MIN_PRODUCT_BADGES}
      </p>

      {badges.length === 0 ? (
        <p className="py-8 text-center text-[var(--hj-muted)]">
          Belum ada badge. Selesaikan kasus di tab Problems untuk mengumpulkan
          badge.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {badges.map((badge) => (
            <li
              key={badge.caseId}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-3"
            >
              <span className="text-base font-medium">{badge.revealName}</span>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  badge.kind === "service"
                    ? "bg-[rgba(94,200,240,0.15)] text-[var(--hj-cyan)]"
                    : "bg-[rgba(255,180,80,0.15)] text-amber-300"
                }`}
              >
                {kindLabel(badge.kind)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!submitted && (
        <div className="flex flex-col gap-3">
          {submitStatus === "error" && (
            <div className="text-center">
              <p className="mb-2 text-sm text-red-600">Gagal mengirim. Coba lagi.</p>
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
            className="min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitStatus === "loading" ? "Mengirim…" : "Submit"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setSubmitStatus("idle");
          resetProgress();
        }}
        className="min-h-12 w-full rounded-xl border border-[var(--hj-border)] bg-transparent px-6 py-3 text-base font-semibold text-[var(--hj-muted)] transition-opacity active:opacity-80"
      >
        Mulai Lagi
      </button>
    </div>
  );
}
