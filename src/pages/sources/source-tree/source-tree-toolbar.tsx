import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { PanelActionButton } from '@/components/panel-action-button';
import { useSourcesStore } from '../sources-store';

export const SourceTreeToolbar = () => {
  const collapseAll = useSourcesStore(state => state.collapseAll);
  const expandAll = useSourcesStore(state => state.expandAll);

  return (
    <div className="flex gap-1 p-1.5 items-center justify-end border-b">
      <PanelActionButton
        tooltip="Collapse all"
        onClick={collapseAll}>
        <ListChevronsDownUp />
      </PanelActionButton>

      <PanelActionButton
        tooltip="Expand all"
        onClick={expandAll}>
        <ListChevronsUpDown />
      </PanelActionButton>
    </div>
  )

}