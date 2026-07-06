import { PanelActionButton } from '@/components/panel-action-button';
import { ListChevronsDownUp, ListChevronsUpDown } from 'lucide-react';

export const SourceTreeToolbar = () => {

  return (
    <div className="flex gap-1 p-1.5 items-center justify-end border-b">
      <PanelActionButton
        tooltip="Collapse all">
        <ListChevronsDownUp />
      </PanelActionButton>

      <PanelActionButton
        tooltip="Expand all">
        <ListChevronsUpDown />
      </PanelActionButton>
    </div>
  )

}