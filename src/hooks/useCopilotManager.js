import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCopilotManager = () => {
  const [activeSuggestion, setActiveSuggestion] = useState(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [lastSuggestionTime, setLastSuggestionTime] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);

  const COOLDOWN_DURATION = 30000; // 30 seconds
  const MIN_CONFIDENCE = 0.8; // 80% confidence threshold

  // Priority levels (higher number = higher priority)
  const PRIORITY_LEVELS = {
    scratchpad: 5,
    tool: 4,
    block: 3,
    worksheet: 2,
    venture: 1
  };

  // Check if suggestion should be shown based on priority rules
  const shouldShowSuggestion = (context, confidence = 1.0) => {
    const now = Date.now();
    
    // Check cooldown
    if (cooldownActive || (now - lastSuggestionTime) < COOLDOWN_DURATION) {
      return false;
    }

    // Check confidence threshold
    if (confidence < MIN_CONFIDENCE) {
      return false;
    }

    // Check if already dismissed
    const suggestionKey = `${context.type}_${context.sourceId}`;
    if (dismissedSuggestions.has(suggestionKey)) {
      return false;
    }

    // Check priority (only show if higher or equal priority)
    if (activeSuggestion) {
      const currentPriority = PRIORITY_LEVELS[activeSuggestion.context.type] || 0;
      const newPriority = PRIORITY_LEVELS[context.type] || 0;
      if (newPriority < currentPriority) {
        return false;
      }
    }

    return true;
  };

  // Generate AI suggestion based on context
  const generateSuggestion = async (context, data) => {
    try {
      let suggestion = null;
      
      switch (context.type) {
        case 'scratchpad':
          suggestion = await generateScratchpadSuggestion(data.text);
          break;
        case 'tool':
          suggestion = await generateToolSuggestion(data.toolId, data.outputs);
          break;
        case 'block':
          suggestion = await generateBlockSuggestion(data.blockId, data.kpiValue);
          break;
        case 'worksheet':
          suggestion = await generateWorksheetSuggestion(data.worksheetId);
          break;
        case 'venture':
          suggestion = await generateVentureSuggestion(data.ventureId);
          break;
      }

      if (suggestion && shouldShowSuggestion(context, suggestion.confidence)) {
        const enrichedSuggestion = {
          ...suggestion,
          context,
          timestamp: Date.now(),
          id: `suggestion_${Date.now()}`
        };

        setActiveSuggestion(enrichedSuggestion);
        setLastSuggestionTime(Date.now());
        
        // Log suggestion
        await logSuggestion(enrichedSuggestion, false);
        
        return enrichedSuggestion;
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
    
    return null;
  };

  // Dismiss suggestion
  const dismissSuggestion = async (suggestionId, accepted = false) => {
    if (activeSuggestion && activeSuggestion.id === suggestionId) {
      const suggestionKey = `${activeSuggestion.context.type}_${activeSuggestion.context.sourceId}`;
      setDismissedSuggestions(prev => new Set([...prev, suggestionKey]));
      
      // Log dismissal
      await logSuggestion(activeSuggestion, accepted);
      
      setActiveSuggestion(null);
      
      // Start cooldown
      setCooldownActive(true);
      setTimeout(() => setCooldownActive(false), COOLDOWN_DURATION);
    }
  };

  // Generate scratchpad suggestions
  const generateScratchpadSuggestion = async (text) => {
    const suggestions = [];
    
    // CAC detection
    if (text.toLowerCase().includes('spend') && text.toLowerCase().includes('customer')) {
      suggestions.push({
        message: "Looks like a CAC note. Run Calculator?",
        confidence: 0.92,
        reasoning: "Note contained spend + customers. CAC Tool applies.",
        actions: [
          { label: 'Run Tool', primary: true, action: 'run_tool', toolId: 'cac_calculator' },
          { label: 'Ignore', primary: false, action: 'dismiss' }
        ]
      });
    }
    
    // Runway detection
    if (text.toLowerCase().includes('runway') || text.toLowerCase().includes('burn')) {
      suggestions.push({
        message: "Looks like runway calculation. Run Calculator?",
        confidence: 0.88,
        reasoning: "Note mentioned runway or burn rate. Runway Tool applies.",
        actions: [
          { label: 'Run Tool', primary: true, action: 'run_tool', toolId: 'runway_calculator' },
          { label: 'Ignore', primary: false, action: 'dismiss' }
        ]
      });
    }

    // ROI detection
    if (text.toLowerCase().includes('roi') || text.toLowerCase().includes('return')) {
      suggestions.push({
        message: "Looks like ROI calculation. Run Calculator?",
        confidence: 0.85,
        reasoning: "Note mentioned ROI or return. ROI Tool applies.",
        actions: [
          { label: 'Run Tool', primary: true, action: 'run_tool', toolId: 'roi_calculator' },
          { label: 'Ignore', primary: false, action: 'dismiss' }
        ]
      });
    }

    return suggestions[0] || null;
  };

  // Generate tool suggestions
  const generateToolSuggestion = async (toolId, outputs) => {
    // Get suggested blocks for this tool
    const { data: blockLinks } = await supabase
      .from('tool_block_links')
      .select(`
        block_id,
        blocks!inner(name)
      `)
      .eq('tool_id', toolId)
      .limit(1);

    if (blockLinks && blockLinks.length > 0) {
      const blockName = blockLinks[0].blocks.name;
      return {
        message: `This maps to the ${blockName} block. Attach?`,
        confidence: 0.90,
        reasoning: `Tool ${toolId} directly maps to ${blockName} block based on configuration.`,
        actions: [
          { label: 'Attach to Block', primary: true, action: 'attach_block', blockId: blockLinks[0].block_id },
          { label: 'Skip', primary: false, action: 'dismiss' }
        ]
      };
    }

    return null;
  };

  // Generate block suggestions
  const generateBlockSuggestion = async (blockId, kpiValue) => {
    // Check if block already has worksheet
    const { data: worksheets } = await supabase
      .from('worksheets')
      .select('id')
      .like('inputs', `%"block_id":"${blockId}"%`)
      .limit(1);

    if (!worksheets || worksheets.length === 0) {
      return {
        message: "Expand into a Worksheet?",
        confidence: 0.85,
        reasoning: "Block has KPI value but no associated worksheet for deeper analysis.",
        actions: [
          { label: 'Generate Worksheet', primary: true, action: 'generate_worksheet', blockId },
          { label: 'Not Now', primary: false, action: 'dismiss' }
        ]
      };
    }

    return null;
  };

  // Generate worksheet suggestions
  const generateWorksheetSuggestion = async (worksheetId) => {
    const { data: worksheet } = await supabase
      .from('worksheets')
      .select('venture_id')
      .eq('id', worksheetId)
      .single();

    if (worksheet && !worksheet.venture_id) {
      return {
        message: "Add this worksheet to a Venture?",
        confidence: 0.80,
        reasoning: "Worksheet is complete but not attached to any venture.",
        actions: [
          { label: 'Add to Venture', primary: true, action: 'add_to_venture', worksheetId },
          { label: 'Keep as Draft', primary: false, action: 'dismiss' }
        ]
      };
    }

    return null;
  };

  // Generate venture suggestions
  const generateVentureSuggestion = async (ventureId) => {
    // Check for draft worksheets that could be added
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: draftWorksheets } = await supabase
      .from('worksheets')
      .select('id, type')
      .eq('user_id', user.id)
      .is('venture_id', null)
      .limit(1);

    if (draftWorksheets && draftWorksheets.length > 0) {
      return {
        message: `${draftWorksheets.length} draft worksheet${draftWorksheets.length > 1 ? 's' : ''} ready. Add to venture?`,
        confidence: 0.75,
        reasoning: "Found draft worksheets that could be attached to this venture.",
        actions: [
          { label: 'Add', primary: true, action: 'add_drafts', ventureId },
          { label: 'No Thanks', primary: false, action: 'dismiss' }
        ]
      };
    }

    return null;
  };

  // Log suggestion to database
  const logSuggestion = async (suggestion, accepted) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('manual_logs')
        .insert({
          user_id: user.id,
          content: JSON.stringify({
            suggestion_text: suggestion.message,
            reasoning: suggestion.reasoning,
            confidence: suggestion.confidence,
            context: suggestion.context,
            accepted
          }),
          type: 'ai_suggestion'
        });
    } catch (error) {
      console.error('Error logging suggestion:', error);
    }
  };

  return {
    activeSuggestion,
    generateSuggestion,
    dismissSuggestion,
    cooldownActive
  };
};