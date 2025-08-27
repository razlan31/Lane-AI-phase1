# Lane AI — Phase 1 Plan

This document tracks the exact scope, progress, and next steps for building **Lane AI Phase 1**.  
It is the **single source of truth** — always up to date with what’s done and what’s pending.

---

## 🎯 Phase 1 Objective
A working app where an entrepreneur can:
1. Run **ROI, Breakeven, and Cashflow worksheets**.
2. Save results into **Supabase**.
3. See results in **AI HQ timeline**.
4. Export results as **PDF/HTML snapshot**.
5. Use clean, guided flows (not all 130 blocks exposed).

This Phase proves the concept end-to-end.

---

## ✅ Completed so far
- **Supabase backend**
  - Tables created (`worksheets`, `timeline_events`, `ai_audit`)
  - Row-level security (RLS) policies configured
  - Verified inserts (worksheet + timeline) via scripts

- **Scripts**
  - `tests/roi.test.js` (ROI unit tests) → ✅ passed
  - `scripts/verify_run.cjs` (inserts ROI + timeline) → ✅ works
  - `scripts/export_snapshot.cjs` (exports HTML + JSON, PDF optional) → ✅ smoke test works
  - Artifacts verified: `artifacts/roi_response.json`, `artifacts/smoke_test.html`, `artifacts/verification_report.json`

- **Frontend boot**
  - App runs locally with `npm run dev`
  - AI HQ Timeline component added
  - ROI Worksheet component updated (needs wiring to Supabase)

---

## 🚧 In Progress
- **Frontend wiring**
  - ROI form → compute → **save to Supabase**
  - Timeline **auto-refresh** after save
  - **Export** button (link to snapshot)

---

## 📝 Next Steps
1. **Frontend Integration**
   - [ ] Wire ROIWorksheet → Supabase save
   - [ ] Confirm AI HQ Timeline displays live results
   - [ ] Add Export button → trigger snapshot

2. **Extend to Other Worksheets**
   - [ ] Duplicate ROI flow for **Breakeven**
   - [ ] Duplicate ROI flow for **Cashflow**

3. **Final Verification**
   - [ ] Run all tests locally (unit + verify + export)
   - [ ] End-to-end run: ROI → Save → Timeline → Export
   - [ ] Push to GitHub & confirm Lovable preview works

---

## 🔒 Rule of Work
- **No sidetracks.** Only add items if they are **crucial** for completeness of Phase 1.
- **Single-Action Mode.** I give **one action at a time**, with:
  - **Where** to run it (path or UI location).
  - **How** to run it (exact command or click path).
  - **Copy blocks contain only commands/content** — no comments, no placeholders.
- **Stop & Inspect.** After any action that produces output, we **stop** so I can read results/errors before the next step.
- **Consistency.** After any code change, we keep docs updated here and push to GitHub.
- **Verification loop.** When required, we use the local triad:
  - `npx vitest run`
  - `node scripts/verify_run.cjs`
  - `node scripts/export_snapshot.cjs`
- **Copy-block rule (new):** Any block I give you that is inside triple-backticks must be **fully pasteable without edits** — if it appears in the block, you must copy & paste the entire block exactly as-is. No placeholders, no manual replacements, no inline edits.
- This file must be updated at every milestone.
