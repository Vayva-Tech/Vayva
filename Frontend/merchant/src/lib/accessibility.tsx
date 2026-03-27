import { KeyboardEvent } from 'react';

// ARIA label helpers
export function getAriaLabel(type: string, name?: string): string {
  switch (type) {
    case 'donation':
      return `Donation of ${name || 'anonymous donor'}`;
    case 'campaign':
      return `Campaign: ${name}`;
    case 'donor':
      return `Donor profile: ${name}`;
    case 'volunteer':
      return `Volunteer: ${name}`;
    case 'grant':
      return `Grant: ${name}`;
    default:
      return name || 'Item';
  }
}

export function getStatusAriaLabel(status: string): string {
  return `Status: ${status}`;
}

export function getProgressAriaLabel(current: number, total: number): string {
  const percentage = Math.round((current / total) * 100);
  return `Progress: ${percentage}% of ${total}`;
}

// Keyboard navigation helpers
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  actions: {
    onEnter?: () => void;
    onEscape?: () => void;
    onSpace?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
  }
) {
  const { onEnter, onEscape, onSpace, onDelete, onEdit } = actions;

  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      onEscape?.();
      break;
    case ' ':
      if (onSpace) {
        event.preventDefault();
        onSpace();
      }
      break;
    case 'Delete':
    case 'Backspace':
      if (onDelete && event.metaKey || event.ctrlKey) {
        event.preventDefault();
        onDelete();
      }
      break;
    case 'e':
      if (onEdit && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onEdit();
      }
      break;
  }
}

// Focus management
export function trapFocus(element: HTMLElement, firstFocusable: HTMLElement, lastFocusable: HTMLElement) {
  element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement) {
    previousElement.focus();
  }
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Skip link component
export function SkipLink({ targetId = '#main-content' }: { targetId?: string }) {
  return (
    <a
      href={targetId}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  );
}
