import { create } from 'zustand';
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