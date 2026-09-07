import { CASES } from "@booth/shared";

export type Rank = {
  title: string;
  minBadges: number;
};

export const TOTAL_CASES = CASES.length;

const RANKS: Rank[] = [
  { title: "Rekrut Baru", minBadges: 0 },
  { title: "Detektif Magang", minBadges: 1 },
  { title: "Detektif", minBadges: 3 },
  { title: "Detektif Senior", minBadges: 5 },
  { title: "Inspektur", minBadges: 8 },
  { title: "Kepala Inspektur", minBadges: 12 },
  { title: "Legenda Booth", minBadges: TOTAL_CASES },
];

export function getRank(badgeCount: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (badgeCount >= rank.minBadges) {
      current = rank;
    }
  }

  return current;
}

export function getNextRank(badgeCount: number): Rank | undefined {
  return RANKS.find((rank) => rank.minBadges > badgeCount);
}

export function badgesToNextRank(badgeCount: number): number {
  const next = getNextRank(badgeCount);
  if (!next) {
    return 0;
  }

  return next.minBadges - badgeCount;
}
