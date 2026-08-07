import type { Choice, Question } from "@booth/shared";

const CHOICES: Choice[] = ["A", "B", "C", "D", "E"];

type QuestionStepProps = {
  question: Question;
  index: number;
  total: number;
  onSelect: (choice: Choice) => void;
};

export function QuestionStep({
  question,
  index,
  total,
  onSelect,
}: QuestionStepProps) {
  return (
    <div className="step-enter flex min-h-dvh w-full max-w-full flex-col px-6 py-12">
      <p className="mb-6 text-sm font-medium text-[var(--hj-muted)]">
        {index + 1} / {total}
      </p>
      <h1 className="mb-8 text-2xl font-bold leading-snug">{question.prompt}</h1>
      <div className="flex flex-col gap-3">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(choice)}
            className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-3 text-left text-base shadow-sm transition-colors active:border-[var(--hj-cyan)] active:bg-[rgba(94,200,240,0.12)]"
          >
            <span className="font-semibold text-[var(--hj-cyan)]">
              {choice}.
            </span>{" "}
            {question.options[choice]}
          </button>
        ))}
      </div>
    </div>
  );
}
