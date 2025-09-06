import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts() {
  // Defensive programming - check if React hooks are available
  if (typeof useCallback !== 'function') {
    console.error('React hooks not available');
    return null;
  }

  const handleKeyDown = useCallback((event) => {
    // Only trigger if not in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
    const cmdOrCtrl = metaKey || ctrlKey;

    // Command/Ctrl + K for command palette
    if (cmdOrCtrl && key === 'k') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('open-command-palette'));
      return;
    }

    // Alt + number keys for navigation
    if (altKey && !cmdOrCtrl && !shiftKey) {
      const actions = {
        '1': () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'copilot' })),
        '2': () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'hq' })),
        '3': () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'workspace' })),
        '4': () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'playground' })),
        '5': () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'scratchpads' })),
        's': () => window.dispatchEvent(new CustomEvent('open-scratchpad')),
        't': () => window.dispatchEvent(new CustomEvent('open-tools')),
        'c': () => window.dispatchEvent(new CustomEvent('toggle-copilot')),
        'f': () => window.dispatchEvent(new CustomEvent('toggle-founder-mode')),
      };

      if (actions[key]) {
        event.preventDefault();
        actions[key]();
      }
    }

    // Escape key to close modals/panels
    if (key === 'Escape') {
      window.dispatchEvent(new CustomEvent('escape-pressed'));
    }

    // Slash for search
    if (key === '/' && !cmdOrCtrl && !altKey && !shiftKey) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('open-search'));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}

// Hook for specific keyboard shortcut groups
export function useGlobalShortcuts(handlers = {}) {
  useEffect(() => {
    const handleNavigate = (event) => {
      if (handlers.onNavigate) {
        handlers.onNavigate(event.detail);
      }
    };

    const handleCommandPalette = () => {
      if (handlers.onOpenCommandPalette) {
        handlers.onOpenCommandPalette();
      }
    };

    const handleScratchpad = () => {
      if (handlers.onOpenScratchpad) {
        handlers.onOpenScratchpad();
      }
    };

    const handleTools = () => {
      if (handlers.onOpenTools) {
        handlers.onOpenTools();
      }
    };

    const handleCopilot = () => {
      if (handlers.onToggleCopilot) {
        handlers.onToggleCopilot();
      }
    };

    const handleFounderMode = () => {
      if (handlers.onToggleFounderMode) {
        handlers.onToggleFounderMode();
      }
    };

    const handleEscape = () => {
      if (handlers.onEscape) {
        handlers.onEscape();
      }
    };

    const handleSearch = () => {
      if (handlers.onOpenSearch) {
        handlers.onOpenSearch();
      }
    };

    // Add event listeners
    window.addEventListener('navigate', handleNavigate);
    window.addEventListener('open-command-palette', handleCommandPalette);
    window.addEventListener('open-scratchpad', handleScratchpad);
    window.addEventListener('open-tools', handleTools);
    window.addEventListener('toggle-copilot', handleCopilot);
    window.addEventListener('toggle-founder-mode', handleFounderMode);
    window.addEventListener('escape-pressed', handleEscape);
    window.addEventListener('open-search', handleSearch);

    return () => {
      window.removeEventListener('navigate', handleNavigate);
      window.removeEventListener('open-command-palette', handleCommandPalette);
      window.removeEventListener('open-scratchpad', handleScratchpad);
      window.removeEventListener('open-tools', handleTools);
      window.removeEventListener('toggle-copilot', handleCopilot);
      window.removeEventListener('toggle-founder-mode', handleFounderMode);
      window.removeEventListener('escape-pressed', handleEscape);
      window.removeEventListener('open-search', handleSearch);
    };
  }, [handlers]);
}