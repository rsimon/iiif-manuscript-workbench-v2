import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';
import { PanelActionButton } from '@/components/panel-action-button';
import { useSourcesStore } from '../sources-store';

export const SourceTreeToolbar = () => {
  const collapseAll = useSourcesStore(state => state.collapseAll);
  const expandAll = useSourcesStore(state => state.expandAll);

  return (
    <div className="p-1.5 flex justify-start items-center border-b bg-white">
      <PanelActionButton
        tooltip="Collapse all"
        size="icon-sm"
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