import type { ReconstructionCanvas } from '@/types';
import type { Viewer } from 'openseadragon';

const getCanvasDimensions = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas;

const getCanvasImages = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original'
    ? canvas.source.canvas.images
    : canvas.sources.flatMap(s => s.canvas.images);

const PLACEHOLDER_HEIGHT = 1650 / 1200;

// Canvas height in OSD world units
export const getCanvasHeight = (canvas?: ReconstructionCanvas) => {
  if (!canvas) return undefined;
  if (getCanvasImages(canvas).length === 0) return PLACEHOLDER_HEIGHT;

  const { width, height } = getCanvasDimensions(canvas);
  return height / width;
}

export const addPage = (viewer: Viewer, canvas: ReconstructionCanvas, xOffset: number, yOffset: number) => {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(canvas);

  const images = getCanvasImages(canvas);

  const items = images.length > 0 ? images.map(image => ({
    tileSource: image.type === 'dynamic' || image.type === 'level0'
      ? image.serviceUrl
      : image.url,
    target: image.target || { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  })) : [{
    tileSource: { type: 'image', url: './empty_placeholder.png' },
    target: { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  }];

  return Promise.all(items.map(({ tileSource, target }) => new Promise<void>(resolve => {
    viewer.addTiledImage({
      tileSource,
      x: xOffset + target.x / canvasWidth,
      y: yOffset + target.y / canvasWidth,
      width: target.w / canvasWidth,
      success: () => resolve()
    });
  }))).then(() => {});
}