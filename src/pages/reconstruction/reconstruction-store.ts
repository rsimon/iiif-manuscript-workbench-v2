import { create } from 'zustand';
import type { ReconstructionCanvas } from '@/types';

interface ReconstructionStore {

  hoveredCanvas?: ReconstructionCanvas;

  setHoveredCanvas(hovered?: ReconstructionCanvas): void;

  selection: ReconstructionCanvas[];

  setSelection(selected: ReconstructionCanvas[] | ((current: ReconstructionCanvas[]) => ReconstructionCanvas[])): void;

}

export const useReconstructionStore = create<ReconstructionStore>()(set => ({

  hoveredCanvas: undefined,

  selection: [],

  setHoveredCanvas: hoveredCanvas => set({ hoveredCanvas }),

  setSelection: arg => set(({ selection }) => ({
    selection: typeof arg === 'function' ? arg(selection) : arg
  })),

}));