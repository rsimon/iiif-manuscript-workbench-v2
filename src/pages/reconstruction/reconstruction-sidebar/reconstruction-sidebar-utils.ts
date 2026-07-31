import type { FocusEvent } from 'react';

// Shared blur handling for a group of inputs edited together, e.g. width +
// height (a plain onBlur per-input would commit prematurely)
export const isBlurLeavingGroup = (e: FocusEvent, group: HTMLElement | null): boolean => {
  const next = e.relatedTarget as Node | null;
  return !(group && next && group.contains(next));
}