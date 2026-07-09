import { create } from 'zustand';
import type { ReconstructionCanvas } from '@/types';

interface ReconstructionStore {

  selection?: ReconstructionCanvas[];

  setSelection(selection: ReconstructionCanvas[]): void;

}

export const useReconstructionStore = create<ReconstructionStore>()(set => ({

  selection: [],

  setSelection: selection => set({ selection })

}));