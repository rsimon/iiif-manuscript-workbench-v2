import type { Viewer } from 'openseadragon';
import { ViewerZoomControls } from '@/components/viewer-zoom-controls';
import { Button } from '@/shadcn/button';
import { IconLayoutSidebarRight } from '@tabler/icons-react';

interface ViewerControlsProps {

  viewer?: Viewer | null;

  isInspectorOpen: boolean;

  onChangeInspectorOpen(open: boolean): void;

}

export const ViewerControls = (props: ViewerControlsProps) => {

  return (
    <div className="absolute top-3 right-3 flex gap-1.5">
      <ViewerZoomControls viewer={props.viewer} />

      <Button
        variant="ghost"
        size="icon"
        className="bg-white border border-neutral-300/80 p-2 h-auto aspect-square"
        onClick={() => props.onChangeInspectorOpen(!props.isInspectorOpen)}>
        <IconLayoutSidebarRight className="size-4.5" />
      </Button>
    </div>
  )

}