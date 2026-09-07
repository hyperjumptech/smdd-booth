import {
  canSubmitBadges,
  countKinds,
  MIN_PRODUCT_BADGES,
  MIN_SERVICE_BADGES,
  type Badge,
} from "@booth/shared";
import { badgesToNextRank, getRank, TOTAL_CASES } from "../lib/rank";

type ProgressHudProps = {
  name: string;
  badges: Badge[];
};

type MeterProps = {
  label: string;
  earned: number;
  required: number;
  colorVariable: string;
};

function Meter({ label, earned, required, colorVariable }: MeterProps) {
  const slots = Array.from({ length: required }, (_, index) => index);
  const done = earned >= required;

  return (
    <div className="flex items-center gap-2">
      <span className="hj-mono text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
        {label}
      </span>
      <div className="flex gap-1">
        {slots.map((slot) => (
          <span
            key={slot}
            className="h-1.5 w-5 rounded-full transition-colors duration-300"
            style={{
              backgroundColor:
                slot < earned ? colorVariable : "rgba(255,255,255,0.14)",
            }}
          />
        ))}
      </div>
      {done && (
        <span
          className="hj-mono text-[10px] font-bold"
          style={{ color: colorVariable }}
        >
          OK
        </span>
      )}
    </div>
  );
}

export function ProgressHud({ name, badges }: ProgressHudProps) {
  const counts = countKinds(badges);
  const eligible = canSubmitBadges(badges);
  const rank = getRank(badges.length);
  const remaining = badgesToNextRank(badges.length);
  const detectiveName = name.trim() || "Detektif";

  return (
    <div className="hj-dossier rounded-2xl border border-[var(--hj-border)] bg-[var(--hj-surface)]/80 px-4 py-3 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="hj-mono text-[10px] uppercase tracking-[0.2em] text-[var(--hj-muted)]">
            Detektif Bertugas
          </p>
          <p className="truncate text-base font-bold">{detectiveName}</p>
          <p
            key={rank.title}
            className="rank-pop mt-0.5 inline-block text-sm font-semibold text-[var(--hj-cyan)]"
          >
            {rank.title}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="hj-mono text-2xl font-bold leading-none">
            {badges.length}
            <span className="text-sm text-[var(--hj-muted)]">/{TOTAL_CASES}</span>
          </p>
          <p className="hj-mono mt-1 text-[10px] uppercase tracking-widest text-[var(--hj-muted)]">
            Kasus tutup
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--hj-border)] pt-3">
        <Meter
          label="Service"
          earned={counts.service}
          required={MIN_SERVICE_BADGES}
          colorVariable="var(--hj-cyan)"
        />
        <Meter
          label="Product"
          earned={counts.product}
          required={MIN_PRODUCT_BADGES}
          colorVariable="var(--hj-amber)"
        />
      </div>

      {eligible ? (
        <p className="hj-mono mt-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hj-yellow)]">
          Syarat lengkap, buka tab Badges
        </p>
      ) : (
        remaining > 0 && (
          <p className="mt-3 text-[11px] text-[var(--hj-muted)]">
            {remaining} kasus lagi untuk naik pangkat
          </p>
        )
      )}
    </div>
  );
}
