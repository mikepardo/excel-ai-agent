import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow some shortcuts even in input fields
        const allowedInInputs = ['s', 'z', 'y', 'f'];
        if (!allowedInInputs.includes(event.key.toLowerCase()) || !event.ctrlKey) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

export const COMMON_SHORTCUTS = {
  COPY: { key: 'c', ctrl: true, description: 'Copy' },
  PASTE: { key: 'v', ctrl: true, description: 'Paste' },
  CUT: { key: 'x', ctrl: true, description: 'Cut' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'y', ctrl: true, description: 'Redo' },
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  FIND: { key: 'f', ctrl: true, description: 'Find' },
  HELP: { key: '?', ctrl: true, description: 'Show keyboard shortcuts' },
  EDIT_CELL: { key: 'F2', description: 'Edit cell' },
  ARROW_UP: { key: 'ArrowUp', description: 'Move up' },
  ARROW_DOWN: { key: 'ArrowDown', description: 'Move down' },
  ARROW_LEFT: { key: 'ArrowLeft', description: 'Move left' },
  ARROW_RIGHT: { key: 'ArrowRight', description: 'Move right' },
  TAB: { key: 'Tab', description: 'Move to next cell' },
  SHIFT_TAB: { key: 'Tab', shift: true, description: 'Move to previous cell' },
  ENTER: { key: 'Enter', description: 'Confirm and move down' },
  ESCAPE: { key: 'Escape', description: 'Cancel' },
};
