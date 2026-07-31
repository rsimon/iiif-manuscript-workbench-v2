import { Button } from '@/shadcn/button';
import { IconChevronRight, IconLibraryPhoto } from '@tabler/icons-react';
import { useReconstructionStore } from '../reconstruction-store';
import { useComposerStore } from './composer-store';
import type { ReconstructionCanvas } from '@/types';
import { cn } from '@/shadcn/utils';
import type { DraggableImageSelection } from '../reconstruction-types';

interface ComposerSelectionControlProps {

  isSidebarOpen: boolean;

  onChangeSidebarOpen(open: boolean): void;

}

export const ComposerSelectionControl = (props: ComposerSelectionControlProps) => {
  const selection = useReconstructionStore(state => state.selection);
  const selectedImage = useComposerStore(state => state.selectedImage);

  const onClick = () =>
    props.onChangeSidebarOpen(!props.isSidebarOpen)
  
  return selection.length === 1 ? (
    <div className={cn(
      'absolute bg-white rounded-full top-3 right-3 z-50 shadow-md transition-opacity',
      props.isSidebarOpen ? 'opacity-0' : undefined
      )}>
      {selectedImage ? (
        <ImageSelection 
          selection={selectedImage}
          onClick={onClick}/>
      ) : (
        <SingleCanvasSelection 
          canvas={selection[0]} 
          onClick={onClick} />
      )}
    </div>
  ) : null;

}

interface SingleCanvasSelectionProps {

  canvas: ReconstructionCanvas;

  onClick(): void;

}

const SingleCanvasSelection = (props: SingleCanvasSelectionProps) => {
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

interface ImageSelectionProps {

  selection: DraggableImageSelection;

  onClick(): void;

}

const ImageSelection = (props: ImageSelectionProps) => {

  const {x, y, width} = props.selection.image;

  return (
    <Button
      variant="ghost"
      className="border border-neutral-300/80 py-2.5 px-3 h-auto font-normal text-xs"
      onClick={props.onClick} >
      <IconLibraryPhoto 
        className="size-4.5 text-muted-foreground/80" />

      <span>
        {Math.round(x).toLocaleString()} × {Math.round(y).toLocaleString()}
      </span>

      <IconChevronRight className="size-3.5 text-muted-foreground/80" />
    </Button>
  );

}