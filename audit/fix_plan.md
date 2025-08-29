# LaneAI Fix Plan - Prioritized Action Items

## Immediate Blockers (P0)

### 1. Fix Build Failure - useAlerts Export
**Priority:** P0 (CRITICAL)
**File:** `src/components/notifications/AlertStrip.jsx`
**Lines:** 32-35 (after AlertStrip component)
**Exact Change:**
```javascript
// Add this after line 32 (after AlertStrip component closes):
export const useAlerts = () => {
  const [alerts, setAlerts] = React.useState([]);
  
  const addAlert = (alert) => {
    const newAlert = { id: Date.now() + Math.random(), level: 'info', ...alert };
    setAlerts(prev => [...prev, newAlert]);
  };
  
  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };
  
  const clearAlerts = () => setAlerts([]);
  
  return { alerts, addAlert, removeAlert, clearAlerts };
};
```
**Test:** `npm run build` should succeed
**Credits:** Low (0.1) - Simple export addition
**Time:** 5 minutes
**Risk:** Low

---

## High Priority Fixes (P1)

### 2. Implement CSV Import Flow
**Priority:** P1
**Files to Create:**
- `src/components/modals/CsvUploadModal.jsx`
- `src/components/modals/CsvMappingModal.jsx`
**Integration:** `src/components/WorksheetRenderer.jsx` lines 180-200
**Change Required:**
```javascript
// Add import buttons and handlers
const handleCsvImport = () => setShowCsvUpload(true);
// Replace stub with actual modal component
{showCsvUpload && <CsvUploadModal onClose={() => setShowCsvUpload(false)} />}
```
**Backend Required:** `BACKEND: US` - CSV parsing endpoint
**Test:** Upload CSV → map columns → create worksheet
**Credits:** Medium (2-3) - New modal components
**Time:** 1-2 days
**Risk:** Medium

### 3. Complete Export Functionality  
**Priority:** P1
**File:** `src/components/WorksheetRenderer.jsx` lines 156-163
**Change Required:**
```javascript
// Replace stub with actual export
const handleExport = () => {
  const csvData = generateCsvFromWorksheet(worksheet, values);
  downloadCsv(csvData, `${worksheet.title}.csv`);
};
```
**Files to Create:** `src/lib/exportUtils.js`
**Test:** Export button → CSV download
**Credits:** Low-Medium (1-2) - Utility functions
**Time:** 1 day  
**Risk:** Low

### 4. Fix Mobile Responsive Layout
**Priority:** P1 (after build fix)
**Files:** 
- `src/pages/HQDashboard.jsx` lines 200-250 (grid layouts)
- `src/components/primitives/KpiCard.jsx` (card sizing)
**Changes:** Add responsive breakpoints to grid layouts
**Test:** Test on mobile viewport sizes
**Credits:** Medium (2-3) - Layout adjustments
**Time:** 1 day
**Risk:** Low

---

## Medium Priority (P2) 

### 5. Complete Explain Overlay Integration
**Priority:** P2
**File:** `src/components/overlays/ExplainOverlay.jsx`
**Change:** Connect to AI chat shell with proper context
**Backend Required:** `BACKEND: US` - AI explanation endpoint
**Credits:** Medium (2) - Component integration
**Time:** 1 day
**Risk:** Medium

### 6. Enhance Worksheet Supabase Integration
**Priority:** P2  
**File:** `src/components/WorksheetRenderer.jsx` lines 22-70
**Change:** Replace mock configs with real Supabase queries
**Backend Required:** `BACKEND: US` - Worksheet schema + APIs
**Credits:** High (3-4) - Data integration
**Time:** 2-3 days
**Risk:** High

### 7. Add Advanced Formula Editor
**Priority:** P2
**File:** `src/components/WorksheetRenderer.jsx`
**Change:** Add Pro-gated formula editing UI
**Files to Create:** `src/components/worksheet/FormulaEditor.jsx`
**Credits:** High (4-5) - Complex UI component
**Time:** 3-4 days
**Risk:** High

---

## Quick Wins (<1 Credit Each)

### 8. Fix Progress Component Import
**File:** `src/pages/OnboardingFlow.jsx` line 6
**Change:** Update import path to use new ProgressBar component
**Credits:** 0.1
**Time:** 2 minutes

### 9. Add Missing Button Labels
**Files:** Various button components
**Change:** Ensure all buttons have proper text/aria-labels
**Credits:** 0.2
**Time:** 30 minutes

### 10. Update Modal Titles
**Files:** Modal components
**Change:** Ensure consistent title formatting
**Credits:** 0.1
**Time:** 15 minutes

---

## Larger Changes (>3 Credits)

### 11. Authentication System
**Priority:** P2
**Files to Create:**
- `src/components/auth/LoginForm.jsx`
- `src/components/auth/SignupForm.jsx`
- `src/hooks/useAuth.jsx`
**Backend Required:** `BACKEND: US` - Supabase auth setup
**Credits:** High (5-6) - Complete auth flow
**Time:** 1 week
**Risk:** High

### 12. Real-time Collaboration
**Priority:** P3
**Files:** Multiple component updates for multi-user
**Backend Required:** `BACKEND: US` - WebSocket infrastructure  
**Credits:** Very High (8-10) - Major feature
**Time:** 2-3 weeks
**Risk:** Very High

---

## Cost Summary

### Total Estimated Credits:
- **P0 Fixes:** 0.1 credits
- **P1 Fixes:** 8-12 credits  
- **P2 Fixes:** 12-18 credits
- **Quick Wins:** 1-2 credits
- **Large Changes:** 15-25 credits
- **Grand Total:** 36-57 credits

### Time Estimates:
- **Week 1:** Fix blockers + CSV import (P0-P1)
- **Week 2:** Mobile responsive + exports (P1)  
- **Week 3-4:** Explain overlay + advanced features (P2)
- **Month 2+:** Authentication + collaboration (P3)

---

## Risk Assessment

### Low Risk (Safe to implement):
- Build fixes
- Export utilities  
- Mobile responsive
- UI polish

### Medium Risk (Needs testing):
- CSV import modals
- Explain overlay integration
- Modal flows

### High Risk (Major changes):
- Supabase integration
- Authentication system
- Formula editor
- Real-time features

---

## Backend Dependencies

Items marked `BACKEND: US` require server-side implementation:
1. **CSV processing endpoint** - Parse/validate uploaded files
2. **AI explanation API** - Generate contextual help text
3. **Worksheet persistence** - Supabase schema + CRUD operations  
4. **User authentication** - Supabase auth configuration
5. **Real-time sync** - WebSocket or polling for collaboration
6. **Export generation** - Server-side PDF/advanced CSV creation

Frontend will call these via client stubs that are already stubbed in the codebase.