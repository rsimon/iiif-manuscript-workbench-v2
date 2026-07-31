import { Button } from '@/shadcn/button';
import { IconChevronRight, IconLayoutSidebarRight, IconLibraryPhoto, IconSquare } from '@tabler/icons-react';
import { useReconstructionStore } from '../reconstruction-store';
import { useComposerStore } from './composer-store';
import type { ReconstructionCanvas } from '@/types';

interface ComposerControlsProps {

  isSidebarOpen: boolean;

  onChangeSidebarOpen(open: boolean): void;

}

export const ComposerControls = (props: ComposerControlsProps) => {
  const selection = useReconstructionStore(state => state.selection);
  const selectedImage = useComposerStore(state => state.selectedImage);
  
  return (
    <div className="absolute bg-white rounded-md top-3 right-3 z-50 shadow-md">
      {selection.length === 0 ? (
        <Button
          variant="ghost"
          size="icon"
          className=" border-neutral-300/80 p-2 h-auto aspect-square"
          onClick={() => props.onChangeSidebarOpen(!props.isSidebarOpen)}>
          <IconLayoutSidebarRight className="size-4.5" />
        </Button>
      ) : selection.length > 1 ? (
        <Button
          variant="ghost"
          size="icon"
          className="bg-white border border-neutral-300/80 p-2 h-auto"
          onClick={() => props.onChangeSidebarOpen(!props.isSidebarOpen)}>
          <IconLayoutSidebarRight className="size-4.5" /> {selection.length} canvases selected
        </Button>
      ) : (
        <SingleSelectionControl 
          canvas={selection[0]} 
          onClick={() => props.onChangeSidebarOpen(!props.isSidebarOpen)} />
      )}
    </div>
  )

}

interface SingleSelectionControlProps {

  canvas: ReconstructionCanvas;

  onClick(): void;

}

const SingleSelectionControl = (props: SingleSelectionControlProps) => {
  const { width, height, label } = props.canvas;

  return (
    <Button
      variant="ghost"
      className="border border-neutral-300/80 py-2.5 px-3 h-auto font-normal text-xs"
      onClick={props.onClick} >
      <IconLibraryPhoto 
        className="size-4.5 text-muted-foreground/80" />

      <span>
        {width.toLocaleString()} × {height.toLocaleString()} px
      </span>

      <IconChevronRight className="size-3.5 text-muted-foreground/80" />
    </Button>
  )

}