import { IconDownload, IconFolderOpen, IconRestore, IconUpload } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

export const Project = () => {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="ghost"
          className="font-normal">
          Project
        </Button>
      } />

      <DropdownMenuContent className="min-w-58">
        <DropdownMenuItem className="gap-2.5">
          <IconFolderOpen /> Open reconstruction...
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2.5">
          <IconDownload /> Export reconstruction...
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2.5">
          <IconUpload /> Import IIIF source...
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2.5" variant="destructive">
          <IconRestore /> Reset project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}