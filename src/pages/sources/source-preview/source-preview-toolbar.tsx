import { useEffect, useState } from 'react';
import { Toggle as TogglePrimitive } from '@base-ui/react';
import type { CozyCanvas, CozyManifest } from 'cozy-iiif';
import { ViewerPaginationControl } from '@/components/viewer-pagination-control';
import { PhysicalDimensionsDialog, useMeasurement } from '@/dialogs/physical-dimensions';
import { Button } from '@/shadcn/button';
import { Toggle } from '@/shadcn/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Separator } from '@/shadcn/separator';
import { useAppStore } from '@/store/app-store';
import { useSourcesStore } from '../sources-store';
import { IconCheck, IconDimensions, IconPlus, IconRulerMeasure } from '@tabler/icons-react';

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

  const size = useAppStore(state => state.sizes.get(props.selectedCanvas.id));
  const setSize = useAppStore(state => state.setPhysicalSize);

  const addToReconstruction = useAppStore(state => state.addCanvasToReconstruction);
  const removeFromReconstruction = useAppStore(state => state.removeCanvasFromReconstruction);

  const [showDimensionsDialog, setShowDimensionsDialog] = useState(false);

  const { setEnableTapeMeasure } = useMeasurement();

  const [isTapeMeasurePressed, setIsTapeMeasurePressed] = useState(false);

  useEffect(() => setIsTapeMeasurePressed(false), [props.selectedCanvas])

  const onShowDimensionsDialog = (open: boolean) => {
    setIsTapeMeasurePressed(false);
    setShowDimensionsDialog(open);
  }

  const onPressTapeMeasure = (pressed: boolean) => {
    setIsTapeMeasurePressed(pressed);
    setEnableTapeMeasure(pressed, { 
      showLabel: true,
      canvasSize: size
    })
  }

  useEffect(() => {
    if (!isTapeMeasurePressed) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape')
        onPressTapeMeasure(false);
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    }
  }, [isTapeMeasurePressed]);

  return (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-full p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">
        <ViewerPaginationControl 
          displayAsFiltered={isFiltered}
          selectedPageIndex={props.selectedPageIndex}
          selectedPageLabel={props.selectedCanvas.getLabel()}
          totalPageCount={props.totalPageCount}
          onNext={props.onNext}
          onPrevious={props.onPrevious} />

        <Separator orientation="vertical" />

        <PhysicalDimensionsDialog
          canvasLabel={props.selectedCanvas.getLabel()}
          canvasWidth={props.selectedCanvas.width}
          canvasHeight={props.selectedCanvas.height}
          physicalSize={size}
          open={showDimensionsDialog}
          onOpenChange={onShowDimensionsDialog}
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
              className="rounded-full border-primary/50 border-dashed font-normal text-primary hover:text-primary aria-expanded:text-primary">
              <IconPlus /> Set dimensions
            </Button>
          )}
        </PhysicalDimensionsDialog>

        <SourcePreviewToolbarToggle
          disabled={!size || showDimensionsDialog}
          tooltip="Measure"
          pressed={isTapeMeasurePressed}
          onPressedChange={onPressTapeMeasure}>
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