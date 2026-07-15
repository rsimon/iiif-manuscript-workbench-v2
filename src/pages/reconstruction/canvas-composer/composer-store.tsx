import { create } from 'zustand';
import { Viewer, TiledImage } from 'openseadragon';
import { dequal } from 'dequal/lite';
import pDebounce from 'p-debounce';
import type { ComposerLayout, DraggableImage, DraggableImageSelection } from './composer-types';
import { TwoColumnLayout } from './layout';
import { applyEdits, getDraggableImageKey, toDraggableImages } from './composer-utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

export interface ComposerState {

  viewer?: Viewer;

  layout: ComposerLayout;

  imagesByCanvasId: Map<string, DraggableImage[]>,

  // Non-reactive & mutable by convention, use without re-render
  tiledImages: Map<string, TiledImage>;

  selectedImage?: DraggableImageSelection;

  isDraggingImage: boolean;

  setViewer(viewer?: Viewer): void;

  setLayout(layout: ComposerLayout): void;

  setSelectedImage(selectedImage?: DraggableImageSelection): void;

  setIsDraggingImage(isDraggingImage: boolean): void;

  updateImage(canvasId: string, updated: DraggableImage): void;

}

export const useComposerStore = create<ComposerState>(set => ({

  viewer: undefined,

  layout: TwoColumnLayout(useAppStore.getState().reconstruction),

  imagesByCanvasId: new Map(useAppStore.getState().reconstruction.map(r => [r.id, toDraggableImages(r)])),

  tiledImages: new Map(),

  selectedImage: undefined,

  isDraggingImage: false,

  setViewer: viewer => set({ viewer }),

  setLayout: layout => set({ layout }),

  setSelectedImage: selectedImage => set({ selectedImage }),

  setIsDraggingImage: isDraggingImage => set({ isDraggingImage }),

  updateImage: (canvasId, updated) => set(({ imagesByCanvasId, selectedImage }) => {
    const onThisCanvas = imagesByCanvasId.get(canvasId);
    if (!onThisCanvas) return {};

    const key = getDraggableImageKey(updated);

    const prevImage = onThisCanvas.find(img => getDraggableImageKey(img) === key);
    if (!prevImage) return {};

    const nextImages = onThisCanvas.map(img => img === prevImage ? updated : img);

    const updatedImagesByCanvasId = new Map(imagesByCanvasId);
    updatedImagesByCanvasId.set(canvasId, nextImages);

    const updatedSelectedImage =
      selectedImage?.item.reconstructionCanvasId === canvasId &&
      getDraggableImageKey(selectedImage.image) === key
        ? { ...selectedImage, image: updated }
        : undefined;

    // Debounced upwards sync to the main (persistent) app store
    scheduleAppStoreSync();

    return {
      imagesByCanvasId: updatedImagesByCanvasId,
      ...(updatedSelectedImage ? { selectedImage: updatedSelectedImage } : {})
    };
  })
}));

// Debounced upwards sync to root app state
const scheduleAppStoreSync = pDebounce(() => {
  const { reconstruction, updateReconstruction } = useAppStore.getState();
  const { imagesByCanvasId } = useComposerStore.getState();

  const next = applyEdits(reconstruction, imagesByCanvasId);
  const changed = next.some((r, i) => r !== reconstruction[i]);

  if (changed) updateReconstruction(next);
}, 250);

// Downwards sync from app store to local state
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

  // Skip updated if nothing actually differs - prevents infinite loop
  // from the 'upwards sync' to the app state after a user edit
  const imagesChanged =
    imagesByCanvasId.size !== prevImages.size ||
      [...imagesByCanvasId].some(([id, images]) => prevImages.get(id) !== images);

  if (!layoutChanged && !imagesChanged) return;

  useComposerStore.setState({
    ...(layoutChanged ? { layout: TwoColumnLayout(state.reconstruction) } : {}),
    ...(imagesChanged ? { imagesByCanvasId } : {})
  });
});