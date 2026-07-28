import { cn, withStopPropagation, withViewTransition } from '@/shadcn/utils';
import { useAppStore } from '@/store/app-store';
import type { ReconstructionCanvas } from '@/types';
import {
  IconArrowBarToDown,
  IconArrowBarToUp,
  IconArrowDown,
  IconArrowUp,
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

  onRenameCanvas(): void;

}

export const ReconstructionTreeItemActions = (props: ReconstructionTreeItemProps) => {

  const removeCanvas = useAppStore(state => state.removeCanvasFromReconstruction);
  const moveCanvas = useAppStore(state => state.moveCanvas);

  const index = useAppStore(state => state.reconstruction.findIndex(r => r.id === props.item.id));
  const total = useAppStore(state => state.reconstruction.length);

  const isFirst = index <= 0;
  const isLast = index === total - 1;

  const onMove = (direction: 'up' | 'down' | 'top' | 'bottom') =>
    withViewTransition(() => moveCanvas(props.item.id, direction));

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

      <DropdownMenuContent
        onClick={withStopPropagation()}>
        <DropdownMenuItem
          onClick={props.onRenameCanvas}>
          <IconPencil /> Rename canvas
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isFirst}
          onClick={() => onMove('top')}>
          <IconArrowBarToUp /> Move to top
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isFirst}
          onClick={() => onMove('up')}>
          <IconArrowUp /> Move up
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isLast}
          onClick={() => onMove('down')}>
          <IconArrowDown /> Move down
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={isLast}
          onClick={() => onMove('bottom')}>
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