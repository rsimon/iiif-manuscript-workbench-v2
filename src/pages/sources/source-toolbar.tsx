import { PanelActionButton } from '@/components/panel-action-button';
import { ListChevronsDownUp, ListChevronsUpDown, SquarePlus, Trash2 } from 'lucide-react';

export const SourceToolbar = () => {

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

      <PanelActionButton
        tooltip="Import IIIF presentation manifest">
        <SquarePlus />
      </PanelActionButton>

      <PanelActionButton
        tooltip="Clear all sources">
        <Trash2 />
      </PanelActionButton>
    </div>
  )

}