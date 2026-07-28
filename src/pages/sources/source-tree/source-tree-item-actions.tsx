import { IconCircleMinus, IconDots } from '@tabler/icons-react';
import { useConfirm } from '@/dialogs/confirm';
import { useAppStore } from '@/store/app-store';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shadcn/dropdown-menu';

interface SourceTreeItemActionsProps {

  manifestId: string;

}

export const SourceTreeItemActions = (props: SourceTreeItemActionsProps) => {
  const removeSource = useAppStore(state => state.removeSource);

  const confirm = useConfirm();

  const onRemoveManifest = () => {
    confirm({
      title: 'Remove manifest?',
      description: 'This will remove the manifest from the project.',
      confirmLabel: 'Remove',
      variant: 'destructive',
    }).then(confirmed => {
      if (confirmed)
        removeSource(props.manifestId);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="hidden group-hover:flex data-popup-open:flex rounded-full p-1 text-muted-foreground/80 hover:text-foreground cursor-pointer">
        <IconDots className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent alignOffset={-8}>
        <DropdownMenuItem
          variant="destructive"
          onClick={onRemoveManifest}>
          <IconCircleMinus /> Remove manifest
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}