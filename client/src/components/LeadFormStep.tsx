import { useState, type FormEvent } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadFormStepProps = {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
};

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function isFormValid(name: string, email: string): boolean {
  return name.trim().length > 0 && isValidEmail(email);
}

export function LeadFormStep({
  name,
  email,
  onNameChange,
  onEmailChange,
  onSubmit,
}: LeadFormStepProps) {
  const [touched, setTouched] = useState({ name: false, email: false });
  const [submitted, setSubmitted] = useState(false);

  const nameError =
    (touched.name || submitted) && name.trim().length === 0
      ? "Nama wajib diisi"
      : null;
  const emailError =
    (touched.email || submitted) && !isValidEmail(email)
      ? "Format email tidak valid"
      : null;

  const canSubmit = isFormValid(name, email);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <div className="step-enter flex min-h-dvh w-full max-w-full flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">Kenalan dulu, yuk</h1>
      <p className="mb-8 text-[var(--hj-muted)]">
        Isi data kamu supaya kami bisa kirim hasil rekomendasi.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div>
          <label htmlFor="lead-name" className="mb-2 block text-sm font-medium">
            Nama
          </label>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 text-base text-[var(--hj-fg)] shadow-sm outline-none focus:border-[var(--hj-cyan)]"
            placeholder="Nama lengkap"
          />
          {nameError && (
            <p className="mt-2 text-sm text-[var(--hj-yellow)]">{nameError}</p>
          )}
        </div>

        <div>
          <label htmlFor="lead-email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="lead-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            className="min-h-14 w-full rounded-xl border border-[var(--hj-border)] bg-[var(--hj-surface)] px-4 text-base text-[var(--hj-fg)] shadow-sm outline-none focus:border-[var(--hj-cyan)]"
            placeholder="nama@perusahaan.com"
          />
          {emailError && (
            <p className="mt-2 text-sm text-[var(--hj-yellow)]">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="min-h-14 w-full rounded-xl bg-[var(--hj-cyan)] px-8 py-4 text-lg font-semibold text-[var(--hj-on-accent)] transition-opacity enabled:active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Lanjut
        </button>
      </form>
    </div>
  );
}
