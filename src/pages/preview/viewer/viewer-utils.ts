import type { ReconstructionCanvas } from '@/types';
import OpenSeadragon, { type Viewer } from 'openseadragon';
import type { CozyImageResource } from 'cozy-iiif';

const getCanvasDimensions = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas;

const getCanvasImages = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original'
    ? canvas.source.canvas.images
    : canvas.sources.flatMap(s => s.canvas.images);

const PLACEHOLDER_HEIGHT = 1650 / 1200;

export const getImageCrop = (image: CozyImageResource) => {
  const selector = (image.source as { selector?: unknown }).selector;

  if (selector && typeof selector === 'object' && !Array.isArray(selector)) {
    const candidate = selector as { region?: string | { x: number; y: number; width: number; height: number }; value?: string };

    if (candidate.region && typeof candidate.region === 'object') {
      const { x, y, width, height } = candidate.region;
      if ([x, y, width, height].every(value => Number.isFinite(value))) {
        return { x, y, width, height };
      }
    }

    const region = typeof candidate.region === 'string'
      ? candidate.region
      : typeof candidate.value === 'string'
        ? candidate.value
        : undefined;

    if (region) {
      const match = region.replace(/^xywh=/, '').match(/^(\d+),(\d+),(\d+),(\d+)$/);
      if (match) {
        return {
          x: Number(match[1]),
          y: Number(match[2]),
          width: Number(match[3]),
          height: Number(match[4])
        };
      }
    }
  }

  return {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height
  };
};

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
    image,
    target: image.target || { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  })) : [{
    image: undefined,
    tileSource: { type: 'image', url: './empty_placeholder.png' },
    target: { x: 0, y: 0, w: canvasWidth, h: canvasHeight }
  }];

  return Promise.all(items.map(({ image, target }) => new Promise<void>(resolve => {
    const crop = image ? getImageCrop(image) : undefined;
    const scale = crop ? target.w / crop.width : undefined;

    viewer.addTiledImage({
      tileSource: image
        ? (image.type === 'dynamic' || image.type === 'level0' ? image.serviceUrl : image.url)
        : { type: 'image', url: './empty_placeholder.png' },
      x: xOffset + (target.x - (crop?.x ?? 0) * (scale ?? 1)) / canvasWidth,
      y: yOffset + (target.y - (crop?.y ?? 0) * (scale ?? 1)) / canvasWidth,
      width: image ? image.width * (scale ?? 1) / canvasWidth : target.w / canvasWidth,
      clip: crop ? new OpenSeadragon.Rect(crop.x, crop.y, crop.width, crop.height) : undefined,
      success: () => resolve()
    });
  }))).then(() => {});
}