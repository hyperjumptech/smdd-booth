import { useState } from "react";
import { getCaseNumber, type BoothCase } from "@booth/shared";
import { Confetti } from "./Confetti";
import { successFeedback, tapFeedback } from "../lib/haptics";
import { useCelebration } from "../hooks/useCelebration";

type Phase = "clues" | "analyzing" | "reveal";

type CaseDetailProps = {
  boothCase: BoothCase;
  hasBadge: boolean;
  earnBadge: (caseId: string) => void;
  onClose: () => void;
};

const ANALYZE_DELAY_MS = 1100;

function kindLabel(kind: BoothCase["kind"]): string {
  return kind === "service" ? "Service" : "Product";
}

function accentColor(kind: BoothCase["kind"]): string {
  return kind === "service" ? "var(--hj-cyan)" : "var(--hj-amber)";
}

export function CaseDetail({
  boothCase,
  hasBadge,
  earnBadge,
  onClose,
}: CaseDetailProps) {
  const totalClues = boothCase.clues.length;
  const [revealedClues, setRevealedClues] = useState(hasBadge ? totalClues : 1);
  const [phase, setPhase] = useState<Phase>(hasBadge ? "reveal" : "clues");
  const [justSolved, setJustSolved] = useState(false);
  const { targetRef, celebrating } = useCelebration(justSolved);

  const allCluesOpen = revealedClues >= totalClues;
  const accent = accentColor(boothCase.kind);
  const caseNumber = String(getCaseNumber(boothCase.id)).padStart(2, "0");

  function handleNextClue() {
    tapFeedback();
    setRevealedClues((previous) => Math.min(previous + 1, totalClues));
  }

  function handleSolve() {
    if (!allCluesOpen || hasBadge) return;
    tapFeedback();
    setPhase("analyzing");
    window.setTimeout(() => {
      earnBadge(boothCase.id);
      successFeedback();
      setJustSolved(true);
      setPhase("reveal");
    }, ANALYZE_DELAY_MS);
  }

  return (
    <div className="relative flex flex-col gap-4">
      <button
        type="button"
        onClick={onClose}
        className="flex min-h-10 items-center gap-1 self-start text-sm font-medium text-[var(--hj-cyan)] transition-opacity active:opacity-80"
      >
        ← Kembali ke daftar kasus
      </button>

      <div className="flex items-center gap-2">
        <span className="hj-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--hj-muted)]">
          Kasus #{caseNumber}
        </span>
        <span
          className="hj-mono rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {kindLabel(boothCase.kind)}
        </span>
      </div>

      <h2 className="text-2xl font-bold leading-tight">{boothCase.painTitle}</h2>

      <blockquote
        className="border-l-2 pl-4 text-lg italic leading-snug text-[var(--hj-fg)]"
        style={{ borderColor: accent }}
      >
        “{boothCase.hook}”
      </blockquote>

      <div className="hj-dossier rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-4">
        <p className="hj-mono mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--hj-muted)]">
          Barang bukti {Math.min(revealedClues, totalClues)}/{totalClues}
        </p>

        <ul className="flex flex-col gap-3">
          {boothCase.clues.slice(0, revealedClues).map((clue, index) => (
            <li key={clue} className="clue-in flex gap-3">
              <span
                className="hj-mono mt-0.5 shrink-0 text-[11px] font-bold"
                style={{ color: accent }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[15px] leading-snug">{clue}</span>
            </li>
          ))}
        </ul>

        {!allCluesOpen && phase === "clues" && (
          <button
            type="button"
            onClick={handleNextClue}
            className="mt-4 min-h-12 w-full rounded-lg border border-dashed border-[var(--hj-border)] px-4 text-sm font-semibold text-[var(--hj-muted)] transition-opacity active:opacity-70"
          >
            Buka barang bukti berikutnya
          </button>
        )}
      </div>

      {phase === "analyzing" && (
        <div
          className="rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-5"
          role="status"
          aria-live="polite"
        >
          <p className="hj-mono mb-3 text-center text-xs uppercase tracking-[0.2em] text-[var(--hj-muted)]">
            Mencocokkan bukti…
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
            <div
              className="scan-sweep h-full w-1/4 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>
        </div>
      )}

      {!hasBadge && phase === "clues" && (
        <button
          type="button"
          onClick={handleSolve}
          disabled={!allCluesOpen}
          className={`min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 ${
            allCluesOpen ? "pulse-ring" : ""
          }`}
        >
          {allCluesOpen ? "Pecahkan kasus ini!" : "Buka semua bukti dulu"}
        </button>
      )}

      {phase === "reveal" && (
        <div ref={targetRef} className="relative">
          {celebrating && <Confetti />}

          <div
            className="reveal-in relative overflow-hidden rounded-xl border-2 px-4 py-5"
            style={{ borderColor: accent, backgroundColor: "var(--hj-surface)" }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p
                className="hj-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                Kasus terpecahkan
              </p>
              <span
                className={`hj-mono shrink-0 rounded border-2 border-[var(--hj-red)] px-2 py-1 text-center text-[10px] font-black uppercase leading-tight tracking-widest text-[var(--hj-red)] ${
                  celebrating ? "stamp-slam" : ""
                }`}
                style={
                  celebrating ? undefined : { transform: "rotate(-8deg)" }
                }
              >
                Badge
                <br />
                Didapat
              </span>
            </div>

            <h3 className="mb-2 text-2xl font-bold leading-tight">
              {boothCase.revealName}
            </h3>
            <p className="mb-4 text-[15px] leading-relaxed text-[var(--hj-muted)]">
              {boothCase.revealBody}
            </p>

            {boothCase.url && (
              <a
                href={boothCase.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-block text-sm font-medium underline underline-offset-4"
                style={{ color: accent }}
              >
                Pelajari lebih lanjut →
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                tapFeedback();
                onClose();
              }}
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--hj-border)] bg-transparent px-6 py-3 text-base font-semibold transition-opacity active:opacity-80"
            >
              Selidiki kasus lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
