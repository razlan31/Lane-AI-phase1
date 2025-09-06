import { supabase } from '@/integrations/supabase/client';

export class AIMetaHandler {
  constructor() {
    this.allowedResources = [
      'worksheets',
      'personal',
      'scratchpad',
      'ventures',
      'kpis',
      'profiles'
    ];
  }

  // Main entry point for AI-driven mutations
  async handleAIRequest(instruction, context = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use the enhanced openai-chat function with meta context
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: instruction,
          context: 'meta-operations',
          sessionId: `meta_${Date.now()}`,
          metaContext: context
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: data.message,
        data: data.functionResult
      };
    } catch (error) {
      console.error('AI meta handler error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Worksheet operations
  async addWorksheetField(worksheetId, field) {
    if (!this.isAllowedResource('worksheets')) {
      throw new Error('Worksheet operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get worksheet
      const { data: worksheet, error: fetchError } = await supabase
        .from('worksheets')
        .select('*')
        .eq('id', worksheetId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError || !worksheet) {
        throw new Error('Worksheet not found');
      }

      const customFields = worksheet.custom_fields || [];
      const newField = {
        id: `custom_${Date.now()}`,
        label: field.label,
        type: field.type || 'text',
        value: field.value || '',
        created_at: new Date().toISOString()
      };

      customFields.push(newField);

      const { error: updateError } = await supabase
        .from('worksheets')
        .update({ custom_fields: customFields })
        .eq('id', worksheetId);

      if (updateError) throw updateError;

      return { success: true, field: newField };
    } catch (error) {
      throw new Error(`Failed to add worksheet field: ${error.message}`);
    }
  }

  async removeWorksheetField(worksheetId, fieldLabel) {
    if (!this.isAllowedResource('worksheets')) {
      throw new Error('Worksheet operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get worksheet
      const { data: worksheet, error: fetchError } = await supabase
        .from('worksheets')
        .select('*')
        .eq('id', worksheetId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError || !worksheet) {
        throw new Error('Worksheet not found');
      }

      const customFields = (worksheet.custom_fields || []).filter(
        field => field.label !== fieldLabel
      );

      const { error: updateError } = await supabase
        .from('worksheets')
        .update({ custom_fields: customFields })
        .eq('id', worksheetId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to remove worksheet field: ${error.message}`);
    }
  }

  // Personal finance operations
  async addPersonalEntry(type, data) {
    if (!this.isAllowedResource('personal')) {
      throw new Error('Personal operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create personal data
      const { data: personal, error: fetchError } = await supabase
        .from('personal')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let personalData = personal || {
        user_id: user.id,
        goals: [],
        activities: [],
        commitments: []
      };

      const newEntry = {
        id: `${type}_${Date.now()}`,
        ...data,
        created_at: new Date().toISOString()
      };

      switch (type) {
        case 'debt':
          // Convert debt to a payoff goal
          const debtGoal = {
            id: `debt_${Date.now()}`,
            name: `Pay off ${data.name}`,
            amount: data.amount,
            monthly_payment: data.monthly_payment,
            type: 'debt_payoff',
            created_at: new Date().toISOString()
          };
          personalData.goals = [...(personalData.goals || []), debtGoal];
          break;
        case 'goal':
          personalData.goals = [...(personalData.goals || []), newEntry];
          break;
        case 'activity':
          personalData.activities = [...(personalData.activities || []), newEntry];
          break;
        case 'commitment':
          personalData.commitments = [...(personalData.commitments || []), newEntry];
          break;
        default:
          throw new Error(`Invalid personal entry type: ${type}`);
      }

      const { error: upsertError } = await supabase
        .from('personal')
        .upsert(personalData);

      if (upsertError) throw upsertError;

      return { success: true, entry: newEntry };
    } catch (error) {
      throw new Error(`Failed to add personal entry: ${error.message}`);
    }
  }

  // Scratchpad operations
  async createScratchpadNote(text, tags = [], linkedContext = null) {
    if (!this.isAllowedResource('scratchpad')) {
      throw new Error('Scratchpad operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: note, error } = await supabase
        .from('scratchpad_notes')
        .insert({
          user_id: user.id,
          text,
          tags,
          linked_context: linkedContext
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      return { success: true, note };
    } catch (error) {
      throw new Error(`Failed to create scratchpad note: ${error.message}`);
    }
  }

  // Venture operations
  async createVenture(ventureData) {
    if (!this.isAllowedResource('ventures')) {
      throw new Error('Venture operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: venture, error } = await supabase
        .from('ventures')
        .insert({
          user_id: user.id,
          name: ventureData.name,
          description: ventureData.description,
          type: ventureData.type || 'startup',
          stage: ventureData.stage || 'concept'
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      return { success: true, venture };
    } catch (error) {
      throw new Error(`Failed to create venture: ${error.message}`);
    }
  }

  // Onboarding operations
  async updateOnboardingProgress(action, profileUpdates = {}) {
    if (!this.isAllowedResource('profiles')) {
      throw new Error('Profile operations not allowed');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let updates = {};

      switch (action) {
        case 'skip_to_founder_mode':
          updates = {
            onboarded: true,
            is_founder: true,
            ...profileUpdates
          };
          break;
        case 'complete':
          updates = {
            onboarded: true,
            ...profileUpdates
          };
          break;
        case 'reset':
          updates = {
            onboarded: false,
            is_founder: false
          };
          break;
        default:
          throw new Error(`Invalid onboarding action: ${action}`);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      return { success: true, updates };
    } catch (error) {
      throw new Error(`Failed to update onboarding: ${error.message}`);
    }
  }

  // Security guard
  isAllowedResource(resource) {
    return this.allowedResources.includes(resource);
  }

  // Get context for AI operations
  async getContextData(userId, contextType = null) {
    try {
      const context = {};

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      context.profile = profile;

      // Get ventures
      const { data: ventures } = await supabase
        .from('ventures')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      context.ventures = ventures || [];

      // Get recent worksheets
      const { data: worksheets } = await supabase
        .from('worksheets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      context.worksheets = worksheets || [];

      return context;
    } catch (error) {
      console.error('Error getting context data:', error);
      return {};
    }
  }
}

// Export singleton instance
export const aiMetaHandler = new AIMetaHandler();