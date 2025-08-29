# LaneAI Fix Plan - Prioritized Action Items

## Immediate Blockers (P0) - Must Fix First

### 1. Fix HMR Reload Failure for AlertStrip
**Priority:** P0 (CRITICAL)
**File:** `src/components/notifications/AlertStrip.jsx`
**Issue:** Hot Module Reload failing, affecting development workflow
**Root Cause:** Likely syntax error or import issue in AlertStrip component

**Exact Fix Required:**
```javascript
// Check for syntax errors in AlertStrip.jsx
// Verify all imports are correct
// Ensure exports match import statements in App.jsx
```

**Acceptance Test:** 
- `npm run dev` with no HMR errors in console
- Hot reload works when editing AlertStrip component

**Credits:** Low (0.5) - Debug and syntax fix
**Time:** 1-2 hours
**Risk:** Low

---

## High Priority Features (P1) - Core Functionality

### 2. Implement Real Backend Integration
**Priority:** P1 (HIGH)
**Files:** All components using Supabase stubs
**Issue:** No real data persistence - all calls are stubs

**Backend Required:** `BACKEND: US`
**Frontend Changes Needed:**
```javascript
// Replace all stub calls with real Supabase integration
// Files to update:
// - src/components/WorksheetRenderer.jsx (lines 156-163)
// - src/pages/HQDashboard.jsx (KPI data loading)
// - src/components/portfolio/PortfolioTiles.jsx (venture data)
```

**Endpoints Needed:**
- `GET /worksheets` - Fetch user worksheets
- `POST /worksheets` - Save worksheet data
- `PUT /worksheets/:id` - Update worksheet
- `GET /ventures` - Fetch user ventures
- `GET /kpis` - Fetch dashboard KPI data

**Acceptance Test:** 
- Create worksheet → data persists after page refresh
- KPI values come from real database
- Multiple users see their own data

**Credits:** High (5-6) - Major backend integration
**Time:** 1-2 weeks
**Risk:** High

### 3. Implement CSV Import/Export Functionality
**Priority:** P1 (HIGH)
**Files to Create:**
- `src/components/modals/CsvUploadModal.jsx`
- `src/components/modals/CsvMappingModal.jsx`
- `src/lib/csvUtils.js`

**Files to Update:**
- `src/components/WorksheetRenderer.jsx` (lines 180-200)

**Exact Changes:**
```javascript
// Add to WorksheetRenderer.jsx
const [showCsvUpload, setShowCsvUpload] = useState(false);

const handleCsvImport = () => setShowCsvUpload(true);

const handleCsvExport = () => {
  const csvData = generateCsvFromWorksheet(worksheet, values);
  downloadFile(csvData, `${worksheet.title}.csv`, 'text/csv');
};

// Add to render:
{showCsvUpload && (
  <CsvUploadModal 
    onClose={() => setShowCsvUpload(false)}
    onImport={(data) => handleCsvImport(data)}
  />
)}
```

**Backend Required:** `BACKEND: US` - CSV processing endpoint
**Acceptance Test:**
- Upload CSV → map columns → create worksheet with data
- Export worksheet → download CSV file

**Credits:** Medium-High (3-4) - New modal components + file handling
**Time:** 3-5 days  
**Risk:** Medium

### 4. Add Authentication System
**Priority:** P1 (HIGH)
**Files to Create:**
- `src/components/auth/LoginForm.jsx`
- `src/components/auth/SignupForm.jsx`  
- `src/hooks/useAuth.jsx`
- `src/contexts/AuthContext.jsx`

**Files to Update:**
- `src/App.jsx` - Add auth routing and protection

**Exact Changes:**
```javascript
// Add to App.jsx
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Check auth state on load
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });
}, []);

// Protect routes
if (loading) return <LoadingSpinner />;
if (!user) return <AuthFlow onAuth={setUser} />;
```

**Backend Required:** `BACKEND: US` - Supabase auth configuration
**Acceptance Test:**
- User can sign up with email/password
- User can log in and see their data
- User sessions persist across browser refresh

**Credits:** High (4-5) - Complete auth flow
**Time:** 1 week
**Risk:** Medium

---

## Medium Priority (P2) - Enhanced Features

### 5. Complete AI Chat Integration  
**Priority:** P2
**File:** `src/components/chat/AIChat.jsx`
**Issue:** AI calls return placeholder responses only

**Changes Required:**
```javascript
// Replace aiClientStub with real AI integration
const handleSend = async () => {
  const response = await aiClient.chat({
    message: inputValue,
    context: getCurrentContext(),
    worksheetData: activeWorksheet
  });
  // Handle real AI response
};
```

**Backend Required:** `BACKEND: US` - AI chat endpoint
**Credits:** Medium (2-3) - API integration
**Time:** 2-3 days
**Risk:** Medium

### 6. Add Real Worksheet Calculations
**Priority:** P2  
**File:** `src/components/WorksheetRenderer.jsx` (lines 116-140)
**Issue:** `calculateOutputs()` returns mock data

**Changes Required:**
```javascript
const calculateOutputs = () => {
  const outputs = {};
  worksheet.outputs.forEach(output => {
    try {
      // Real formula evaluation based on inputs
      outputs[output.id] = evaluateFormula(output.formula, values);
    } catch (error) {
      outputs[output.id] = { error: 'Formula error', value: 0 };
    }
  });
  return outputs;
};
```

**Credits:** Medium (2) - Formula evaluation logic
**Time:** 2-3 days
**Risk:** Low-Medium

### 7. Fix Mobile Responsiveness
**Priority:** P2
**Files:** 
- `src/pages/HQDashboard.jsx` (grid layouts)
- `src/components/primitives/KpiCard.jsx`
- All modal components

**Changes Required:**
```javascript
// Update grid classes for mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// Add mobile-specific modal sizing
<DialogContent className="max-w-[95vw] md:max-w-4xl">
```

**Acceptance Test:** Test on mobile viewport - all features accessible
**Credits:** Medium (2-3) - Layout responsive updates
**Time:** 2-3 days
**Risk:** Low

---

## Quick Wins (<1 Credit Each)

### 8. Fix Onboarding Redirect Flow
**File:** `src/pages/OnboardingFlow.jsx` (lines 125-130)
**Issue:** Ensure proper redirect to HQ after completion
**Change:** Verify `onComplete()` prop properly routes to HQ
**Credits:** 0.2
**Time:** 30 minutes

### 9. Add Loading States
**Files:** All components with async operations
**Change:** Add loading spinners during data operations
**Credits:** 0.5
**Time:** 2 hours

### 10. Improve Error Handling
**Files:** API call components
**Change:** Add try/catch blocks and error state UI
**Credits:** 0.5
**Time:** 2 hours

---

## Advanced Features (P3) - Future Enhancements

### 11. Advanced Formula Editor
**Priority:** P3
**File:** `src/components/WorksheetRenderer.jsx`
**Description:** Pro-tier formula editing interface
**Credits:** High (4-5)
**Time:** 1-2 weeks

### 12. Real-time Collaboration
**Priority:** P3  
**Files:** Multiple components
**Description:** Multi-user editing and sync
**Backend Required:** `BACKEND: US` - WebSocket infrastructure
**Credits:** Very High (8-10)
**Time:** 3-4 weeks

### 13. Advanced Analytics Dashboard
**Priority:** P3
**Description:** Detailed venture analytics and insights
**Credits:** High (6-7)
**Time:** 2-3 weeks

---

## Cost Summary & Timeline

### Total Estimated Credits by Priority:
- **P0 Fixes:** 0.5 credits
- **P1 Core Features:** 12-15 credits  
- **P2 Enhancements:** 8-10 credits
- **Quick Wins:** 2-3 credits
- **P3 Advanced:** 18-25 credits
- **Grand Total:** 40-53 credits

### Implementation Timeline:
- **Week 1:** Fix P0 blocker + start CSV import (3 credits)
- **Week 2:** Complete CSV + start auth system (4 credits) 
- **Week 3:** Finish auth + backend integration (6 credits)
- **Week 4:** AI chat + worksheet calculations (4 credits)
- **Month 2:** Mobile responsive + P2 features (8 credits)
- **Month 3+:** Advanced features as needed (18+ credits)

---

## Backend Dependencies

**Items requiring backend implementation:**

1. **Authentication System**
   - Supabase auth configuration
   - User session management
   - Row-level security policies

2. **Data Persistence**
   - Worksheet CRUD operations
   - Venture management APIs  
   - KPI data endpoints

3. **CSV Processing**
   - File upload handling
   - CSV parsing and validation
   - Data mapping services

4. **AI Integration**
   - Chat completion endpoints
   - Context-aware responses
   - Worksheet analysis

5. **Export Services**
   - PDF generation
   - Advanced CSV exports
   - Report compilation

6. **Real-time Features**
   - WebSocket connections
   - Collaboration sync
   - Live updates

---

## Risk Assessment

### Low Risk (Safe to implement):
- Fix HMR issues
- Mobile responsiveness  
- Loading states
- Error handling
- UI polish

### Medium Risk (Needs careful testing):
- CSV import/export modals
- Authentication integration
- AI chat connection
- Formula calculations

### High Risk (Major architectural changes):
- Backend integration
- Real-time collaboration
- Advanced formula editor
- Multi-tenant data isolation

---

## Success Metrics

**Phase 1 Complete When:**
- ✅ No build/HMR errors
- ✅ Users can create and save worksheets with real data
- ✅ CSV import/export working end-to-end
- ✅ Authentication system functional
- ✅ Mobile responsive design verified
- ✅ AI chat provides real responses

**Quality Gates:**
- All P0 and P1 items resolved
- No console errors in production build
- Mobile viewport testing passed
- User acceptance testing completed