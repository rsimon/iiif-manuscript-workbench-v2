import type { CompositeCanvas, OriginalCanvas, ReconstructionCanvas, SourceCanvas, SourceManifest } from '@/types';
import { Cozy, type CozyCanvas, type CozyManifest } from 'cozy-iiif';

export interface ReconstructionParseResult {

  sources: SourceManifest[];

  reconstruction: ReconstructionCanvas[];

}

export const parseReconstructionManifest = async (manifest: CozyManifest): Promise<ReconstructionParseResult> => {
  // Parse list of source manifests
  const field = (manifest.source.metadata || []).find(m => {
    // Brittle... perhaps we can find a more robust way to encode this in the future
    const isManifestsField = 
      Array.isArray(m.label?.en) && 
      m.label.en[0] === 'Source Manifests' &&
      Array.isArray(m.value?.en) &&
      m.value.en.length > 0 &&
      m.value.en.every(url => typeof url === 'string' && url.startsWith('http'));

    return isManifestsField;
  });

  if (!field) 
    throw new Error('Not a reconstruction');

  // Fetch source manifests
  const sourceManifestURLs = field.value.en?.filter(Boolean) as string[];
  const sources = await sourceManifestURLs.reduce<Promise<SourceManifest[]>>((p, url) => p.then(sources => {
    return Cozy.parseURL(url).then(result => {
      if (result.type !== 'manifest')
        throw new Error(`Could not fetch manifest ${url}`);

      return [...sources, { manifest: result.resource, url }];
    });
  }), Promise.resolve([]));

  const findOriginalSource = (canvas: CozyCanvas) => sources.reduce<SourceCanvas | undefined>((found, source) => {
    if (found) return found;
    const match = source.manifest.canvases.find(c => c.id === canvas.id);
    return match ? { sourceManifestId: source.manifest.id, canvas } : found;
  }, undefined);

  const findCompositeSources = (canvas: CozyCanvas) => {
    // For each image in the canvas, find the matching source (de-duplicate!)
    const findSourceByImage = (identifier: string) => {
      return sources.reduce<SourceCanvas | undefined>((found, source) => {
        if (found) return found;

        const match = source.manifest.canvases.find(canvas => {
          // Match any image in that CozyCanvas
          return canvas.images.find(img => {
            const id = img.type === 'static' ? img.url : img.serviceUrl;
            return id === identifier;
          });
        })

        return match ? { sourceManifestId: source.manifest.id, canvas } : found;
      }, undefined);
    }

    return canvas.images.reduce<SourceCanvas[]>((sources, image) => {
      const identifier = image.type === 'static' ? image.url : image.serviceUrl;
      const source = findSourceByImage(identifier);
      const exists = source && sources.some(sc => sc.canvas.id === source.canvas.id);
      return (source && !exists) ? [...sources, source] : sources;
    }, []);
  }

  // Compile reconstruction canvases
  const reconstruction: Partial<ReconstructionCanvas>[] = manifest.canvases.map(canvas => {
    return canvas.images.length === 1 ? {
      type: 'original',
      id: canvas.id,
      label: canvas.getLabel(),
      height: canvas.height,
      width: canvas.width,
      source: findOriginalSource(canvas)
    } as Partial<OriginalCanvas> : {
      type: 'composite',
      id: canvas.id,
      label: canvas.getLabel(),
      height: canvas.height,
      width: canvas.width,
      sources: findCompositeSources(canvas)
    } as CompositeCanvas;
  });

  if (reconstruction.some(rc => rc.type === 'original' && !rc.source))
    throw new Error('Could not parse reconstruction manifest');

  return {

    sources,

    reconstruction: reconstruction as ReconstructionCanvas[]
  
  };
}