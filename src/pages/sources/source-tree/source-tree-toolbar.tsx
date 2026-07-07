import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { Label } from '@/shadcn/label';
import { PanelActionButton } from '@/components/panel-action-button';
import { Switch } from '@/shadcn/switch';
import { useAppStore } from '@/store/app-store';
import { useSourcesStore } from '../sources-store';

export const SourceTreeToolbar = () => {
  const numSources = useAppStore(state => state.sources.length);
  const numExpanded = useSourcesStore(state => state.expanded.size);

  const isAllExpanded = numSources === numExpanded;

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
    <div className="border-b text-muted-foreground/80 flex justify-between p-1 pr-3.5">
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
          className="text-xs font-normal text-muted-foreground/80 hover:text-primary hover:bg-transparent">
          Only selected
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