import { CASES, MIN_PRODUCT_BADGES, MIN_SERVICE_BADGES } from "@booth/shared";
import { tapFeedback } from "../lib/haptics";

type WelcomeStepProps = {
  onStart: () => void;
};

const STEPS = [
  "Buka barang bukti tiap kasus",
  "Pecahkan kasusnya, dapat badge",
  `Kumpulkan ${MIN_SERVICE_BADGES} Service + ${MIN_PRODUCT_BADGES} Product, klaim doorprize`,
];

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="step-enter flex min-h-dvh w-full flex-col justify-center px-6 py-12">
      <img
        src="/hyperjump-logo.png"
        alt="Hyperjump"
        className="mb-8 w-full max-w-full"
      />

      <p className="hj-mono mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--hj-muted)]">
        Berkas Rahasia
      </p>
      <h1 className="mb-3 text-4xl font-black uppercase leading-none tracking-tight">
        Badge
        <br />
        Detective
      </h1>

      <p className="mb-8 text-base leading-relaxed text-[var(--hj-muted)]">
        <span className="font-bold text-[var(--hj-yellow)]">
          {CASES.length} kasus
        </span>{" "}
        belum terpecahkan. Semuanya masalah nyata yang dialami tim teknologi.
      </p>

      <ol className="mb-10 flex flex-col gap-3">
        {STEPS.map((stepText, index) => (
          <li
            key={stepText}
            className="card-in flex items-start gap-3"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="hj-mono mt-0.5 shrink-0 rounded-full border border-[var(--hj-border)] px-2 py-0.5 text-[11px] font-bold text-[var(--hj-cyan)]">
              {index + 1}
            </span>
            <span className="text-[15px] leading-snug">{stepText}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => {
          tapFeedback();
          onStart();
        }}
        className="pulse-ring min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity active:opacity-80"
      >
        Ambil kasus pertama
      </button>
    </div>
  );
}
