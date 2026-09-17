import type { Point } from 'openseadragon';
import type { CozyCanvas, CozyImageResource } from 'cozy-iiif';
import { parseCanvas } from '@/store/app-store-utils';
import type { ReconstructionCanvas, SourceCanvas } from '@/types';
import type { ComposerLayout, ComposerLayoutItem, DraggableImage, DraggableImageSelection } from '../reconstruction-types';
import { getDraggableImageKey } from '../reconstruction-utils';

const DEFAULT_IMAGE_WIDTH = 0.4;
const DEFAULT_IMAGE_STEP = 0.05; // rightward/downward shift per stacked image

const parseRegionString = (region: string | undefined): { x: number; y: number; width: number; height: number } | undefined => {
  if (!region) return;

  const normalized = region.startsWith('xywh=') ? region.slice('xywh='.length) : region;
  const match = normalized.match(/^(\d+),(\d+),(\d+),(\d+)$/);
  if (!match) return;

  return {
    x: Number(match[1]),
    y: Number(match[2]),
    width: Number(match[3]),
    height: Number(match[4])
  };
};

const getRegionFromSelector = (selector: unknown): { x: number; y: number; width: number; height: number } | undefined => {
  if (!selector || typeof selector !== 'object' || Array.isArray(selector)) return;

  const candidate = selector as {
    type?: string;
    value?: string;
    region?: string | { x: number; y: number; width: number; height: number };
  };

  if (candidate.region && typeof candidate.region === 'object') {
    const { x, y, width, height } = candidate.region;
    if ([x, y, width, height].every(value => Number.isFinite(value))) {
      return { x, y, width, height };
    }
  }

  const regionValue = candidate.region ?? candidate.value;
  return parseRegionString(typeof regionValue === 'string' ? regionValue : undefined);
};

export const getFullCrop = (image: CozyImageResource) => ({
  x: 0,
  y: 0,
  width: image.width,
  height: image.height
});

const getCropFromSource = (image: CozyImageResource) => {
  const source = image.source as { selector?: unknown };
  const region = getRegionFromSelector(source.selector);
  if (region) return region;

  return getFullCrop(image);
};

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
          crop: getCropFromSource(image),
          index: idx
        } as DraggableImage
      })
    ]
  }, []);
}

// x/y/width an image must have to fully fit the canvas
export const getFillSize = (
  image: DraggableImage,
  canvas: ReconstructionCanvas
): { x: number; y: number; width: number } => {
  const { width: canvasWidth, height: canvasHeight } = canvas;

  const crop = image.crop ?? getFullCrop(image.resource);
  const aspect = crop.height / crop.width;
  const width = Math.min(canvasWidth, canvasHeight / aspect);
  const height = width * aspect;

  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
    width
  };
}

export const isSelectionFullSize = (
  selection: DraggableImageSelection,
  reconstruction: ReconstructionCanvas[]
): boolean => {
  const FILL_SIZE_EPSILON = 1e-6;

  const canvas = reconstruction.find(r => r.id === selection.item.reconstructionCanvasId);
  if (!canvas) return false;

  const fill = getFillSize(selection.image, canvas);

  return Math.abs(selection.image.x - fill.x) < FILL_SIZE_EPSILON &&
    Math.abs(selection.image.y - fill.y) < FILL_SIZE_EPSILON &&
    Math.abs(selection.image.width - fill.width) < FILL_SIZE_EPSILON;
}

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

  const images = imagesByCanvasId.get(item.reconstructionCanvasId) ?? [];

  const hit = images.filter(image => {
    // Image size is in pixel!
    const crop = image.crop ?? getFullCrop(image.resource);
    const aspect = crop.height / crop.width;

    const viewportX = item.x + image.x / rc.width;
    const viewportY = item.y + image.y / rc.width;
    const viewportW = image.width / rc.width;

    const viewportR = viewportX + viewportW;
    const viewportB = viewportY + viewportW * aspect;

    return point.x >= viewportX && point.x <= viewportR && point.y >= viewportY && point.y <= viewportB;
  }).sort((a, b) => {
    const cropA = a.crop ?? getFullCrop(a.resource);
    const cropB = b.crop ?? getFullCrop(b.resource);
    const areaA = a.width * a.width * cropA.height / cropA.width;
    const areaB = b.width * b.width * cropB.height / cropB.width;
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
          width: r.width,
          height: r.height,
          physicalSize: r.physicalSize
        };
      } else {
        const nextSources = sources.map(applySourceEdits);

        // Just one source left - revert to OriginalCanvas
        if (nextSources.length === 1) {
          const source = nextSources[0];
          return {
            type: 'original',
            id: source.canvas.id,
            label: r.label,
            source,
            width: r.width,
            height: r.height,
            physicalSize: r.physicalSize ?? source.physicalSize
          };
        }

        const unchanged = nextSources.length === r.sources.length &&
          nextSources.every((source, index) => source === r.sources[index]);

        return unchanged ? r : { ...r, sources: nextSources };
      }
    });
}

const toFragmentTarget = (canvas: CozyCanvas, bounds?: { x: number; y: number; w: number; h: number }) => {
  if (!bounds) return canvas.id;
  const x = Math.round(bounds.x);
  const y = Math.round(bounds.y);
  const w = Math.round(bounds.w);
  const h = Math.round(bounds.h);
  const isFullSize = x === 0 && y === 0 && w === canvas.width && h === canvas.height;
  return isFullSize ? canvas.id : `${canvas.id}#xywh=${x},${y},${w},${h}`;
}

const withCropFragment = (image: DraggableImage): CozyImageResource['source'] => {
  const source = image.resource.source;
  const crop = image.crop;
  if (!crop || (crop.x === 0 && crop.y === 0 && crop.width === image.resource.width && crop.height === image.resource.height))
    return source;

  const id = typeof source.id === 'string' ? source.id.replace(/#xywh=.*$/, '') : source.id;

  const nextSource = {
    ...source,
    id,
    selector: {
      type: 'ImageApiSelector',
      region: `${Math.round(crop.x)},${Math.round(crop.y)},${Math.round(crop.width)},${Math.round(crop.height)}`
    }
  } as typeof source & {
    selector: {
      type: 'ImageApiSelector';
      region: string;
    };
  };

  return nextSource;
};

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

    const unchanged = !!current && current.x === draggable.x && current.y === draggable.y && current.width === draggable.width &&
      JSON.stringify(current.crop) === JSON.stringify(draggable.crop);
    if (unchanged) return [canvasSourcePaintAnnotations[index]];

    touched = true;

    const crop = draggable.crop ?? getFullCrop(resource);
    const h = draggable.width * crop.height / crop.width;

    return [{
      ...canvasSourcePaintAnnotations[index],
      body: withCropFragment(draggable),
      target: toFragmentTarget(source.canvas, { x: draggable.x, y: draggable.y, w: draggable.width, h })
    }];
  });

  // Composer entries with no matching existing image: added in composer.
  const addedAnnotations = [...composerImagesByKey.entries()]
    .filter(([key]) => !seenKeys.has(key))
    .map(([, draggable]) => {
      touched = true;

      const crop = draggable.crop ?? getFullCrop(draggable.resource);
      const h = draggable.width * crop.height / crop.width;

      return {
        id: `${canvasId}/annotation/${crypto.randomUUID()}`,
        type: 'Annotation',
        motivation: 'painting',
        body: withCropFragment(draggable),
        target: toFragmentTarget(source.canvas, { x: draggable.x, y: draggable.y, w: draggable.width, h })
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