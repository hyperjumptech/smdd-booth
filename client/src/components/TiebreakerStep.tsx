import { RESULTS, type Choice } from "@booth/shared";

type TiebreakerStepProps = {
  leaders: Choice[];
  onSelect: (choice: Choice) => void;
};

export function TiebreakerStep({ leaders, onSelect }: TiebreakerStepProps) {
  return (
    <div className="step-enter flex min-h-dvh w-full max-w-full flex-col px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold leading-snug">
        Mana yang paling urgensi buat kamu selesaikan sekarang?
      </h1>
      <div className="flex flex-col gap-3">
        {leaders.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onSelect(choice)}
            className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 py-4 text-left text-lg font-semibold shadow-sm transition-colors active:border-[var(--hj-cyan)] active:bg-[rgba(94,200,240,0.12)]"
          >
            {choice} — {RESULTS[choice].service}
          </button>
        ))}
      </div>
    </div>
  );
}
