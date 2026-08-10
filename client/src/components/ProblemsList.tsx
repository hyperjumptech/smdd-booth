import { CASES } from "@booth/shared";

export function ProblemsList() {
  return (
    <ul className="flex flex-col gap-3">
      {CASES.map((boothCase) => (
        <li key={boothCase.id}>
          <button
            type="button"
            className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-3 text-left text-base font-medium transition-opacity active:opacity-80"
          >
            {boothCase.painTitle}
          </button>
        </li>
      ))}
    </ul>
  );
}
