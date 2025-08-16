import { useEffect } from 'react';

interface ShortcutHandlers {
  onFlip?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onMarkCorrect?: () => void;
  onMarkIncorrect?: () => void;
  onToggleSettings?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          handlers.onFlip?.();
          break;
        case 'ArrowRight':
        case 'n':
          e.preventDefault();
          handlers.onNext?.();
          break;
        case 'ArrowLeft':
        case 'p':
          e.preventDefault();
          handlers.onPrevious?.();
          break;
        case '1':
          e.preventDefault();
          handlers.onMarkIncorrect?.();
          break;
        case '2':
          e.preventDefault();
          handlers.onMarkCorrect?.();
          break;
        case ',':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            handlers.onToggleSettings?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};