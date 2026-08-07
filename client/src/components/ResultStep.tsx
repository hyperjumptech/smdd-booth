import { RESULTS, type Answer, type Choice } from "@booth/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSubmission } from "../lib/api";
import { saveResultCard } from "../lib/saveCard";
import { ResultCard } from "./ResultCard";

type ResultStepProps = {
  name: string;
  email: string;
  answers: Answer[];
  resultKey: Choice;
  tiebreaker?: Choice;
  onReset: () => void;
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function ResultStep({
  name,
  email,
  answers,
  resultKey,
  tiebreaker,
  onReset,
}: ResultStepProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const firstName = name.trim().split(/\s+/)[0] || name;
  const result = RESULTS[resultKey];

  const doSubmit = useCallback(async () => {
    setSubmitStatus("loading");
    try {
      const submissionAnswers = tiebreaker
        ? [...answers, { questionId: "tiebreaker", choice: tiebreaker }]
        : answers;
      await createSubmission({
        name,
        email,
        answers: submissionAnswers,
        resultKey,
        tiebreaker,
      });
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  }, [name, email, answers, resultKey, tiebreaker]);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    void doSubmit();
  }, [doSubmit]);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setSaveError(null);
    setSaving(true);
    try {
      await saveResultCard(cardRef.current, resultKey);
    } catch {
      setSaveError("Gagal menyimpan kartu. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="step-enter flex min-h-dvh w-full max-w-full flex-col px-6 py-12">
      <div className="mb-6 flex w-full max-w-full justify-center">
        <ResultCard ref={cardRef} firstName={firstName} resultKey={resultKey} />
      </div>

      <p className="mb-6 text-base leading-relaxed text-[var(--hj-muted)]">
        {result.solution}
      </p>

      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 text-center text-[var(--hj-cyan)] underline underline-offset-4"
      >
        Pelajari lebih lanjut →
      </a>

      {submitStatus === "loading" && (
        <p className="mb-4 text-center text-sm text-[var(--hj-muted)]">
          Menyimpan hasil…
        </p>
      )}
      {submitStatus === "error" && (
        <div className="mb-4 text-center">
          <p className="mb-2 text-sm text-red-600">Gagal menyimpan hasil.</p>
          <button
            type="button"
            onClick={() => void doSubmit()}
            className="text-sm font-semibold text-[var(--hj-cyan)] underline underline-offset-4"
          >
            Coba lagi
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="mb-3 min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity active:opacity-80 disabled:opacity-50"
      >
        {saving ? "Menyimpan…" : "Simpan Kartu"}
      </button>
      {saveError && (
        <p className="mb-3 text-center text-sm text-red-600">{saveError}</p>
      )}

      <button
        type="button"
        onClick={onReset}
        className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-8 py-4 text-lg font-semibold shadow-sm transition-colors active:border-[var(--hj-cyan)] active:bg-[rgba(94,200,240,0.12)]"
      >
        Mulai Lagi
      </button>
    </div>
  );
}
