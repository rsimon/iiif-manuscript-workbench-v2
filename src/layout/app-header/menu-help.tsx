import { IconBook, IconExternalLink, IconInfoCircle } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

export const Help = () => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="ghost"
          className="font-normal">
          Help
        </Button>
      } />

      <DropdownMenuContent>
        <DropdownMenuItem 
          className="grow flex justify-between items-center">
            <div className="flex items-center gap-2.5"><IconBook /> Documentation</div>
            <IconExternalLink className="text-muted-foreground/60!" />
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2.5">
          <IconInfoCircle /> About
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}