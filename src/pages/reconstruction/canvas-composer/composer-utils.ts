import type { Point } from 'openseadragon';
import { parseCanvas } from '@/store/app-store-utils';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import type { 
  ComposerLayout, 
  ComposerLayoutItem, 
  DraggableImage, 
  DraggableImageSelection 
} from './composer-types';

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

export const getIntersectingItems = (
  rect: { x1: number; y1: number; x2: number; y2: number },
  layout: ComposerLayout
): ComposerLayoutItem[] => {
  const minX = Math.min(rect.x1, rect.x2);
  const maxX = Math.max(rect.x1, rect.x2);
  const minY = Math.min(rect.y1, rect.y2);
  const maxY = Math.max(rect.y1, rect.y2);

  return layout.items.filter(item => {
    const itemRight = item.x + item.width;
    const itemBottom = item.y + item.height;
    return item.x <= maxX && itemRight >= minX && item.y <= maxY && itemBottom >= minY;
  });
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

  const [canvasWidth] = getItemCanvasSize(rc);
  const images = imagesByCanvasId.get(item.reconstructionCanvasId) ?? [];

  const hit = images.filter(image => {
    // Image size is in pixel!
    const aspect = image.resource.height / image.resource.width;

    const viewportX = item.x + image.x / canvasWidth;
    const viewportY = item.y + image.y / canvasWidth;
    const viewportW = image.width / canvasWidth;

    const viewportR = viewportX + viewportW;
    const viewportB = viewportY + viewportW * aspect;

    return point.x >= viewportX && point.x <= viewportR && point.y >= viewportY && point.y <= viewportB;
  }).sort((a, b) => {
    const areaA = a.width * a.width * a.resource.height / a.resource.width;
    const areaB = b.width * b.width * b.resource.height / b.resource.height;
    return areaA - areaB;
  })[0];

  if (!hit) return;

  const sourceCanvas = rc.type === 'original'
    ? rc.source
    : rc.sources.find(s => s.canvas.id === hit.sourceCanvasId);

  const isValidSource = sourceCanvas && sourceCanvas.canvas.id === hit.sourceCanvasId;
  if (!isValidSource) {
    // Should never happen
    console.warn(`Source canvas integrity error: hit points to ${hit.sourceCanvasId}, but not found in reconstruction canvas`);
    console.warn(rc);
    return;
  }

  // Splitting images inside source canvases is not supported - only
  // allow changing association for this hit if it's the only image in its canvas
  const canChangeItem = hit ? sourceCanvas.canvas.images.length === 1 : false;
  return { item, image: hit, canChangeItem };
}

export const findSourceCanvasById = (
  sourceCanvasId: string,
  reconstruction: ReconstructionCanvas[]
): SourceCanvas | undefined => {
  for (const canvas of reconstruction) {
    const sources = canvas.type === 'original' ? [canvas.source] : canvas.sources;
    const found = sources.find(s => s.canvas.id === sourceCanvasId);
    if (found) return found;
  }
}

// Applies composer edits back into an app-level reconstruction
export const applyEdits = (
  reconstruction: ReconstructionCanvas[],
  imagesByCanvasId: Map<string, DraggableImage[]>,
  baseURI: string
): ReconstructionCanvas[] => {
  const sourceCanvases = new Map<string, SourceCanvas>();
  const currentImagesBySourceCanvasId = new Map<string, DraggableImage[]>();

  reconstruction.forEach(r => {
    const images = toDraggableImages(r);
    const sources = r.type === 'original' ? [r.source] : r.sources;

    sources.forEach(source => {
      sourceCanvases.set(source.canvas.id, source);
      currentImagesBySourceCanvasId.set(
        source.canvas.id,
        images.filter(image => image.sourceCanvasId === source.canvas.id)
      );
    });
  });

  return reconstruction
    .filter(r => imagesByCanvasId.has(r.id))
    .map(r => {
      // Images in the composer (with user edits)
      const composerImages = imagesByCanvasId.get(r.id)!;
      const sourceCanvasIdSet = new Set(composerImages.map(image => image.sourceCanvasId));

      if (r.type === 'original' && composerImages.length > 0)
        sourceCanvasIdSet.add(r.source.canvas.id);

      const sourceCanvasIds = [...sourceCanvasIdSet];
      const sources = sourceCanvasIds
        .map(sourceCanvasId => sourceCanvases.get(sourceCanvasId))
        .filter(source => !!source);

      const applySourceEdits = (source: SourceCanvas) => applyEditsToSource(
        source,
        composerImages,
        currentImagesBySourceCanvasId.get(source.canvas.id) ?? []
      );

      if (r.type === 'original') {
        if (sourceCanvasIds.length === 1 && sourceCanvasIds[0] === r.source.canvas.id) {
          const nextSource = applySourceEdits(r.source);
          return nextSource === r.source ? r : { ...r, source: nextSource };
        }

        return {
          type: 'composite',
          id: `${baseURI}/${crypto.randomUUID()}`,
          label: r.label,
          sources: sources.map(applySourceEdits),
          width: r.source.canvas.width,
          height: r.source.canvas.height
        };
      } else {
        const nextSources = sources.map(applySourceEdits);

        // Just one source - revert to OriginalCanvas
        if (nextSources.length === 1) {
          const source = nextSources[0];
          
          return {
            type: 'original',
            id: source.canvas.id,
            label: r.label,
            source,
            physicalSize: source.physicalSize
          };
        }

        const unchanged = nextSources.length === r.sources.length &&
          nextSources.every((source, index) => source === r.sources[index]);

        return unchanged ? r : { ...r, sources: nextSources };
      }
    });
}

const toFragmentTarget = (canvasId: string, bounds?: { x: number; y: number; w: number; h: number }) =>
  bounds ? `${canvasId}#xywh=${bounds.x},${bounds.y},${bounds.w},${bounds.h}` : canvasId;

// Applies composer edits onto one source canvas
const applyEditsToSource = (source: SourceCanvas, composerImages: DraggableImage[], currentImages: DraggableImage[]): SourceCanvas => {
  const canvasId = source.canvas.id;

  const composerImagesByKey = new Map(composerImages
    .filter(img => img.sourceCanvasId === canvasId)
    .map(img => [getDraggableImageKey(img), img] as const));

  const currentImagesByKey = new Map(currentImages
    .filter(img => img.sourceCanvasId === canvasId)
    .map(img => [getDraggableImageKey(img), img] as const));

  // Shorthands to original source canvas elements
  const canvasSource = source.canvas.source;
  const canvasSourcePage = canvasSource.items?.[0];
  const canvasSourcePaintAnnotations = canvasSourcePage?.items ?? [];

  let touched = false;

  const seenKeys = new Set<string>();

  // Existing images: keep unchanged, patch the target, or drop
  const keptPaintAnnotations = source.canvas.images.flatMap((resource, index) => {
    const key = getDraggableImageKey({ sourceCanvasId: canvasId, index } as DraggableImage);
    seenKeys.add(key);

    const draggable = composerImagesByKey.get(key);
    if (!draggable) {
      touched = true;
      return [];
    }

    const current = currentImagesByKey.get(key);

    const unchanged = !!current && current.x === draggable.x && current.y === draggable.y && current.width === draggable.width;
    if (unchanged) return [canvasSourcePaintAnnotations[index]];

    touched = true;

    const h = draggable.width * resource.height / resource.width;

    return [{
      ...canvasSourcePaintAnnotations[index],
      target: toFragmentTarget(canvasId, { x: draggable.x, y: draggable.y, w: draggable.width, h })
    }];
  });

  // Composer entries with no matching existing image: added in composer.
  const addedAnnotations = [...composerImagesByKey.entries()]
    .filter(([key]) => !seenKeys.has(key))
    .map(([, draggable]) => {
      touched = true;

      const h = draggable.width * draggable.resource.height / draggable.resource.width;

      return {
        id: `${canvasId}/annotation/${crypto.randomUUID()}`,
        type: 'Annotation',
        motivation: 'painting',
        body: draggable.resource.source,
        target: toFragmentTarget(canvasId, { x: draggable.x, y: draggable.y, w: draggable.width, h })
      };
    });

  if (!touched) return source;

  const nextRawCanvas = {
    ...canvasSource,
    items: [
      canvasSourcePage ? { 
        ...canvasSourcePage, 
        items: [
          ...keptPaintAnnotations, 
          ...addedAnnotations
        ] 
      } : { 
        id: `${canvasId}/page/${crypto.randomUUID()}`, 
        type: 'AnnotationPage', 
        items: [
          ...keptPaintAnnotations, 
          ...addedAnnotations
        ]
      }
    ]
  };

  return { ...source, canvas: parseCanvas(nextRawCanvas) };
}