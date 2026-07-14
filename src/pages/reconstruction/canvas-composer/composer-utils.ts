import type { Point } from 'openseadragon';
import type { ComposerLayout, ComposerLayoutItem, DraggableImage, DraggableImageSelection } from './composer-types';
import type { ReconstructionCanvas } from '@/types';

const DEFAULT_IMAGE_WIDTH = 0.4;
const DEFAULT_IMAGE_STEP = 0.05; // rightward/downward shift per stacked image

export const toDraggableImages = (r: ReconstructionCanvas): DraggableImage[] => {
  const sources = r.type === 'original' ? [r.source] : r.sources;

  return sources.reduce<DraggableImage[]>((agg, source) => {
    return [
      ...agg, 
      ...source.canvas.images.map((image, idx) => {
        const runningIndex = agg.length + idx;

        const defaultWidth = runningIndex === 0 
          ? source.canvas.width : source.canvas.width * DEFAULT_IMAGE_WIDTH;
          
        const defaultOffset = runningIndex === 0
          ? 0 : source.canvas.width * DEFAULT_IMAGE_STEP * runningIndex;

        const x = image.target ? image.target.x : defaultOffset;
        const y = image.target ? image.target.y : defaultOffset;
        const width = image.target ? image.target.w : defaultWidth;

        return {
          sourceCanvasId: source.canvas.id,
          resource: image,
          tileSource: image.type === 'dynamic' || image.type === 'level0' ? image.serviceUrl : {
            type: 'image',
            url: image.getImageURL()
          },
          x,
          y,
          width,
          index: idx
        } as DraggableImage
      })
    ]
  }, []);
}

export const getDraggableImageKey = (image: DraggableImage): string =>
  `${image.sourceCanvasId}:${image.index}`;

export const getItemCanvasSize = (canvas: ReconstructionCanvas): [number, number] =>
  canvas.type === 'original'
    ? [canvas.source.canvas.width, canvas.source.canvas.height]
    : [canvas.width, canvas.height];

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

export const getImageAt = (
  point: Point,
  layout: ComposerLayout,
  reconstruction: ReconstructionCanvas[],
  imagesByCanvasId: Map<string, DraggableImage[]>
): DraggableImageSelection | undefined => {
  const item = getItemAt(point, layout);
  if (!item) return;

  const rc = reconstruction.find(r => r.id === item.reconstructionCanvasId);
  if (!rc) return;

  const [canvasWidth, canvasHeight] = getItemCanvasSize(rc);
  const images = imagesByCanvasId.get(item.reconstructionCanvasId) ?? [];

  const hit = images.filter(image => {
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