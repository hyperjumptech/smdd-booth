# Booth Badge Detective — Design Spec

**Date:** 2026-08-10  
**Project:** smdd-booth-2026  
**Status:** Approved  
**Supersedes:** Quiz A–E recommendation flow in `2026-08-07-booth-quiz-design.md` (stack/hosting/admin auth still apply unless noted)

## Goal

Booth experience where visitors play **detective**: pick **problems** (pain-first cases), read the story, “solve” them, and earn **badges**. Each badge reveals a Hyperjump **service** or **product**. Staff give a physical **stamp** (doorprize) after the visitor **submits** and shows the Badges tab.

**Minimum for submit / stamp eligibility:** ≥ **2 service** badges + ≥ **1 product** badge.

## Constraints & decisions

| Topic | Decision |
| --- | --- |
| Stack / host | Unchanged: Vite React SPA + Hono + SQLite, Docker/VPS |
| Metaphor | Detective — “Kamu mau nyelesaiin masalah apa?” |
| Navigation | Two tabs: **Problems** \| **Badges** |
| Catalog UI | Mixed case list — **no** Service/Product labels on the list |
| Reveal | Only after story read + “Selesaikan masalah ini!” |
| Lead capture | Name + email **before** explore |
| Submit payload | Name, email, **all** earned badges (no favorite-picking step) |
| Submit gate | Disabled until 2 service + 1 product |
| Stamp verify | Staff look at visitor phone Badges tab (“Siap stamp”) |
| Progress | `localStorage` until submit; then server row |
| Old quiz | **Removed** (questions A–E, tiebreaker, PNG result card) |
| Brand / UX | Dark Hyperjump theme; mobile-first |

## Visitor flow

1. Scan booth QR → welcome (short detective framing).
2. Lead form (nama + email) → required.
3. **Problems** tab: mixed list of cases by `painTitle` only. Completed cases marked.
4. Open case → scrollable **story**. Primary CTA **“Selesaikan masalah ini!”** stays disabled until scroll ≈ **90%** of story height.
5. Tap CTA → short loading → **reveal**: `revealName` + `revealBody` (+ optional site URL). Earn badge once.
6. Close → pick another case. Re-open completed cases = read-only, no second badge.
7. **Badges** tab: each badge shows `revealName` + label `Service` \| `Product`; counters `Service x/2 · Product x/1`.
8. **Submit** enabled only when counters met → POST lead + badges.
9. On success → **Siap stamp**. Staff check phone → physical stamp.

## Case content model

Each case in shared content:

| Field | Purpose |
| --- | --- |
| `id` | Stable id (e.g. `cto-as-a-service`) |
| `kind` | `service` \| `product` (hidden in Problems list) |
| `painTitle` | List headline (pain / mystery) |
| `story` | Long-form narrative (pain storytelling) |
| `revealName` | Official Hyperjump name after solve |
| `revealBody` | Who it’s for + what it solves |
| `url` | Optional link to hyperjump.tech page |

**Scope:** All curated Hyperjump services **and** products that booth wants to teach — each as one case. List order may be shuffled or fixed; kinds stay mixed so visitors discover type only at reveal.

## Client UX

- Tabs: Problems | Badges (after lead).
- Problems: pain titles; visual “solved” state.
- Case detail: story scroller + gated solve button + reveal modal/screen.
- Badges: list with kind labels; progress toward 2+1; Submit; post-submit **Siap stamp** state.
- Optional “Mulai Lagi”: clear local badges (lead may prefill from storage).

## Data

### localStorage (pre-submit)

- `name`, `email`
- `badges[]`: `{ caseId, kind, revealName }`
- `submitted` boolean (and maybe server id)

### API

Replace quiz submission with badge submission, e.g. `POST /api/submissions`:

```json
{
  "name": "…",
  "email": "…",
  "badges": [
    { "caseId": "cto-as-a-service", "kind": "service", "revealName": "CTO-as-a-Service" }
  ]
}
```

Server validates email, non-empty name, and **at least 2 badges with kind service and 1 with kind product**. Persist JSON badges + derived counts/labels for admin.

Admin: list + CSV with name, email, badges (and kinds), created_at. Expand row to see full badge list. Pagination (e.g. 10/page) remains.

Auth / env (`ADMIN_PASSWORD`, `SESSION_SECRET`) unchanged.

## What we drop

- 7-question A–E quiz, scoring, tiebreaker  
- Single recommended-service result + PNG “Simpan Kartu” flow  
- Admin views of quiz answers  

## Success criteria

- Visitor can complete 2 service + 1 product cases without seeing kind on the problem list.
- Cannot submit early; can submit once eligible; Badges shows **Siap stamp**.
- Staff can verify kinds on Badges tab at a glance.
- Admin receives lead + full badge set for curation/follow-up.
- Works on mobile; deploy path remains Docker / compose on VPS.

## Open for implementation (non-blocking)

- Exact case copy and final product/service inventory in content file  
- Shuffle vs fixed Problems order  
- Exact loading animation / reveal motion  
- Whether `url` is shown as CTA on reveal  

## Out of scope

- Digital stamp / QR staff scanner  
- Favorite-picking or ranking UI  
- Separate Services vs Products tabs  
- Netlify Docker hosting  
