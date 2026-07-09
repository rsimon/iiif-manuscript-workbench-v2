import { 
  IconArrowBarToDown, 
  IconArrowBarToUp, 
  IconCircleMinus, 
  IconDots, 
  IconEye, 
  IconPencil 
} from '@tabler/icons-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';
import { withStopPropagation } from '@/shadcn/utils';

export const ReconstructionTreeItemActions = () => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={withStopPropagation(e => e.preventDefault())}
        className="self-start rounded-full mt-1.5 p-1 opacity-0 group-hover:opacity-100 text-muted-foreground/80 hover:text-foreground cursor-pointer">
        <IconDots className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem>
          <IconEye /> Open in composer
        </DropdownMenuItem>

        <DropdownMenuItem>
          <IconPencil /> Rename leaf
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <IconArrowBarToUp /> Move to top
        </DropdownMenuItem>

        <DropdownMenuItem>
          <IconArrowBarToDown /> Move to bottom
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive">
          <IconCircleMinus /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}