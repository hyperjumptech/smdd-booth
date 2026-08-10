import { useCallback, useEffect, useRef, useState } from "react";
import type { BoothCase } from "@booth/shared";

type Phase = "story" | "loading" | "reveal";

type CaseDetailProps = {
  boothCase: BoothCase;
  hasBadge: boolean;
  earnBadge: (caseId: string) => void;
  onClose: () => void;
};

const SOLVE_DELAY_MS = 750;

export function CaseDetail({
  boothCase,
  hasBadge,
  earnBadge,
  onClose,
}: CaseDetailProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const openedWithBadge = useRef(hasBadge);
  const [readEnough, setReadEnough] = useState(hasBadge);
  const [phase, setPhase] = useState<Phase>(hasBadge ? "reveal" : "story");

  const checkScroll = useCallback(() => {
    const el = storyRef.current;
    if (!el) return;
    if (
      el.scrollHeight <= el.clientHeight ||
      el.scrollTop + el.clientHeight >= el.scrollHeight * 0.9
    ) {
      setReadEnough(true);
    }
  }, []);

  useEffect(() => {
    setReadEnough(hasBadge);
    setPhase(hasBadge ? "reveal" : "story");
  }, [boothCase.id, hasBadge]);

  useEffect(() => {
    checkScroll();
  }, [checkScroll, boothCase.story]);

  function handleSolve() {
    if (!readEnough || hasBadge) return;
    setPhase("loading");
    window.setTimeout(() => {
      earnBadge(boothCase.id);
      setPhase("reveal");
    }, SOLVE_DELAY_MS);
  }

  const showReveal = phase === "reveal";
  const showSolve = !hasBadge && phase === "story";

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onClose}
        className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-[var(--hj-cyan)] transition-opacity active:opacity-80"
      >
        ← Kembali
      </button>

      <h2 className="text-lg font-bold">{boothCase.painTitle}</h2>

      <div
        ref={storyRef}
        onScroll={checkScroll}
        className="max-h-[50dvh] overflow-y-auto rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-4 text-base leading-relaxed text-[var(--hj-fg)]"
      >
        {boothCase.story}
      </div>

      {phase === "loading" && (
        <p className="py-4 text-center text-sm text-[var(--hj-muted)]">
          Menyelesaikan kasus…
        </p>
      )}

      {showSolve && (
        <button
          type="button"
          onClick={handleSolve}
          disabled={!readEnough}
          className="min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Selesaikan masalah ini!
        </button>
      )}

      {openedWithBadge.current && phase !== "loading" && (
        <p className="text-center text-sm font-medium text-[var(--hj-muted)]">
          Sudah diselesaikan
        </p>
      )}

      {showReveal && (
        <div className="rounded-xl border border-[var(--hj-cyan)] bg-[var(--hj-surface)] px-4 py-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--hj-cyan)]">
            Solusi
          </p>
          <h3 className="mb-2 text-xl font-bold">{boothCase.revealName}</h3>
          <p className="mb-4 text-base leading-relaxed text-[var(--hj-muted)]">
            {boothCase.revealBody}
          </p>
          {boothCase.url && (
            <a
              href={boothCase.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-block text-sm font-medium text-[var(--hj-cyan)] underline"
            >
              Pelajari lebih lanjut →
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 min-h-12 w-full rounded-xl border border-[var(--hj-border)] bg-transparent px-6 py-3 text-base font-semibold transition-opacity active:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
