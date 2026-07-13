import type { ReconstructionCanvas } from '@/types';

// Just a hack for now
export const getRepresentativeCanvas = (canvas: ReconstructionCanvas) =>
  canvas.type === 'original' ? canvas.source.canvas : canvas.sources[0].canvas;
