import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

interface ReconstructionStore {

  selection: ReconstructionCanvas[];

  setSelection(selected: ReconstructionCanvas[] | ((current: ReconstructionCanvas[]) => ReconstructionCanvas[])): void;

}

export const useReconstructionStore = create<ReconstructionStore>()(set => ({

  selection: [],

  setSelection: arg => set(({ selection }) => ({
    selection: typeof arg === 'function' ? arg(selection) : arg
  })),

}));

// Helper
const getSourceCanvasIds = (r: ReconstructionCanvas) =>
  r.type === 'original' ? [r.source.canvas.id] : r.sources.map(s => s.canvas.id);

// Keep selection in sync in case reconstruction canvases change their type
// (original -> composite and vice versa) and ID after user edits
useAppStore.subscribe((state, prevState) => {
  if (state.reconstruction === prevState.reconstruction) return;

  const { selection } = useReconstructionStore.getState();
  if (selection.length === 0) return;

  const resolved = selection
    .map(canvas => {
      const sameId = state.reconstruction.find(r => r.id === canvas.id);
      if (sameId) return sameId;

      // Selected canvas no longer exists in the reconstruction - find corresponding match
      const ids = new Set(getSourceCanvasIds(canvas));

      // By-source match: if the destination canvas was changed
      const bySource = ids.size > 0
        ? state.reconstruction.find(r => getSourceCanvasIds(r).some(id => ids.has(id)))
        : undefined;
      if (bySource) return bySource;

      // If the origin canvas was changed (original -> composite), there's no 
      // by-source match - fall back to position.
      const sameLength = state.reconstruction.length === prevState.reconstruction.length;
      if (!sameLength) return undefined; // De-select as a terminal fallback

      // Just use the same index position - which should normally be safe
      const prevIndex = prevState.reconstruction.indexOf(canvas);
      return prevIndex >= 0 ? state.reconstruction[prevIndex] : undefined;
    })
    .filter(r => !!r);

  // Two old selection entries could resolve to the same new canvas (eg. merge)
  const deduped = [...new Map(resolved.map(r => [r.id, r])).values()];

  const unchanged = deduped.length === selection.length &&
    deduped.every((r, i) => r === selection[i]);

  if (!unchanged) useReconstructionStore.setState({ selection: deduped });
});