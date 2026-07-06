import type { CozyCanvas, CozyManifest } from 'cozy-iiif';

export interface SourceManifest {

  url: string;
  
  manifest: CozyManifest;

}

export interface ReconstructionCanvas {

  sourceManifestId?: string;

  canvas: CozyCanvas;

}
