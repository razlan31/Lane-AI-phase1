# Current LaneAI App Experience Audit

## SPECIFICATION DOCUMENTS STATUS
**❌ CRITICAL LIMITATION:** Cannot locate canonical specification documents
- **Missing:** `LaneAI_Phase1_Master_Plan_v3.md` - Searched repo root, /docs, /mnt/data
- **Missing:** `LaneAI_Phase1_ExperienceFlow_v2.md` - Searched repo root, /docs, /mnt/data  
- **Available:** `docs/MVP_Spec.md`, `docs/phase1_plan.md` (older/different specs)
- **Impact:** Audit based on observable current state + available refinement requirements

---

## Current Build Status
**❌ HMR ERRORS DETECTED:**
```
[hmr] Failed to reload /src/components/notifications/AlertStrip.jsx. This could be due to syntax errors or importing non-existent modules.
```
**Impact:** App may have runtime instability despite successful build

---

## Current User Journeys (Actual Behavior)

### 1. New User Signup → Onboarding Flow
**Current Status:** No authentication system implemented

**Expected Flow (if triggered):**
1. **Route:** App loads at `/` - defaults to workspace mode (`src/App.jsx:24`)
2. **Onboarding Trigger:** `showOnboarding` state in `src/App.jsx:30` 
3. **Onboarding Modal:** `src/pages/OnboardingFlow.jsx:22-389`
   - **Screen 1:** Welcome with "Get Started" or "Skip for now" buttons
   - **Screen 2:** Venture type selection (4 cards: Tech Startup, Service Business, Retail/E-commerce, Consulting)
   - **Screen 3:** Stage selection (4 options: Idea Stage, MVP/Early, Growth Stage, Established)
   - **Screen 4:** Founder DNA (4 sections: Decision Style, Money Style, Growth Style, Risk Appetite)
   - **Screen 5:** Default Mode selection (Goal Mode recommended, others: Workspace, Stream, Playground)
4. **Instant Aha:** Cashflow worksheet demo (`src/pages/OnboardingFlow.jsx:323-364`)
5. **Completion:** Calls `onComplete()` → should redirect to HQ Dashboard

**Actual Current Behavior:** 
- No authentication - app loads directly to HQ Dashboard
- Onboarding can be manually triggered but no automatic new user flow

### 2. First-time Onboarding Completion → Redirect
**Component:** `src/pages/OnboardingFlow.jsx:125-130`
**Current Flow:**
- `handleWorksheetComplete()` closes worksheet modal
- Calls `onComplete()` prop from parent
- **Expected:** Redirect to HQ Dashboard
- **Actual:** App already defaults to HQ Dashboard (workspace mode)

### 3. Returning User Login  
**Current Status:** No authentication system
**Actual Behavior:**
- App loads directly to HQ Dashboard at `/`
- Rendered by `src/App.jsx` → `src/pages/HQDashboard.jsx`
- No login/logout functionality exists

### 4. Create/Open Venture
**Current Implementation:**
- **Portfolio Section:** `src/components/portfolio/PortfolioTiles.jsx` renders venture grid
- **Venture Creation:** No "Create New Venture" flow implemented
- **Venture Access:** Clicking tiles routes to `VentureDashboard` (`src/App.jsx:98-101`)
- **Mock Data:** Two ventures hardcoded: "Coffee Kiosk" and "Tech Startup" (`src/App.jsx:32-35`)

**Visible UI Elements:**
- Portfolio tiles with venture names
- Click → routes to individual venture dashboard

### 5. Create New Worksheet
**Current Flow:**
1. **Trigger:** QuickActionsDock "+Data" button (`src/components/primitives/QuickActionsDock.jsx`)
2. **Modal:** Opens `src/components/WorksheetRenderer.jsx` 
3. **Default State:** Draft mode (blue styling)
4. **Worksheet Types:** Uses mock configs (`src/components/WorksheetRenderer.jsx:22-70`)
   - Cashflow Analysis (default)
   - Mock data includes: Monthly Revenue, Monthly Expenses, One-time Revenue/Expenses

**UI Elements:**
- "+Data" button in floating dock
- Modal with worksheet form
- Blue "Draft" indicator

### 6. Edit Worksheet (Input, Save, Draft→Live)
**Component:** `src/components/WorksheetRenderer.jsx`
**Current Flow:**
1. **Input Fields:** Editable inputs for revenue/expenses (`lines 141-150: handleInputChange`)
2. **Autosave:** Triggers on input change with 2s delay (`lines 156-163: handleSave`)
3. **Autosave Banner:** Shows "Saved draft locally" message
4. **Draft→Live:** "Promote to Live" button (`lines 164-173`)
5. **Promotion Gate:** Confirmation modal (`src/components/modals/PromotionGate.jsx`)
6. **State Change:** Draft (blue) → Live (green) styling

**UI Elements:**
- Editable input fields with currency formatting
- "Save", "View History", "Promote to Live" buttons
- State indicator badges
- Autosave status banner

### 7. Use AI Chat (Orb/Command Bar)
**Components:**
- **AI Orb:** Floating chat icon (`src/components/chat/AIChat.jsx:7-180`)
- **Command Bar:** Keyboard shortcut Cmd+K (`src/App.jsx:44-47`)
- **Chat Interface:** Modal with conversation history
- **AI Integration:** All calls use `aiClientStub()` - returns placeholder responses
- **Context:** Prefilled with current page context

**Current Behavior:**
- Chat orb always visible
- Opens modal with "AI not connected in Phase-1 — this is a UI stub"
- Command bar accessible via Cmd+K

### 8. Locked Feature → Upgrade Modal
**Current Flow:**
1. **LockWrapper:** Wraps paywalled features (`src/components/primitives/LockWrapper.jsx`)
2. **Visual State:** Blurred content with lock icon overlay
3. **Click Trigger:** Custom event to App.jsx (`src/App.jsx:52-55`)
4. **Upgrade Modal:** 3-tier pricing display (`src/components/modals/UpgradeModal.jsx`)
   - **Founders:** $9/month or $86/year (Most Popular)
   - **Pro:** $15/month or $144/year
   - **Enterprise:** Coming Soon
5. **Plan Selection:** Calls `stripeClientStub` (placeholder)

**UI Elements:**
- Blurred/locked content with "Click to upgrade" message
- Pricing modal with plan comparison
- "Continue with Free Plan" option

### 9. CSV Import Flow
**Status:** ❌ NOT IMPLEMENTED
- **References:** Mentioned in WorksheetRenderer but no actual UI
- **Missing Components:** `CsvUploadModal`, `CsvMappingModal`
- **File:** `src/components/WorksheetRenderer.jsx` - import functionality stubbed only

### 10. Export (Single Worksheet and Export-All)
**Single Worksheet Export:**
- **Component:** `src/components/WorksheetRenderer.jsx` export button
- **Current:** Calls `exportCsv()` stub function
- **Status:** UI exists but non-functional

**Export-All:**
- **Location:** Reports page, Global export buttons
- **Current:** Shown as blurred/locked for paywall
- **Status:** UI placeholder only

---

## Runtime Errors & Console Warnings

### Console Errors Observed:
```
[hmr] Failed to reload /src/components/notifications/AlertStrip.jsx. 
This could be due to syntax errors or importing non-existent modules.
```

### Build Status:
- **Build:** Appears successful (app loads)
- **HMR Issues:** Hot reload failing for AlertStrip component
- **Impact:** Development workflow impacted, potential runtime instability

---

## Component File Mapping

### Main Application Flow:
- **App Entry:** `src/App.jsx` (217 lines) - Main router and state management
- **Default Route:** HQ Dashboard at `/` (workspace mode)

### Primary Pages:
- **HQ Dashboard:** `src/pages/HQDashboard.jsx` (271 lines)
- **Onboarding:** `src/pages/OnboardingFlow.jsx` (389 lines)
- **Venture Hub:** `src/components/dashboards/VentureDashboard.jsx`

### Core Components:
- **Worksheet Renderer:** `src/components/WorksheetRenderer.jsx` (366 lines)
- **KPI Cards:** `src/components/primitives/KpiCard.jsx`
- **QuickDock:** `src/components/primitives/QuickActionsDock.jsx`
- **Alert Strip:** `src/components/notifications/AlertStrip.jsx` (HMR issues)

### Navigation:
- **TopBar:** `src/components/navigation/TopBar.jsx`
- **Sidebar:** `src/components/navigation/Sidebar.jsx`

### Modal System:
- **Upgrade Modal:** `src/components/modals/UpgradeModal.jsx`
- **Promotion Gate:** `src/components/modals/PromotionGate.jsx`
- **AI Chat:** `src/components/chat/AIChat.jsx`

### Missing Critical Components:
1. **Authentication system** - No login/signup components
2. **CSV Import modals** - Referenced but not implemented
3. **Real export functionality** - Stubs only
4. **Backend integration** - All client calls are stubs

---

## Data Flow & State Management

### Current State:
- **Local State:** Component-level useState for most features
- **No Global State:** No Redux/Context for shared state
- **Mock Data:** Hardcoded ventures, KPIs, worksheet configs
- **No Persistence:** No real Supabase integration (stubs only)

### Backend Integration Status:
- **Supabase Client:** `src/lib/supabaseClient.js` - basic setup
- **All Calls:** Use stub functions with TODO comments
- **Real Features Needed:** Authentication, data persistence, AI integration