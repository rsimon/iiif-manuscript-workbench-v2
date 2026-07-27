import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

export interface PageView {

  left?: ReconstructionCanvas;

  right?: ReconstructionCanvas;

}

const toViews = (reconstruction: ReconstructionCanvas[]): PageView[] => {
  const views: PageView[] = [];
  for (let i = 0; i < reconstruction.length; i += 2)
    views.push({ left: reconstruction[i], right: reconstruction[i + 1] });
  return views;
};

const clampIndex = (index: number, views: PageView[]) =>
  Math.min(Math.max(index, 0), Math.max(0, views.length - 1));

interface PreviewStore {

  views: PageView[];

  selectedView?: PageView;

  // Actions: selection
  setSelectedView: (view: PageView) => void;
  selectNext: () => void;
  selectPrevious: () => void;

}

export const usePreviewStore = create<PreviewStore>()(set => {
  const initialViews = toViews(useAppStore.getState().reconstruction);

  return {

    views: initialViews,

    selectedView: initialViews[0],

    setSelectedView: view => set({ selectedView: view }),

    selectNext: () => set(({ views, selectedView }) => {
      const index = selectedView ? views.indexOf(selectedView) : -1;
      return { selectedView: views[clampIndex(index + 1, views)] };
    }),

    selectPrevious: () => set(({ views, selectedView }) => {
      const index = selectedView ? views.indexOf(selectedView) : -1;
      return { selectedView: views[clampIndex(index - 1, views)] };
    })

  };
});

useAppStore.subscribe((state, prevState) => {
  if (state.reconstruction === prevState.reconstruction) return;

  // If the reconstruction changes, just re-init the selected view
  const views = toViews(state.reconstruction);
  usePreviewStore.setState({ views, selectedView: views[0] });
});
