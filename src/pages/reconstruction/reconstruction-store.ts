import { create } from 'zustand';
import type { ReconstructionCanvas } from '@/types';

interface ReconstructionStore {

  hoveredCanvas?: ReconstructionCanvas;

  setHoveredCanvas(hovered?: ReconstructionCanvas): void;

  selection: ReconstructionCanvas[];

  setSelection(selected: ReconstructionCanvas[]): void;

}

export const useReconstructionStore = create<ReconstructionStore>()(set => ({

  hoveredCanvas: undefined,

  selection: [],

  setHoveredCanvas: hoveredCanvas => set({ hoveredCanvas }),

  setSelection: selection => set({ selection }),

}));