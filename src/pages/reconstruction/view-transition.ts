import { flushSync } from 'react-dom';

export const withViewTransition = (update: () => void) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('startViewTransition' in document) || reducedMotion) {
    update();
    return;
  }

  document.startViewTransition(() => flushSync(update));
}
