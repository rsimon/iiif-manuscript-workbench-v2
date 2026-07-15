import { useState } from 'react';
import { IconDownload, IconFolderOpen, IconRestore, IconUpload } from '@tabler/icons-react';
import { Button } from '@/shadcn/button';
import { useAppStore } from '@/store/app-store';
import { useConfirm } from '@/dialogs/confirm';
import { ExportManifestDialog } from '@/dialogs/export-manifest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shadcn/dropdown-menu';

export const Project = () => {
  const reset  = useAppStore(state => state.resetAll);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const confirm = useConfirm();

  const onReset = () => {
    confirm({
      title: 'Reset project?',
      description: 'This will remove all sources and delete the reconstruction. This action cannot be undone.',
      confirmLabel: 'Reset project',
      variant: 'destructive',
    }).then(confirmed => {
      if (confirmed) reset();
    });
  }

  return (
    <>
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

          <DropdownMenuItem 
            className="gap-2.5"
            onClick={() => setExportDialogOpen(true)}>
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
            onClick={onReset}>
            <IconRestore /> Reset project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportManifestDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen} />
    </>
  )

}