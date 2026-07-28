import { flushSync } from 'react-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const withStopPropagation = (fn?: ((e: React.MouseEvent) => void)) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn?.(e);
}

export const withViewTransition = (update: () => void) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('startViewTransition' in document) || reducedMotion) {
    update();
    return;
  }

  document.startViewTransition(() => flushSync(update));
}

