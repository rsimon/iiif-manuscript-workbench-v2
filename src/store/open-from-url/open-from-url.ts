import { parseCanvas } from '@/store/app-store-utils';
import { 
  Cozy, 
  type CozyCanvas, 
  type CozyImageResource, 
  type CozyManifest 
} from 'cozy-iiif';
import type {
  PhysicalSize, 
  ReconstructionCanvas, 
  SourceCanvas, 
  SourceManifest 
} from '@/types';

export interface ReconstructionParseResult {

  sources: SourceManifest[];

  reconstruction: ReconstructionCanvas[];

}

const parsePhysicalSize = (canvas: CozyCanvas): PhysicalSize | undefined => {
  const services = 
    Array.isArray(canvas.source.service) ? canvas.source.service : 
    canvas.source.service ? [canvas.source.service] :
    [];

  const physDimService = services.find(s => s.profile === 'http://iiif.io/api/annex/services/physdim');
  if (!physDimService) return;

  try {
    const physicalScale = parseFloat((physDimService as any).physicalScale);
    const unit = (physDimService as any).physicalUnits;

    if (isNaN(physicalScale))
      throw new Error(`Could not parse scale: ${(physDimService as any).physicalScale}`);

    if (!unit)
      throw new Error(`Physical units missing`);

    const width = Math.round(100 * canvas.width * physicalScale) / 100;
    const height = Math.round(100 * canvas.height * physicalScale) / 100;
    return { width, height, unit };
  } catch (error) {
    console.error(error);
    console.warn(physDimService);
    console.warn('Error parsing physical size');
  }
}

const parseReconstructionManifest = async (manifest: CozyManifest): Promise<ReconstructionParseResult> => {
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

  // Based on a CozyCanvas from the imported project manifest WITH A SINGLE IMAGE, this 
  // function regenerates the (single) `SourceCanvas` object, by linking the CozyCanvas to its
  // original source manifest, and injecting the physical size (if any)
  const regenerateSourceCanvas = (canvas: CozyCanvas, physicalSize?: PhysicalSize): SourceCanvas | undefined => 
    sources.reduce<SourceCanvas | undefined>((found, source) => {
      if (found) return found;
      const match = source.manifest.canvases.find(c => c.id === canvas.id);
      return match ? { sourceManifestId: source.manifest.id, canvas, physicalSize } : found;
    }, undefined);

  // Based on a CozyCanvas from the imported project manifest, WITH MULTIPLE IMAGES,
  // this function creates the list of `SourceCanvas` objects, by:
  // - Identfying which source canvases the images belong to
  // - Re-grouping them accordingly
  // - Regenerating the SourceCanvas list, with images and targets 
  const regenerateCompositeSources = (canvas: CozyCanvas): SourceCanvas[] => {
    const getIdentifier = (img: CozyImageResource) =>
      img.type === 'static' ? img.url : img.serviceUrl;

    // The export flattens all source canvases into one canvas. Group the
    // exported images back by the resolved source canvas they came from.
    const groups = new Map<string, {
      source: SourceCanvas;
      images: CozyImageResource[]
    }>();

    canvas.images.forEach(image => {
      const imageId = getIdentifier(image);

      const source = sources.reduce<SourceCanvas | undefined>((found, sourceManifest) => {
        if (found) return found;

        const sourceCanvas = sourceManifest.manifest.canvases.find(sourceCanvas =>
          sourceCanvas.images.some(sourceImage => getIdentifier(sourceImage) === imageId));

        return sourceCanvas
          ? { sourceManifestId: sourceManifest.manifest.id, canvas: sourceCanvas }
          : undefined;
      }, undefined);

      if (!source) return;

      const group = groups.get(source.canvas.id);
      if (group)
        group.images.push(image);
      else
        groups.set(source.canvas.id, { source, images: [image] });
    });

    return [...groups.values()].map(({ source, images }) => {
      const targetsByImage = new Map<string, string[]>();

      images.forEach(image => {
        if (!image.target) return;

        const key = JSON.stringify(image.source);

        const target = `${canvas.id}#xywh=${image.target.x},${image.target.y},${image.target.w},${image.target.h}`;
        targetsByImage.set(key, [
          ...(targetsByImage.get(key) || []),
          target
        ]);
      });

      const sourceCanvas = {
        ...source.canvas.source,
        items: (source.canvas.source.items || []).map(page => ({
          ...page,
          items: page.items?.map(annotation => {
            const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
            const targets = targetsByImage.get(JSON.stringify(body))
            const target = targets?.shift();
            return target ? { ...annotation, target } : annotation;
          })
        }))
      };

      return {
        ...source,
        canvas: parseCanvas(sourceCanvas)
      };
    });
  }

  // Compile reconstruction canvases
  const reconstruction: Partial<ReconstructionCanvas>[] = manifest.canvases.map(canvas => {
    if (canvas.images.length === 1) {
      const physicalSize = parsePhysicalSize(canvas);
      return {
        type: 'original',
        id: canvas.id,
        label: canvas.getLabel(),
        height: canvas.height,
        width: canvas.width,
        source: regenerateSourceCanvas(canvas, physicalSize),
        physicalSize
      }
    } else {
      return {
        type: 'composite',
        id: canvas.id,
        label: canvas.getLabel(),
        height: canvas.height,
        width: canvas.width,
        sources: regenerateCompositeSources(canvas),
        physicalSize: parsePhysicalSize(canvas)
      }
    }
  });

  if (reconstruction.some(rc => rc.type === 'original' && !rc.source))
    throw new Error('Could not parse reconstruction manifest');

  return {
    sources,
    reconstruction: reconstruction as ReconstructionCanvas[]
  };
}

export const openReconstructionFromURL = async (url: string) => {
  const result = await Cozy.parseURL(url);

  if (result.type === 'error')
    throw new Error(result.message);

  if (result.type !== 'manifest')
    throw new Error('Not a presentation manifest');

  return parseReconstructionManifest(result.resource);
}