import { Cozy, type CozyCanvas, type CozyManifest } from 'cozy-iiif';
import type { ReconstructionCanvas } from '@/types';

export const parseCanvas = (source: unknown): CozyCanvas => {
  const parsed = Cozy.parse(source);

  if (parsed.type !== 'canvas') {
    console.error(parsed);
    throw new Error('IIIF Canvas parse error');
  }

  return parsed.resource;
}

export const parseManifest = (source: unknown): CozyManifest => {
  const parsed = Cozy.parse(source);

  if (parsed.type !== 'manifest') {
    console.error(parsed);
    throw new Error('IIIF Manifest parse error');
  }

  return parsed.resource;
}

export const getEmptyCanvasLabel = (reconstruction: ReconstructionCanvas[]) => {
  const regex = /^New Canvas( \((\d+)\))?$/;

  const numbers = reconstruction
    .map(rc => rc.label.match(regex))
    .filter(Boolean)
    .map(match => (match![2] ? parseInt(match![2]) : 0));

  if (numbers.length === 0) return 'New Canvas';

  const max = Math.max(...numbers);
  return max === 0 ? 'New Canvas (1)' : `New Canvas (${max + 1})`;
}

export const removeCanvasFromReconstruction = (reconstruction: ReconstructionCanvas[], toRemove: string | string[]) => {
  const canvasIds = Array.isArray(toRemove) ? new Set(toRemove) : new Set([toRemove]);
  return reconstruction
    // Remove canvas at root level
    .filter(r => !canvasIds.has(r.id)) 
    // Remove canvas from composites
    .map(r => {
      if (r.type === 'original' || r.sources.every(r => !canvasIds.has(r.canvas.id))) {
        return r;
      } else {
        return {
          ...r,
          sources: r.sources.filter(s => !canvasIds.has(s.canvas.id))
        }
      }
    });
}

export const appendEmptyCanvas = (
  reconstruction: ReconstructionCanvas[], 
  baseURI: string,
  fallbackWidth = 1000, 
  fallbackHeight = 1000
): ReconstructionCanvas[] => {
  const getDimensions = (r: ReconstructionCanvas) => r.type === 'original' ? r.source.canvas : r;

  const { width, height } = reconstruction.length > 0 
    ? getDimensions(reconstruction[reconstruction.length - 1]) 
    : { width: fallbackWidth, height: fallbackHeight};

  return [
    ...reconstruction,
    {
      type: 'composite',
      id: `${baseURI}/${crypto.randomUUID()}`,
      label: getEmptyCanvasLabel(reconstruction),
      sources: [],
      width, 
      height
    }
  ]
}
