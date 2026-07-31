import { IconBoxMultiple, IconLayoutSidebarRight } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';
import type { ReconstructionCanvas } from '@/types';

interface MultiSelectionProps {

  selection: ReconstructionCanvas[];

  onClose(): void;

}

export const MultiSelection = (props: MultiSelectionProps) => {

  return (
    <div className="h-full flex flex-col gap-2 items-center justify-center p-4 text-center">
      <Button
        variant="ghost"
        className="absolute top-1.5 right-1.5 text-muted-foreground/80"
        onClick={props.onClose}>
        <IconLayoutSidebarRight className="size-4.5" />
      </Button>

      <IconBoxMultiple
        className="size-16 text-muted-foreground opacity-80"
        stroke={0.9} />

      <p className="text-sm text-muted-foreground max-w-32 tracking-wide">
        {props.selection.length} canvases selected
      </p>
    </div>
  )

}