import type { Point } from 'openseadragon';
import type { ComposerLayout, ComposerLayoutItem, DraggableImage } from './composer-types';

export interface ImageSelection {

  image: DraggableImage;

  item: ComposerLayoutItem;

}

export const getItemAt = (point: Point, layout: ComposerLayout): ComposerLayoutItem => {
  const hits = layout.items.filter(item => {
    const right = item.x + item.width;
    const bottom = item.y + item.height;
    return point.x >= item.x && point.x <= right && point.y >= item.y && point.y <= bottom;
  });

  return hits.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaA - areaB;
  })[0];
}

export const getImageAt = (point: Point, layout: ComposerLayout): ImageSelection | undefined => {
  const item = getItemAt(point, layout);
  if (!item) return;

  const [canvasWidth, canvasHeight] = item.canvas.type === 'original' 
    ? [item.canvas.source.canvas.width, item.canvas.source.canvas.height]
    : [item.canvas.width, item.canvas.height];

  const hit = item.images.filter(image => {
    // Image size is in pixel!
    const aspect = image.resource.height / image.resource.width;

    const viewportX = item.x + image.x / canvasWidth;
    const viewportY = item.y + image.y / canvasHeight;
    const viewportW = image.width / canvasWidth;

    const viewportR = viewportX + viewportW;
    const viewportB = viewportY + viewportW * aspect;

    return point.x >= viewportX && point.x <= viewportR && point.y >= viewportY && point.y <= viewportB;
  }).sort((a, b) => {
    const areaA = a.width * a.width * a.resource.height / a.resource.width;
    const areaB = b.width * b.width * b.resource.height / b.resource.height;
    return areaA - areaB;
  })[0];

  return hit ? { item, image: hit } : undefined;
}