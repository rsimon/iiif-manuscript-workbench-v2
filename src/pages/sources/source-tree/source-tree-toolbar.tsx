import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { Label } from '@/shadcn/label';
import { PanelActionButton } from '@/components/panel-action-button';
import { Switch } from '@/shadcn/switch';
import { cn } from '@/shadcn/utils';
import { useSourcesStore } from '../sources-store';
import { useSourceNavigation } from '../use-source-navigation';

export const SourceTreeToolbar = () => {
  const selection = useSourcesStore(state => state.selection);
  const setSelection = useSourcesStore(state => state.setSelection);

  const numCollapsed = useSourcesStore(state => state.collapsed.size);

  const isAllExpanded = numCollapsed === 0;

  const collapseAll = useSourcesStore(state => state.collapseAll);
  const expandAll = useSourcesStore(state => state.expandAll);

  const showInReconstructionOnly = useSourcesStore(state => state.showInReconstructionOnly);
  const setShowInReconstructionOnly = useSourcesStore(state => state.setShowInReconstructionOnly);

  const { isInReconstruction, visibleCanvases } = useSourceNavigation();

  const onToggleExpand = () => {
    if (isAllExpanded) 
      collapseAll();
    else 
      expandAll();
  }

  const onToggleShowReconstructionOnly = (filter: boolean) => {
    // Change selection in case the user switches to filtered view and
    // the selected image is NOT in the reconstruction
    if (filter && selection?.manifestId && selection?.canvasId) {
      const shouldChange = !isInReconstruction(selection.manifestId, selection.canvasId);
      if (shouldChange && visibleCanvases.length > 0) {
        const firstVisible = visibleCanvases[0];
        setSelection({ manifestId: firstVisible.manifestId, canvasId: firstVisible.canvas.id });
      }
    }

    setShowInReconstructionOnly(filter);
  }

  return (
    <div className="border-b text-muted-foreground flex justify-between py-2 pl-1.5 pr-3.5">
      <div className="flex items-center">
        <PanelActionButton
          tooltip={isAllExpanded ? 'Collapse all' : 'Expand all'}
          onClick={onToggleExpand}>
          {isAllExpanded ? (
            <ListChevronsDownUp />
          ) : (
            <ListChevronsUpDown />
          )}
        </PanelActionButton>
      </div>

      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="show-in-reconstruction"
          className={cn(
            'cursor-pointer text-xs font-normal',
            showInReconstructionOnly ? 'text-primary' : 'text-muted-foreground/80 '
          )}>
          Show included only
        </Label>

        <Switch 
          id="show-in-reconstruction" 
          size="sm"
          checked={showInReconstructionOnly}
          onCheckedChange={onToggleShowReconstructionOnly} />
      </div>
    </div>
  )

}