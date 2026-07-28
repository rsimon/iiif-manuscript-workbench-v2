import type { Viewer } from 'openseadragon';
import { Button } from '@/shadcn/button';
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';

interface ViewerZoomControlsProps {

  viewer?: Viewer | null;

}

export const ViewerZoomControls = ({ viewer }: ViewerZoomControlsProps) => {

  const onZoom = (factor: number) => {
    viewer?.viewport.zoomBy(factor);
    viewer?.viewport.applyConstraints();
  }

  return (
    <>
      <Button
        variant="ghost"
        className="bg-white border border-neutral-300/80 p-2 h-auto aspect-square"
        onClick={() => onZoom(2)}>
        <IconZoomIn className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="bg-white border border-neutral-300/80 p-2 h-auto aspect-square"
        onClick={() => onZoom(0.5)}>
        <IconZoomOut className="size-4" />
      </Button>
    </>
  )

}