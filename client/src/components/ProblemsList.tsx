import { useState } from "react";
import { CASES, type Badge, type CaseKind } from "@booth/shared";
import { tapFeedback } from "../lib/haptics";

type ProblemsListProps = {
  badges: Badge[];
  onSelectCase: (caseId: string) => void;
};

type KindFilter = "all" | CaseKind;

const FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "service", label: "Service" },
  { value: "product", label: "Product" },
];

function kindLabel(kind: CaseKind): string {
  return kind === "service" ? "Service" : "Product";
}

function kindChipClass(kind: CaseKind): string {
  return kind === "service"
    ? "bg-[rgba(94,200,240,0.14)] text-[var(--hj-cyan)]"
    : "bg-[rgba(255,180,80,0.14)] text-[var(--hj-amber)]";
}

export function ProblemsList({ badges, onSelectCase }: ProblemsListProps) {
  const [filter, setFilter] = useState<KindFilter>("all");
  const visibleCases = CASES.filter(
    (boothCase) => filter === "all" || boothCase.kind === filter,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {FILTERS.map((option) => {
          const active = filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                tapFeedback();
                setFilter(option.value);
              }}
              className={`hj-mono min-h-9 rounded-full border px-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                active
                  ? "border-[var(--hj-cyan)] bg-[rgba(94,200,240,0.12)] text-[var(--hj-cyan)]"
                  : "border-[var(--hj-border)] text-[var(--hj-muted)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-3">
        {visibleCases.map((boothCase, index) => {
          const caseNumber = CASES.indexOf(boothCase) + 1;
          const solved = badges.some((badge) => badge.caseId === boothCase.id);
          const paddedNumber = String(caseNumber).padStart(2, "0");
          const animationDelay = `${Math.min(index, 8) * 35}ms`;

          return (
            <li key={boothCase.id} className="card-in" style={{ animationDelay }}>
              <button
                type="button"
                onClick={() => {
                  tapFeedback();
                  onSelectCase(boothCase.id);
                }}
                className={`hj-dossier relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-transform active:scale-[0.985] ${
                  solved
                    ? "border-[var(--hj-border)] bg-[var(--hj-surface)]/50"
                    : "border-[var(--hj-border)] bg-[var(--hj-surface)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-1 ${
                    solved
                      ? "bg-[rgba(255,255,255,0.12)]"
                      : boothCase.kind === "service"
                        ? "bg-[var(--hj-cyan)]"
                        : "bg-[var(--hj-amber)]"
                  }`}
                />

                <div className="flex items-center justify-between gap-2 pl-2">
                  <span className="hj-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--hj-muted)]">
                    Kasus #{paddedNumber}
                  </span>
                  <span
                    className={`hj-mono shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${kindChipClass(
                      boothCase.kind,
                    )}`}
                  >
                    {kindLabel(boothCase.kind)}
                  </span>
                </div>

                <p
                  className={`mt-1 pl-2 text-base font-semibold leading-snug ${
                    solved ? "text-[var(--hj-muted)]" : "text-[var(--hj-fg)]"
                  }`}
                >
                  {boothCase.painTitle}
                </p>

                <div className="mt-2 flex items-center justify-between gap-2 pl-2">
                  {solved ? (
                    <span className="hj-mono text-[11px] font-bold uppercase tracking-widest text-[var(--hj-cyan)]">
                      Terpecahkan
                    </span>
                  ) : (
                    <span className="hj-mono text-[11px] uppercase tracking-widest text-[var(--hj-muted)]">
                      {boothCase.clues.length} petunjuk
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className={
                      solved
                        ? "text-[var(--hj-cyan)]"
                        : "text-[var(--hj-muted)]"
                    }
                  >
                    {solved ? "✓" : "→"}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
