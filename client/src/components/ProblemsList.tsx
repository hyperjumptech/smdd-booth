import { CASES, type Badge } from "@booth/shared";

type ProblemsListProps = {
  badges: Badge[];
  onSelectCase: (caseId: string) => void;
};

export function ProblemsList({ badges, onSelectCase }: ProblemsListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {CASES.map((boothCase) => {
        const solved = badges.some((b) => b.caseId === boothCase.id);

        return (
          <li key={boothCase.id}>
            <button
              type="button"
              onClick={() => onSelectCase(boothCase.id)}
              className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-[var(--hj-border)] px-4 py-3 text-left text-base font-medium transition-opacity active:opacity-80 ${
                solved
                  ? "bg-[var(--hj-surface)]/60 text-[var(--hj-muted)]"
                  : "bg-[var(--hj-surface)]"
              }`}
            >
              <span>{boothCase.painTitle}</span>
              {solved && (
                <span
                  className="shrink-0 text-[var(--hj-cyan)]"
                  aria-label="Sudah diselesaikan"
                >
                  ✓
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
