# Current LaneAI App Experience Audit

## MISSING SPECIFICATION DOCUMENTS
**Status: UNSPECIFIED** - Cannot locate canonical spec documents:
- `LaneAI_Phase1_Master_Plan_v3.md` - Not found in repo root or /docs
- `LaneAI_Phase1_ExperienceFlow_v2.md` - Not found in repo root or /docs

Auditing based on current implementation and available refinement requirements.

---

## Current User Journeys (As Implemented)

### 1. New User Signup → Onboarding Flow
**Current Status:** Build error blocking this flow

**Expected Steps (if working):**
1. User visits `/` - renders `src/App.jsx` (lines 24-25: defaults to 'workspace' mode)
2. Onboarding trigger - `src/App.jsx` line 29: `showOnboarding` state
3. Onboarding modal - `src/pages/OnboardingFlow.jsx` (lines 22-385)
   - Step 1: Welcome screen with "Get Started" or "Skip" 
   - Step 2: Venture type selection (4 options: Tech Startup, Service Business, etc.)
   - Step 3: Stage selection (Idea, MVP, Growth, Established)
   - Step 4: Founder DNA (4 taps for decision/money/growth/risk styles)
   - Step 5: Default mode selection (Goal/Workspace/Stream/Playground)
4. Instant aha moment - shows Cashflow worksheet demo
5. Redirect to HQ Dashboard

**Actual Current Behavior:** 
- Build fails due to missing `useAlerts` export from AlertStrip
- Cannot test onboarding flow until build is fixed

### 2. First-time Onboarding Completion → Redirect
**Component:** `src/pages/OnboardingFlow.jsx` lines 125-130
- `handleWorksheetComplete()` function calls `onComplete()` 
- Should redirect to HQ Dashboard (workspace mode)

**Current Issue:** App defaults to workspace mode anyway (line 24 in App.jsx)

### 3. Returning User Login
**Current Behavior:**
- No authentication implemented (frontend-only)
- App loads directly to HQ Dashboard at `/`
- Rendered by `src/App.jsx` → `src/pages/HQDashboard.jsx`

### 4. Create/Open Venture
**Current Implementation:**
- Venture creation UI exists in various modes but no functional create flow
- Portfolio tiles in `src/components/portfolio/PortfolioTiles.jsx` show venture grid
- Clicking tiles should route to individual venture dashboards
- `src/App.jsx` lines 98-101 handle venture routing to `VentureDashboard`

### 5. Create New Worksheet
**Component:** QuickActionsDock button triggers WorksheetRenderer
- `src/components/primitives/QuickActionsDock.jsx` - +Data button
- Opens `src/components/WorksheetRenderer.jsx` in modal
- Default mode: Draft (blue state)

### 6. Edit Worksheet (Input, Save, Draft→Live)
**Component:** `src/components/WorksheetRenderer.jsx`
- Input editing: lines 141-150 (`handleInputChange`)
- Autosave: lines 156-163 (`handleSave`)
- Draft→Live promotion: lines 164-173 (`handlePromoteToLive`, `confirmPromotion`)
- Uses `PromotionGate` modal for state transition

### 7. AI Chat (Orb/Command Bar)
**Components:**
- AI Orb: `src/components/chat/AIChat.jsx` lines 7-180 (`AIChatShell`)
- Command Bar: lines 181-220 (`CommandBar`)
- Global shortcut: `src/App.jsx` lines 44-47 (Cmd+K)
- All AI calls use `aiClientStub()` - returns placeholder responses

### 8. Locked Feature → Upgrade Modal
**Components:**
- `src/components/primitives/LockWrapper.jsx` - wraps paywalled features
- Clicking triggers `src/components/modals/UpgradeModal.jsx`
- Shows 3 plans: Founders ($9), Pro ($15), Enterprise (coming soon)
- Integration: `src/App.jsx` lines 52-55 global event listener

### 9. CSV Import Flow
**Status:** MISSING - Stubbed only
- Mentioned in WorksheetRenderer but no actual implementation
- Would need `CsvUploadModal` and `CsvMappingModal` components

### 10. Export (Single + Export-All)
**Status:** STUBBED
- Export buttons exist in UI but call stub functions
- Single worksheet export: `exportCsv()` stub
- Export-All: shown as blurred/locked for paywall

---

## Build Status & Errors

### Current Build Error:
```
"useAlerts" is not exported by "src/components/notifications/AlertStrip.jsx"
```
**File:** `src/App.jsx` line 8
**Fix:** Need to export `useAlerts` hook from AlertStrip component

### Console Warnings:
- No console logs available due to build failure

---

## Component File Mapping

### Main Pages:
- **HQ Dashboard:** `src/pages/HQDashboard.jsx` (271 lines)
- **Onboarding:** `src/pages/OnboardingFlow.jsx` (397 lines) 
- **Venture Hub:** `src/components/dashboards/VentureDashboard.jsx`

### Core Components:
- **App Router:** `src/App.jsx` (217 lines)
- **Worksheet Renderer:** `src/components/WorksheetRenderer.jsx` (366 lines)
- **KPI Cards:** `src/components/primitives/KpiCard.jsx` 
- **QuickDock:** `src/components/primitives/QuickActionsDock.jsx`
- **Alert Strip:** `src/components/notifications/AlertStrip.jsx`

### Modal/Overlay System:
- **Upgrade Modal:** `src/components/modals/UpgradeModal.jsx`
- **Promotion Gate:** `src/components/modals/PromotionGate.jsx`
- **Founder Mode:** `src/components/overlays/FounderMode.jsx`

---

## Missing Critical Components
1. CSV import/export functionality
2. Real authentication system
3. Backend integration stubs not implemented
4. Mobile responsive testing needed