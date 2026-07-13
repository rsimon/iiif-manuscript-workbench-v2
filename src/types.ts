import type { CozyCanvas, CozyManifest } from 'cozy-iiif';

/** Sources **/

export interface SourceManifest {

  url: string;
  
  manifest: CozyManifest;

}

export interface SourceCanvas {

  sourceManifestId: string;

  canvas: CozyCanvas;

}

/** Reconstruction **/

export interface Reconstruction {

  quires: Quire[]

}

export interface Quire {

  id: string;

  label?: string;

  leaves: Leaf[];

}

export interface Leaf {

  id: string;

  recto: ReconstructionCanvas | null;

  verso: ReconstructionCanvas | null;

}

export interface OriginalCanvas {

  type: 'original';

  id: string;

  label: string;

  source: SourceCanvas;

}

export interface CompositeCanvas {

  type: 'composite';

  id: string;

  label: string;

  sources: SourceCanvas[];

}

export type ReconstructionCanvas = 
  | OriginalCanvas 
  | CompositeCanvas;