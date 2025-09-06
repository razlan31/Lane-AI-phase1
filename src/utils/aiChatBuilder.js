// AI Chat Builder - handles conversational commands to modify app data
export const detectChatCommands = (message) => {
  const msg = message.toLowerCase().trim();
  
  // Personal metrics commands
  if (msg.includes('add') && (msg.includes('field') || msg.includes('metric')) && msg.includes('personal')) {
    return {
      type: 'personal_add_field',
      intent: 'Add custom field to personal metrics',
      confidence: 0.9
    };
  }
  
  // Worksheet/Calculator commands  
  if ((msg.includes('build') || msg.includes('create')) && (msg.includes('calculator') || msg.includes('worksheet'))) {
    return {
      type: 'worksheet_create',
      intent: 'Create custom calculator/worksheet',
      confidence: 0.85
    };
  }
  
  // ROI specific
  if (msg.includes('roi') && (msg.includes('calculator') || msg.includes('build') || msg.includes('create'))) {
    return {
      type: 'worksheet_roi',
      intent: 'Create ROI calculator',
      confidence: 0.9
    };
  }
  
  // Scratchpad conversion
  if (msg.includes('scratchpad') && (msg.includes('convert') || msg.includes('kpi') || msg.includes('metric'))) {
    return {
      type: 'scratchpad_convert',
      intent: 'Convert scratchpad notes to structured data',
      confidence: 0.8
    };
  }
  
  // Venture/KPI commands
  if (msg.includes('add') && (msg.includes('kpi') || msg.includes('metric')) && msg.includes('venture')) {
    return {
      type: 'venture_add_kpi',
      intent: 'Add KPI to venture',
      confidence: 0.85
    };
  }
  
  return null;
};

export const generateCommandResponse = (command, userCapabilities) => {
  const isPaid = userCapabilities?.is_paid || false;
  
  switch (command.type) {
    case 'personal_add_field':
      if (!isPaid) {
        return {
          message: "I'd love to help you add custom fields to your personal metrics! However, this feature requires a paid plan. Would you like me to show you the upgrade options?",
          requiresUpgrade: true,
          suggestedAction: 'upgrade'
        };
      }
      return {
        message: "I can help you add a custom field to your personal metrics! What kind of field would you like to add? (e.g., 'Health Score', 'Side Hustle Revenue', 'Investment Portfolio')",
        requiresConfirmation: true,
        suggestedAction: 'personal_field_form'
      };
      
    case 'worksheet_create':
    case 'worksheet_roi':
      if (!isPaid) {
        return {
          message: "Creating custom calculators and worksheets is a powerful feature available with paid plans. Would you like to see what's included?",
          requiresUpgrade: true,
          suggestedAction: 'upgrade'
        };
      }
      return {
        message: "I can help you build a custom calculator! What type of calculations do you need? I can create worksheets for ROI, break-even analysis, pricing models, or any business formula you need.",
        requiresConfirmation: true,
        suggestedAction: 'worksheet_builder_form'
      };
      
    case 'scratchpad_convert':
      if (!isPaid) {
        return {
          message: "AI-powered scratchpad analysis and conversion to KPIs is available with paid plans. This feature can automatically identify metrics and structure your notes!",
          requiresUpgrade: true,
          suggestedAction: 'upgrade'
        };
      }
      return {
        message: "I can analyze your scratchpad notes and help convert them into structured KPIs and metrics! Would you like me to review your recent notes and suggest conversions?",
        requiresConfirmation: true,
        suggestedAction: 'scratchpad_analysis'
      };
      
    case 'venture_add_kpi':
      return {
        message: "I can help you add a KPI to track for your venture! What metric would you like to monitor? (e.g., 'Monthly Recurring Revenue', 'Customer Acquisition Cost', 'Conversion Rate')",
        requiresConfirmation: true,
        suggestedAction: 'venture_kpi_form'
      };
      
    default:
      return null;
  }
};