import { create } from 'zustand';
import { Viewer } from 'openseadragon';
import type { ComposerLayout, DraggableImage } from './composer-types';
import { TwoColumnLayout } from './layout';
import { useAppStore } from '@/store/app-store';

export interface ComposerState {

  viewer?: Viewer;

  layout: ComposerLayout;

  selectedImage?: DraggableImage;

  setViewer(viewer?: Viewer): void;

  setLayout(layout: ComposerLayout): void;

  setSelectedImage(image?: DraggableImage): void;

}

export const useComposerStore = create<ComposerState>(set => ({

  viewer: undefined,

  layout: TwoColumnLayout(useAppStore.getState().reconstruction),

  selectedImage: undefined,

  setViewer: viewer => set({ viewer }),

  setLayout: layout => set({ layout }),

  setSelectedImage: selectedImage => set({ selectedImage })

}));

useAppStore.subscribe((state, prevState) => {
  if (state.reconstruction !== prevState.reconstruction) {
    useComposerStore.setState({
      layout: TwoColumnLayout(state.reconstruction)
    });
  }
});