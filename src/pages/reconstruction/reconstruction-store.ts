import { create } from 'zustand';
import type { ReconstructionCanvas } from '@/types';
import type { DraggableImage } from './canvas-composer/composer-types';

interface ReconstructionStore {

  hover?: ReconstructionCanvas;

  setHover(hover?: ReconstructionCanvas): void;

  selection?: ReconstructionCanvas[];

  setSelection(selection: ReconstructionCanvas[]): void;

  selectedImage?: DraggableImage;

  setSelectedImage(selectedImage?: DraggableImage): void;

}

export const useReconstructionStore = create<ReconstructionStore>()(set => ({

  hover: undefined,

  selection: [],

  selectedImage: undefined,

  setHover: hover => set({ hover }),

  setSelection: selection => set({ selection }),

  setSelectedImage: selectedImage => set({ selectedImage })

}));