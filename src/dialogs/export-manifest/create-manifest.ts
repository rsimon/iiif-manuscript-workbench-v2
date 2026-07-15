import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';

export const createManifest = (
  label: string,
  summary: string,
  attribution: string
) => {
  const { baseURI, reconstruction, sources } = useAppStore.getState();

  return {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    type: 'Manifest',
    id: baseURI,
    label: {
      en: [label]
    },
    summary: {
      en: [summary]
    },
    requiredStatement: {
      label: { en: [ 'Attribution' ]},
      value: { en: [ attribution ]}
    },
    metadata: [
      {
        label: { en: ['Created' ]},
        value: { en: [ new Date().toISOString() ]},
      },
      {
        label: { en: ['Source Manifests']},
        value: { en: [sources.map(s => s.url).join(', ')]},
      },
    ],
    items: reconstruction.map(r => toCanvasItem(r, baseURI))
  }
}

const toCanvasItem = (r: ReconstructionCanvas, baseURI: string) => {
  if (r.type === 'original') return r.source.canvas.source;

  const canvasId = `${baseURI}/canvas/${crypto.randomUUID()}`;

  return {
    id: canvasId,
    type: 'Canvas',
    label: { en: [r.label] },
    width: r.width,
    height: r.height,
    items: [{
      id: `${canvasId}/page/1`,
      type: 'AnnotationPage',
      items: r.sources.flatMap(sc => sc.canvas.images.map(image => ({
        id: `${canvasId}/annotation/${crypto.randomUUID()}`,
        type: 'Annotation',
        motivation: 'painting',
        body: image.source,
        target: image.target 
          ? `${canvasId}#xywh=${Math.ceil(image.target.x)},${Math.ceil(image.target.y)},${Math.ceil(image.target.w)},${Math.ceil(image.target.h)}`
          : canvasId
      })))
    }]
  };
}
