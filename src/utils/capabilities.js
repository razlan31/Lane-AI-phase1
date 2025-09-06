// Utility to derive capabilities from a user profile/plan
// Plans: free, pro_promo, pro_standard, weekly, annual, founder

const isPaidPlan = (plan) => ["pro_promo", "pro_standard", "weekly", "annual"].includes(plan);

export const getCapabilities = (profile) => {
  const plan = profile?.is_founder ? "founder" : (profile?.plan || profile?.subscription_plan || "free");
  const paid = profile?.is_founder || isPaidPlan(plan);

  return {
    plan,
    
    // Venture limits
    ventures_max: paid ? -1 : 1, // -1 = unlimited
    ventures_crud: true,

    // Scratchpad limits
    scratchpad_max_notes: paid ? -1 : 5, // -1 = unlimited
    scratchpad_plain: true,
    scratchpad_reflect_ai: !!paid,

    // AI usage limits
    ai_messages_monthly_limit: paid ? 500 : 10,
    ai_messages_cooldown_ms: paid ? 2000 : 10000,

    // Worksheets
    worksheets_view: true,
    worksheets_crud: !!paid,

    // Personal metrics
    personal_view: true,
    personal_crud: !!paid,

    // Founder Mode AI
    founder_mode_ai: !!paid,

    // Exporting
    export_enabled: !!paid,
    export_formats: paid ? ["pdf", "csv"] : [],

    // Helper shortcuts
    is_paid: !!paid,
    is_free: !paid,
  };
};

export default getCapabilities;
