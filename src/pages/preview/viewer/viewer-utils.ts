import type { ReconstructionCanvas } from '@/types';
import type { Viewer } from 'openseadragon';

export const getHeight = (canvases: (ReconstructionCanvas | undefined)[]) => {
  const height = Math.max(...canvases
    .filter(c => c !== undefined)
    .map(c => {
      const { width, height } = getCanvasDimensions(c);
      return height / width;
    }));


  return height <= 0 ? 1 : height;
}

const getCanvasDimensions = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas;

const getCanvasImages = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original'
    ? canvas.source.canvas.images
    : canvas.sources.flatMap(s => s.canvas.images);

export const addPage = (viewer: Viewer, canvas: ReconstructionCanvas, xOffset: number) => {
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
      y: target.y / canvasWidth,
      width: target.w / canvasWidth,
      success: () => resolve()
    });
  }))).then(() => {});
}