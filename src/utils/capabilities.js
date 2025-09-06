// Utility to derive capabilities from a user profile/plan
// Plans: free, pro_promo, pro_standard, weekly, annual, founder

const isPaidPlan = (plan) => ["pro_promo", "pro_standard", "weekly", "annual"].includes(plan);

export const getCapabilities = (profile) => {
  const plan = profile?.is_founder ? "founder" : (profile?.plan || profile?.subscription_plan || "free");
  const paid = profile?.is_founder || isPaidPlan(plan);

  return {
    plan,
    // Core app sections (always accessible)
    ventures_crud: true,

    // Worksheets
    worksheets_view: true,
    worksheets_crud: !!paid,

    // Personal metrics
    personal_view: true,
    personal_crud: !!paid,

    // Scratchpad
    scratchpad_plain: true,
    scratchpad_reflect_ai: !!paid,

    // Founder Mode AI
    founder_mode_ai: !!paid,

    // Exporting
    export_enabled: !!paid,
    export_formats: paid ? ["pdf", "csv"] : [],

    // AI usage
    ai_limits: paid
      ? { monthly_quota: 500, cooldown_ms: 2000 }
      : { daily_quota: 10, cooldown_ms: 10000 },

    // Helper shortcuts
    is_paid: !!paid,
    is_free: !paid,
  };
};

export default getCapabilities;
