import { IconBoxMultiple } from '@tabler/icons-react';
import type { ReconstructionCanvas } from '@/types';

interface MultiSelectionProps {

  selection: ReconstructionCanvas[];

}

export const MultiSelection = (props: MultiSelectionProps) => {

  return (
    <div className="h-full flex flex-col gap-2 items-center justify-center p-4 text-center">
      <IconBoxMultiple
        className="size-16 text-muted-foreground opacity-80"
        stroke={1} />

      <p className="text-sm text-muted-foreground max-w-32 tracking-wide leading-relaxed">
        {props.selection.length} canvases selected
      </p>
    </div>
  )

}