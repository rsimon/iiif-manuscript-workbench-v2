import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { DropIndicator as LineIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/tree-item';
import { cn } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { OriginalCanvas, ReconstructionCanvas, SourceCanvas } from '@/types';

export type DragPayload =
  | { kind: 'root'; id: string; index: number; itemType: ReconstructionCanvas['type'] }
  | { kind: 'child'; compositeId: string; canvasId: string };

export type FallbackDropTarget = { kind: 'list-fallback'; id: string; index: number; edge: 'top' | 'bottom' };

// Must match the root list's `gap-2` in reconstruction-tree.tsx, so the
// reorder line renders centered between cards.
export const ITEM_GAP = '8px';

export const useDragAndDrop = () => {

  const baseURI = useAppStore(state => state.baseURI);

  // Removes the dragged canvas from wherever it is (top level or inside a composite).
  const take = useCallback((
    list: ReconstructionCanvas[], 
    payload: DragPayload
  ): [ReconstructionCanvas[], SourceCanvas | undefined] => {
    if (payload.kind === 'root') {
      const item = list.find(c => c.id === payload.id);
  
      return item?.type === 'original'
        ? [list.filter(c => c.id !== payload.id), item.source]
        : [list, undefined];
    } else {
      let child: SourceCanvas | undefined;
  
      const next = list.map(c => {
        if (c.type !== 'composite' || c.id !== payload.compositeId) return c;
  
        child = c.sources.find(s => s.canvas.id === payload.canvasId);
        return { ...c, sources: c.sources.filter(s => s.canvas.id !== payload.canvasId) };
      });
  
      return [next, child];
    }
  }, []);

  // Reorders root-level items
  const reorderRoot = useCallback((
    list: ReconstructionCanvas[],
    startIndex: number,
    finishIndex: number
  ): ReconstructionCanvas[] => 
    reorder({ list, startIndex, finishIndex })
  , [])

  // Moves a child out of its composite, creating a new top-level OriginalCanvas
  const extractChild = useCallback((
    list: ReconstructionCanvas[],
    payload: DragPayload & { kind: 'child' },
    insertIndex: number
  ): ReconstructionCanvas[] => {
    const [next, source] = take(list, payload);
    if (!source) return list;
  
    const original: OriginalCanvas = {
      type: 'original',
      id: source.canvas.id,
      label: source.canvas.getLabel(),
      source
    };
  
    const result = [...next];
    result.splice(insertIndex, 0, original);
    return result;
  }, [take]);

  // Merges the dragged canvas into the target
  const mergeInto = useCallback((
    list: ReconstructionCanvas[],
    targetId: string,
    payload: DragPayload
  ): ReconstructionCanvas[] => {
    // No-ops: dropping onto itself, or a child onto its own composite
    if (payload.kind === 'root' && payload.id === targetId) return list;
    if (payload.kind === 'child' && payload.compositeId === targetId) return list;
  
    const [without, dragged] = take(list, payload);
    if (!dragged) return list;
  
    return without.map((c, idx) => {
      if (c.id !== targetId) return c;
  
      return c.type === 'composite'
        ? { ...c, sources: [...c.sources, dragged] }
        : {
            type: 'composite' as const,
            id: `${baseURI}/${crypto.randomUUID()}`,
            label: `Leaf ${idx + 1}`,
            sources: [c.source, dragged]
          };
    });
  }, [take]);


  return {
    extractChild,
    mergeInto,
    reorderRoot
  }

}

export const withViewTransition = (update: () => void) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('startViewTransition' in document) || reducedMotion) {
    update();
    return;
  }

  document.startViewTransition(() => flushSync(update));
}

export const viewTransitionName = (id: string) =>
  `vt-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

export const TreeDropIndicator = ({ instruction }: { instruction: Instruction }) => {
  const isBlocked = instruction.type === 'instruction-blocked';
  const resolved = isBlocked ? instruction.desired : instruction;
  const appearance: 'default' | 'warning' = isBlocked ? 'warning' : 'default';

  if (resolved.type === 'reorder-above')
    return <LineIndicator edge="top" gap={ITEM_GAP} appearance={appearance} />;

  if (resolved.type === 'reorder-below')
    return <LineIndicator edge="bottom" gap={ITEM_GAP} appearance={appearance} />;

  if (resolved.type === 'make-child')
    return (
      <div
        className={cn(
          'absolute inset-0 rounded-md border-2 pointer-events-none',
          appearance === 'warning' ? 'border-destructive' : 'border-primary'
        )} />
    );

  return null;
}
 