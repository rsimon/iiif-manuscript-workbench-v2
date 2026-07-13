import type { ReconstructionCanvas } from '@/types';
import type { CozyImageResource } from 'cozy-iiif';

export interface ComposerLayout {

  items: ComposerLayoutItem[];

  layoutWidth: number;

  layoutHeight: number;

}

export interface ComposerLayoutItem {

  canvas: ReconstructionCanvas;

  x: number; 
  
  y: number; 
  
  width: number; 
  
  height: number;

  images: DraggableImage[];

}

export interface DraggableImage {

  sourceCanvasId: string;

  resource: CozyImageResource;

  tileSource: object | string;

  x: number;

  y: number;

  width: number;

  index: number;

}

export type CornerHandleType = 
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_RIGHT'
  | 'BOTTOM_LEFT';

export type EdgeHandleType = 
  | 'TOP'
  | 'RIGHT'
  | 'BOTTOM'
  | 'LEFT';

export type ResizeHandleType =
  | CornerHandleType
  | EdgeHandleType;

export type HandleType = 
  | 'SHAPE'
  | ResizeHandleType;