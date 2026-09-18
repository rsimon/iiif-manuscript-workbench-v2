import type { ReconstructionCanvas, SourceManifest } from '@/types';

export const createManifest = (
  label: string,
  summary: string,
  attribution: string,
  sources: SourceManifest[],
  reconstruction: ReconstructionCanvas[],
  baseURI: string
) => {
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

const normalizeFragmentTarget = (target: unknown) => {
  if (typeof target !== 'string') return target;

  return target.replace(/#xywh=([\d.]+),([\d.]+),([\d.]+),([\d.]+)$/, (_, x, y, w, h) =>
    `#xywh=${Math.round(Number(x))},${Math.round(Number(y))},${Math.round(Number(w))},${Math.round(Number(h))}`
  );
}

const toRegionBody = (body: unknown, baseURI: string) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;

  const image = body as { id?: unknown; selector?: unknown; [key: string]: unknown };

  if (image.type === 'SpecificResource' && image.source && typeof image.source === 'object') {
    const source = image.source as { id?: unknown; selector?: unknown; [key: string]: unknown };
    const selector = source.selector ?? image.selector;
    if (selector && typeof selector === 'object' && !Array.isArray(selector)) {
      const region = (selector as { region?: string }).region;
      if (typeof region === 'string' && /^\d+,\d+,\d+,\d+$/.test(region)) {
        return {
          id: `${baseURI}/specific-resource/${crypto.randomUUID()}`,
          type: 'SpecificResource',
          source: {
            ...source,
            id: typeof source.id === 'string' ? source.id : image.id
          },
          selector: {
            type: 'ImageApiSelector',
            region
          }
        };
      }
    }
  }

  if (typeof image.id !== 'string') return body;

  const selector = (image as { selector?: unknown }).selector;
  if (!selector || typeof selector !== 'object' || Array.isArray(selector)) return body;

  const region = (selector as { region?: string }).region;
  if (typeof region !== 'string' || !/^\d+,\d+,\d+,\d+$/.test(region)) return body;

  return {
    id: `${baseURI}/specific-resource/${crypto.randomUUID()}`,
    type: 'SpecificResource',
    source: {
      ...image,
      id: image.id
    },
    selector: {
      type: 'ImageApiSelector',
      region
    }
  };
};

const toCanvasItem = (r: ReconstructionCanvas, baseURI: string) => {
  const { width, height } = r;

  // https://iiif.io/api/annex/services/#physical-dimensions
  const physdim = r.physicalSize ? {
    service: {
      '@context': 'http://iiif.io/api/annex/services/physdim/1/context.json',
      profile: 'http://iiif.io/api/annex/services/physdim',
      physicalScale: r.physicalSize.width / width,
      physicalUnits: r.physicalSize.unit
    }
  } : {};

  if (r.type === 'original') {
    return {
      ...r.source.canvas.source,
      items: r.source.canvas.source.items?.map(page => ({
        ...page,
        items: page.items?.map(annotation => ({
          ...annotation,
          body: Array.isArray(annotation.body)
            ? annotation.body.map(body => toRegionBody(body, baseURI))
            : toRegionBody(annotation.body, baseURI),
          target: normalizeFragmentTarget(annotation.target)
        }))
      })),
      width,
      height,
      label: { en: [r.label] },
      ...physdim
    };

  } else {
    const canvasId = `${baseURI}/canvas/${crypto.randomUUID()}`;

    return {
      id: canvasId,
      type: 'Canvas',
      label: { en: [ r.label ] },
      width,
      height,
      ...physdim,
      items: r.sources.length === 0 ? [] :[{
        id: `${canvasId}/page/1`,
        type: 'AnnotationPage',
        items: r.sources.flatMap(sc => sc.canvas.images.map(image => ({
          id: `${canvasId}/annotation/${crypto.randomUUID()}`,
          type: 'Annotation',
          motivation: 'painting',
          body: toRegionBody(image.source, baseURI),
          target: image.target 
            ? `${canvasId}#xywh=${Math.round(image.target.x)},${Math.round(image.target.y)},${Math.round(image.target.w)},${Math.round(image.target.h)}`
            : canvasId
        })))
      }]
    };
  }
}
