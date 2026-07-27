import type { ReconstructionCanvas } from '@/types';
import type { Viewer } from 'openseadragon';

const getCanvasDimensions = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas;

const getCanvasImages = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original'
    ? canvas.source.canvas.images
    : canvas.sources.flatMap(s => s.canvas.images);

// ./empty_placeholder.png is a fixed 1200x1650px file. OSD derives a
// TiledImage's height from its tile source's own native pixel aspect ratio
// (it only accepts an explicit width, not height), so a canvas with no
// images actually renders at this height once its width is scaled to 1 OSD
// unit - regardless of the canvas's own declared dimensions.
const PLACEHOLDER_HEIGHT = 1650 / 1200;

// Canvas height in OSD world units
export const getCanvasHeight = (canvas: ReconstructionCanvas) => {
  if (getCanvasImages(canvas).length === 0) return PLACEHOLDER_HEIGHT;

  const { width, height } = getCanvasDimensions(canvas);
  return height / width;
}

export const getHeight = (canvases: (ReconstructionCanvas | undefined)[]) => {
  const heights = canvases
    .filter(c => c !== undefined)
    .map(getCanvasHeight);

  return heights.length > 0 ? Math.max(...heights) : 1;
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