import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

interface PreviewStore {

  selected?: ReconstructionCanvas;

  // Actions: selection
  setSelected: (selected?: ReconstructionCanvas) => void;

}

export const usePreviewStore = create<PreviewStore>()(set => ({

  selected: undefined,

  setSelected: selected => set(() => ({ selected })),

}));

// Helper: automatically selects the first available canvas
const autoSelect = (canvases: ReconstructionCanvas[]) => {
  const { selected, setSelected } = usePreviewStore.getState();
  if (selected || canvases.length === 0) return;
  
  setSelected(canvases[0]);
}

// Autoselect once after the store hydrates
autoSelect(useAppStore.getState().reconstruction);

// Autoselect after the store changes from empty reconstruction
useAppStore.subscribe((state, prevState) => {
  if (prevState.reconstruction.length === 0 && state.reconstruction.length > 0)
    autoSelect(state.reconstruction);
});