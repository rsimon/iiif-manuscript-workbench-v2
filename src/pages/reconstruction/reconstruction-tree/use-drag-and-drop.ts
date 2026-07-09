import { useCallback } from 'react';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { useAppStore } from '@/store/app-store';
import type { OriginalCanvas, ReconstructionCanvas, SourceCanvas } from '@/types';

export type DragPayload =
  | { kind: 'root'; id: string; index: number; itemType: ReconstructionCanvas['type'] }
  | { kind: 'child'; compositeId: string; canvasId: string };

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
  
    return without.map(c => {
      if (c.id !== targetId) return c;
  
      return c.type === 'composite'
        ? { ...c, sources: [...c.sources, dragged] }
        : {
            type: 'composite' as const,
            id: `${baseURI}/${crypto.randomUUID()}`,
            label: c.label,
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
 