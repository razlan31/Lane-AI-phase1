// AI Reflection for Scratchpad - analyzes notes and suggests improvements
import { supabase } from '@/integrations/supabase/client';

export class ScratchpadAIReflection {
  constructor() {
    this.apiEndpoint = 'scratchpad-reflect';
  }

  // Analyze a note and suggest tags, KPI links, and conversions
  async reflectOnNote(noteText, existingKpis = [], existingTags = []) {
    try {
      const { data, error } = await supabase.functions.invoke(this.apiEndpoint, {
        body: {
          noteText,
          existingKpis,
          existingTags,
          analysisType: 'comprehensive'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Scratchpad reflection error:', error);
      return { error: error.message };
    }
  }

  // Batch analyze multiple notes for patterns
  async analyzeNotesForPatterns(notes, existingKpis = []) {
    try {
      const { data, error } = await supabase.functions.invoke(this.apiEndpoint, {
        body: {
          notes: notes.map(n => ({ id: n.id, text: n.text, tags: n.tags })),
          existingKpis,
          analysisType: 'pattern_detection'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return { error: error.message };
    }
  }

  // Suggest conversions from notes to structured data
  async suggestConversions(noteText, context = {}) {
    try {
      const { data, error } = await supabase.functions.invoke(this.apiEndpoint, {
        body: {
          noteText,
          context,
          analysisType: 'conversion_suggestions'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Conversion suggestion error:', error);
      return { error: error.message };
    }
  }

  // Local analysis for basic pattern detection (fallback)
  analyzeNoteLocally(noteText) {
    const text = noteText.toLowerCase();
    const suggestions = {
      suggestedTags: [],
      potentialKpis: [],
      dataStructures: []
    };

    // Basic keyword detection for tags
    const tagPatterns = {
      'revenue': ['revenue', 'income', 'sales', 'earnings'],
      'costs': ['cost', 'expense', 'spend', 'budget'],
      'marketing': ['marketing', 'ads', 'campaign', 'promotion'],
      'product': ['product', 'feature', 'development', 'build'],
      'customers': ['customer', 'user', 'client', 'retention'],
      'metrics': ['kpi', 'metric', 'measure', 'track'],
      'goals': ['goal', 'target', 'objective', 'aim'],
      'ideas': ['idea', 'concept', 'thought', 'brainstorm']
    };

    for (const [tag, keywords] of Object.entries(tagPatterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        suggestions.suggestedTags.push(tag);
      }
    }

    // Detect potential numeric KPIs
    const numberPatterns = [
      /(\$?\d+(?:,\d{3})*(?:\.\d{2})?)/g, // Money/numbers
      /(\d+%)/g, // Percentages
      /(\d+\s*(?:customers?|users?|clients?))/g // Count metrics
    ];

    numberPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        suggestions.potentialKpis.push(...matches);
      }
    });

    // Detect action items and goals
    const actionPatterns = [
      /need to (.+)/g,
      /should (.+)/g,
      /goal.{0,10}(.+)/g,
      /target.{0,10}(.+)/g
    ];

    actionPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length < 100) {
          suggestions.dataStructures.push({
            type: 'action_item',
            content: match[1].trim()
          });
        }
      });
    });

    return suggestions;
  }
}

const scratchpadAI = new ScratchpadAIReflection();
export default scratchpadAI;