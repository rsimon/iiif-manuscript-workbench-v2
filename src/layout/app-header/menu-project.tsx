import { IconDownload, IconFolderOpen, IconRestore, IconUpload } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';
import { useAppStore } from '@/store/app-store';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

export const Project = () => {
  const reset  = useAppStore(state => state.resetAll);
  
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

        <DropdownMenuItem 
          className="gap-2.5"
          variant="destructive"
          onClick={reset}>
          <IconRestore /> Reset project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}