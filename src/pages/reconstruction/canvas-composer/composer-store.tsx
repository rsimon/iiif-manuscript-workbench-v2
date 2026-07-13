import { create } from 'zustand';
import { Viewer } from 'openseadragon';
import type { ComposerLayout } from './composer-types';
import { TwoColumnLayout } from './layout';
import { useAppStore } from '@/store/app-store';

export interface ComposerState {

  viewer?: Viewer;

  layout: ComposerLayout;

  setViewer(viewer?: Viewer): void;

  setLayout(layout: ComposerLayout): void;

}


export const useComposerStore = create<ComposerState>(set => ({

  viewer: undefined,

  layout: TwoColumnLayout(useAppStore.getState().reconstruction),

  setViewer: viewer => set({ viewer }),

  setLayout: layout => set({ layout })

}));

useAppStore.subscribe((state, prevState) => {
  if (state.reconstruction !== prevState.reconstruction) {
    useComposerStore.setState({
      layout: TwoColumnLayout(state.reconstruction)
    });
  }
});