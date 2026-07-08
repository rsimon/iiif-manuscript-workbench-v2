import { Button } from '@/shadcn/button';
import { useViewer } from './source-preview';
import { IconLayoutSidebarRight, IconZoomIn, IconZoomOut } from '@tabler/icons-react';

interface SourcePreviewControlsProps {

  isInspectorOpen: boolean;

  setInspectorOpen(open: boolean): void;

}
export const SourcePreviewControls = (props: SourcePreviewControlsProps) => {
  const viewer = useViewer();

  const onZoom = (factor: number) => {
    viewer?.viewport.zoomBy(factor);
    viewer?.viewport.applyConstraints();
  }

  return (
    <div className="absolute top-3 right-3 flex gap-1.5">
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

      <Button
        variant="ghost"
        size="icon"
        className="bg-white border border-neutral-300/80 p-2 h-auto aspect-square"
        onClick={() => props.setInspectorOpen(!props.isInspectorOpen)}>
        <IconLayoutSidebarRight className="size-4.5" />
      </Button>
    </div>
  )

}