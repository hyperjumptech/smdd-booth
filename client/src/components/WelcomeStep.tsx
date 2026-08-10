type WelcomeStepProps = {
  onStart: () => void;
};

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="step-enter flex min-h-dvh w-full max-w-full flex-col items-center justify-center px-6 py-12 text-center">
      <img
        src="/hyperjump-logo.png"
        alt="Hyperjump"
        className="mb-10 w-full max-w-full"
      />
      <p className="mb-12 w-full max-w-full text-lg leading-relaxed text-[var(--hj-muted)]">
        Pilih masalah, pecahkan kasusnya, kumpulkan badge.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="min-h-14 w-full max-w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity active:opacity-80"
      >
        Mulai
      </button>
    </div>
  );
}
