import type { DraggableImage } from './reconstruction-types';

export const getDraggableImageKey = (image: DraggableImage): string =>
  `${image.sourceCanvasId}:${image.index}`;