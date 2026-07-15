import { cn, withStopPropagation } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';
import {
  IconArrowBarToDown,
  IconArrowBarToUp,
  IconCircleMinus,
  IconDots,
  IconPencil
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shadcn/dropdown-menu';

interface ReconstructionTreeItemProps {

  className?: string;

  item: ReconstructionCanvas;

}

export const ReconstructionTreeItemActions = (props: ReconstructionTreeItemProps) => {

  const removeCanvas = useAppStore(state => state.removeCanvasFromReconstruction);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={withStopPropagation(e => e.preventDefault())}
        className={cn(
          'rounded-full p-1 opacity-0 group-hover:opacity-100 data-popup-open:opacity-100 text-muted-foreground/80 hover:text-foreground cursor-pointer',
          props.className
        )}>
        <IconDots className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <IconPencil /> Rename canvas
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <IconArrowBarToUp /> Move to top
        </DropdownMenuItem>

        <DropdownMenuItem>
          <IconArrowBarToDown /> Move to bottom
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          variant="destructive"
          onClick={() => removeCanvas(props.item.id)}>
          <IconCircleMinus /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}