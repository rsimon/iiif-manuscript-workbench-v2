import { useState } from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react';
import type { CozyCanvas, CozyManifest } from 'cozy-iiif';
import { PhysicalDimensionsDialog, useMeasurement } from '@/dialogs/physical-dimensions';
import { Button } from '@/shadcn/button';
import { Toggle } from '@/shadcn/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Separator } from '@/shadcn/separator';
import { useAppStore } from '@/store/app-store';
import { useSourcesStore } from '../sources-store';
import { 
  IconCheck, 
  IconChevronLeft, 
  IconChevronRight, 
  IconDimensions, 
  IconFilter, 
  IconPlus, 
  IconRulerMeasure 
} from '@tabler/icons-react';

const SourcePreviewToolbarToggle = (props: TogglePrimitive.Props & { tooltip: string }) => {
  const { children, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            className="rounded-full disabled:text-muted-foreground/80"
            {...rest}>
            {children}
          </Toggle>
        }/>
      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

interface SourcePreviewToolbarProps {

  isInReconstruction: boolean;

  selectedCanvas: CozyCanvas;

  selectedManifest: CozyManifest;

  selectedPageIndex: number;

  totalPageCount: number;

  onNext(): void;

  onPrevious(): void;

}

export const SourcePreviewToolbar = (props: SourcePreviewToolbarProps) => {
  const isFiltered = useSourcesStore(state => state.showInReconstructionOnly);

  const hasNext = props.selectedPageIndex < props.totalPageCount - 1;
  const hasPrev = props.selectedPageIndex > 0;

  const size = useAppStore(state => state.sizes.get(props.selectedCanvas.id));
  const setSize = useAppStore(state => state.setPhysicalSize);

  const addToReconstruction = useAppStore(state => state.addCanvasToReconstruction);
  const removeFromReconstruction = useAppStore(state => state.removeCanvasFromReconstruction);

  const [showDimensionsDialog, setShowDimensionsDialog] = useState(false);

  const { setEnableTapeMeasure } = useMeasurement();

  return (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-full p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">

        <div className="flex items-center gap-0.5">
          <Button
            disabled={!hasPrev}
            variant="ghost"
            className="rounded-full"
            onClick={props.onPrevious}>
            <IconChevronLeft />
          </Button>

          <div className="text-xs flex gap-1.5 items-center">
            <span>{props.selectedCanvas.getLabel()}</span>
            {isFiltered ? (
              <div className="ml-0.5 flex items-center gap-1 bg-accent py-1 px-2 pr-2.5 rounded-full text-primary">
                <IconFilter className="size-3.5" /> 
                <span>{props.selectedPageIndex + 1}/{props.totalPageCount}</span>
              </div>
            ) : (
              <span className="text-muted-foreground/80 space-x-1.5"> 
                <span>·</span> 
                <span className="tracking-wider">
                  {props.selectedPageIndex + 1}/{props.totalPageCount}
                </span>
              </span>
            )}
          </div>

          <Button
            disabled={!hasNext}
            variant="ghost"
            className="rounded-full"
            onClick={props.onNext}>
            <IconChevronRight />
          </Button>
        </div>

        <Separator orientation="vertical" />

        <PhysicalDimensionsDialog
          canvasLabel={props.selectedCanvas.getLabel()}
          canvasWidth={props.selectedCanvas.width}
          canvasHeight={props.selectedCanvas.height}
          physicalSize={size}
          open={showDimensionsDialog}
          onOpenChange={setShowDimensionsDialog}
          onSizeChanged={size => setSize(props.selectedCanvas.id, size)}>
          {size ? (
            <Button
              variant="ghost"
              className="rounded-full font-normal text-xs text-muted-foreground">
              <IconDimensions /> 
              <span>{size.width} x {size.height} {size.unit}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-full border-primary border-dashed font-normal text-primary hover:text-primary aria-expanded:text-primary">
              <IconPlus /> Set dimensions
            </Button>
          )}
        </PhysicalDimensionsDialog>

        <SourcePreviewToolbarToggle
          disabled={!size}
          tooltip="Measure"
          onPressedChange={pressed => setEnableTapeMeasure(pressed)}>
          <IconRulerMeasure className="size-4.5" />
        </SourcePreviewToolbarToggle>

        <Separator orientation="vertical" />

        {props.isInReconstruction ? (
          <Button
            className="rounded-full font-normal pr-3"
            onClick={() => removeFromReconstruction(props.selectedCanvas.id)}>
            <IconCheck /> In Reconstruction
          </Button>
        ) : (
          <Button
            variant="outline"
            className="rounded-full font-normal pr-3 shadow-none border-primary/50 text-primary hover:bg-accent/40 hover:text-primary"
            onClick={() => addToReconstruction(props.selectedManifest.id, props.selectedCanvas)}>
            <IconPlus /> Add to Reconstruction
          </Button>
        )}
      </div>
    </div>
  )

}