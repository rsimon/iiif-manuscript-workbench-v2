import type { DraggableImage } from './reconstruction-types';

export const getDraggableImageIdentity = (image: DraggableImage): string =>
  `${image.sourceCanvasId}:${image.index}`;

export const getDraggableImageKey = (canvasId: string, image: DraggableImage): string =>
  `${canvasId}:${getDraggableImageIdentity(image)}`;