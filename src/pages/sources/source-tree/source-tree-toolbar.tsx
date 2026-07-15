import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { Label } from '@/shadcn/label';
import { PanelActionButton } from '@/components/panel-action-button';
import { Switch } from '@/shadcn/switch';
import { cn } from '@/shadcn/utils';
import { useSourcesStore } from '../sources-store';

export const SourceTreeToolbar = () => {
  const numCollapsed = useSourcesStore(state => state.collapsed.size);

  const isAllExpanded = numCollapsed === 0;

  const collapseAll = useSourcesStore(state => state.collapseAll);
  const expandAll = useSourcesStore(state => state.expandAll);

  const showInReconstructionOnly = useSourcesStore(state => state.showInReconstructionOnly);
  const setShowInReconstructionOnly = useSourcesStore(state => state.setShowInReconstructionOnly);

  const onToggleExpand = () => {
    if (isAllExpanded) 
      collapseAll();
    else 
      expandAll();
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
          onCheckedChange={setShowInReconstructionOnly} />
      </div>
    </div>
  )

}