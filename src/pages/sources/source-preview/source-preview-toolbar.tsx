import { useMemo } from 'react';
import type { ButtonProps } from '@base-ui/react';
import type { CozyCanvas, CozyManifest } from 'cozy-iiif';
import { Button } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { Separator } from '@/shadcn/separator';
import { useAppStore } from '@/store/app-store';
import type { SourceManifest } from '@/types';
import { 
  IconCheck, 
  IconChevronLeft, 
  IconChevronRight, 
  IconDimensions, 
  IconPlus, 
  IconRulerMeasure 
} from '@tabler/icons-react';

interface SourcePreviewToolbarButtonProps extends ButtonProps {

  tooltip: string;

}

const SourcePreviewToolbarButton = (props: SourcePreviewToolbarButtonProps) => {
  const { children, ...rest } = props;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            className="rounded-full"
            {...rest}>
            {children}
          </Button>
        }/>
      <TooltipContent>
        {props.tooltip}
      </TooltipContent>
    </Tooltip>
  )

}

interface SourcePreviewToolbarProps {

  isFiltered: boolean;

  visibleCanvases: { source: SourceManifest, canvases: CozyCanvas[] }[];

  currentManifest: CozyManifest;

  currentCanvas: CozyCanvas;

  onNext(): void;

  onPrev(): void;

}

export const SourcePreviewToolbar = (props: SourcePreviewToolbarProps) => {
  const reconstruction = useAppStore(state => state.reconstruction);

  const { totalCount, currentIndex } = useMemo(() => {
    const flattened = props.visibleCanvases.flatMap(s => s.canvases);
    const currentIndex = flattened.indexOf(props.currentCanvas) + 1;
    return { totalCount: flattened.length, currentIndex };
  }, [props.visibleCanvases, props.currentCanvas]);

  const hasNext = currentIndex < totalCount;
  const hasPrev = currentIndex > 1;

  const isInRecontruction = useMemo(() => (
    reconstruction.some(r => 
      r.sourceManifestId === props.currentManifest.id && 
        r.canvas.id === props.currentCanvas.id)
  ), [props.currentManifest, props.currentCanvas]); 

  const addToReconstruction = useAppStore(state => state.addCanvasToReconstruction);
  const removeFromReconstruction = useAppStore(state => state.removeCanvasFromReconstruction);

  return (
    <div className="absolute bottom-8 w-full flex justify-center z-50 pointer-events-none">
      <div className="bg-white flex items-center gap-1 min-w-20 rounded-full p-1 pointer-events-auto
        ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.10)]">

        <div className="flex items-center gap-0.5">
          <Button 
            disabled={!hasPrev}
            variant="ghost"
            className="rounded-full">
            <IconChevronLeft />
          </Button>

          <div className="text-xs space-x-1.5">
            <span>{props.currentCanvas.getLabel()}</span>
            <span className="text-muted-foreground/80 space-x-1.5"> 
              <span>·</span> 
              <span className="tracking-wider">{currentIndex}/{totalCount}</span>
            </span>
          </div>

          <Button
            disabled={!hasNext}
            variant="ghost"
            className="rounded-full">
            <IconChevronRight />
          </Button>
        </div>

        <Separator orientation="vertical" />

        <Button
          variant="ghost"
          className="rounded-full font-normal text-xs text-muted-foreground">
          <IconDimensions /> 215 x 280 mm
        </Button>

        <SourcePreviewToolbarButton
          tooltip="Measure">
          <IconRulerMeasure className="size-4.5" />
        </SourcePreviewToolbarButton>

        <Separator orientation="vertical" />

        {isInRecontruction ? (
          <Button
            className="rounded-full font-normal pr-3"
            onClick={() => removeFromReconstruction(props.currentCanvas.id)}>
            <IconCheck /> In Reconstruction
          </Button>
        ) : (
          <Button
            variant="outline"
            className="rounded-full font-normal pr-3 shadow-none border-primary/50 text-primary hover:bg-accent/40 hover:text-primary"
            onClick={() => addToReconstruction(props.currentManifest.id, props.currentCanvas)}>
            <IconPlus /> Add to Reconstruction
          </Button>
        )}
      </div>
    </div>
  )

}