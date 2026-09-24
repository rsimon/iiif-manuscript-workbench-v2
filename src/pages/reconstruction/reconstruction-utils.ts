import type { DraggableImage } from './reconstruction-types';

export const getImageKey = (image: DraggableImage): string =>
  `${image.sourceCanvasId}:${image.sourceCanvasInstanceId}:${image.index}`;

export const getCanvasImageKey = (canvasId: string, image: DraggableImage): string =>
  `${canvasId}:${getImageKey(image)}`;