import { RESULTS, type Choice } from "@booth/shared";
import { forwardRef } from "react";

type ResultCardProps = {
  firstName: string;
  resultKey: Choice;
};

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard({ firstName, resultKey }, ref) {
    const result = RESULTS[resultKey];

    return (
      <div
        ref={ref}
        className="box-border flex w-full max-w-full shrink-0 flex-col justify-between rounded-md border-[3px] border-solid border-white bg-[var(--hj-card)] p-8 text-left"
        style={{ aspectRatio: "1080 / 1350" }}
      >
        <div>
          <img
            src="/hyperjump-logo.png"
            alt="Hyperjump"
            className="mb-6 w-full max-w-full"
          />
          <p className="mb-4 text-sm text-[#a3a3a3]">Untuk {firstName}</p>
          <h2 className="mb-3 text-2xl font-bold leading-tight text-[#5ec8f0]">
            {result.service}
          </h2>
          <p className="mb-4 text-base font-semibold leading-snug text-[#f5d547]">
            {result.tagline}
          </p>
          <p className="text-base leading-relaxed text-white">
            {result.diagnosis}
          </p>
        </div>

        <div className="border-t border-white/15 pt-4 text-center">
          <p className="text-lg font-bold tracking-wide text-white">
            hyperjump.tech
          </p>
          <p className="mt-1 text-xs text-[#a3a3a3]">SMDD 2026</p>
        </div>
      </div>
    );
  },
);
