import { create } from 'zustand';
import { Viewer, TiledImage } from 'openseadragon';
import { dequal } from 'dequal/lite';
import type { ComposerLayout, DraggableImage, DraggableImageSelection } from './composer-types';
import { TwoColumnLayout } from './layout';
import { toDraggableImages } from './composer-utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

export interface ComposerState {

  viewer?: Viewer;

  layout: ComposerLayout;

  imagesByCanvasId: Map<string, DraggableImage[]>,

  // Non-reactive, so it doesn't trigger re-render - rebuilt in composer.tsx 
  tiledImages: Map<string, TiledImage>;

  selectedImage?: DraggableImageSelection;

  setViewer(viewer?: Viewer): void;

  setLayout(layout: ComposerLayout): void;

  setSelectedImage(selectedImage?: DraggableImageSelection): void;

}

export const useComposerStore = create<ComposerState>(set => ({

  viewer: undefined,

  layout: TwoColumnLayout(useAppStore.getState().reconstruction),

  imagesByCanvasId: new Map(useAppStore.getState().reconstruction.map(r => [r.id, toDraggableImages(r)])),

  tiledImages: new Map(),

  selectedImage: undefined,

  setViewer: viewer => set({ viewer }),

  setLayout: layout => set({ layout }),

  setSelectedImage: selectedImage => set({ selectedImage })

}));

useAppStore.subscribe((state, prevState) => {
  // Layout only needs recomputing if structural props changed by value
  const stripIrrelevant = (r: ReconstructionCanvas) => r.type === 'composite' ? {
    id: r.id,
    height: r.height,
    width: r.width
  } : {
    id: r.id,
    height: r.source.canvas.height,
    width: r.source.canvas.width
  };

  const before = prevState.reconstruction.map(stripIrrelevant);
  const after = state.reconstruction.map(stripIrrelevant);
  const layoutChanged = !dequal(before, after);

  // Images only need recomputing per canvas: reuse the existing array
  // reference for any canvas that didn't itself change.
  const prevById = new Map(prevState.reconstruction.map(r => [r.id, r]));
  const prevImages = useComposerStore.getState().imagesByCanvasId;

  const imagesByCanvasId = new Map(state.reconstruction.map(r => [
    r.id,
    prevById.get(r.id) === r
      ? prevImages.get(r.id) ?? toDraggableImages(r)
      : toDraggableImages(r)
  ]));

  useComposerStore.setState({
    ...(layoutChanged ? { layout: TwoColumnLayout(state.reconstruction) } : {}),
    imagesByCanvasId
  });
});