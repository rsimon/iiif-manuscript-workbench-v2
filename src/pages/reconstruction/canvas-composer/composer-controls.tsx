import { Button } from '@/shadcn/button';
import { IconLayoutSidebarRight } from '@tabler/icons-react';

interface ComposerControlsProps {

  isSidebarOpen: boolean;

  onChangeSidebarOpen(open: boolean): void;

}

export const ComposerControls = (props: ComposerControlsProps) => {
  
  return (
    <div className="absolute top-3 right-3 flex gap-1.5 z-20">
      <Button
        variant="ghost"
        size="icon"
        className="bg-white border border-neutral-300/80 p-2 h-auto aspect-square"
        onClick={() => props.onChangeSidebarOpen(!props.isSidebarOpen)}>
        <IconLayoutSidebarRight className="size-4.5" />
      </Button>
    </div>
  )

}