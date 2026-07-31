import { IconLayoutSidebarRight, IconMicroscope } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';

interface EmptySidebarProps {

  onClose(): void;

}

export const EmptySidebar = (props: EmptySidebarProps) => {

  return (
    <div className="relative h-full flex flex-col gap-2 items-center justify-center p-4 text-center">
      <Button
        variant="ghost"
        className="absolute top-1.5 right-1.5 text-muted-foreground/80"
        onClick={props.onClose}>
        <IconLayoutSidebarRight className="size-4.5" />
      </Button>
      
      <IconMicroscope
        className="size-16 text-muted-foreground opacity-80"
        stroke={1} />

      <p className="text-xs text-muted-foreground max-w-38 leading-relaxed tracking-wide">
        Click a canvas or an image to select it
      </p>
    </div>
  )

}