import { useAppStore } from '@/store/app-store';
import type { PhysicalSize, ReconstructionCanvas, SourceCanvas } from '@/types';
import type { DraggableImage, DraggableImageSelection } from '../../reconstruction-types';
import { getDraggableImageKey } from '../../reconstruction-utils';
import { useComposerStore } from '../../canvas-composer/composer-store';
import { cn } from '@/shadcn/utils';

// Shorthand
const getSourceCanvases = (canvas: ReconstructionCanvas): SourceCanvas[] =>
  canvas.type === 'original' ? [canvas.source] : canvas.sources;

// Label of the SourceCanvas this image is associated with
const getSourceLabel = (canvas: ReconstructionCanvas, image: DraggableImage): string => {
  const source = getSourceCanvases(canvas).find(s => s.canvas.id === image.sourceCanvasId);
  return source?.canvas.getLabel() ?? image.sourceCanvasId;
}


interface StateSingleSelectionProps {

  canvas: ReconstructionCanvas;

  index: number;

  images: DraggableImage[];

  selectedImage?: DraggableImageSelection;

}

export const StateSingleSelection = (props: StateSingleSelectionProps) => {
  const { canvas, index, images } = props;

  const { width, height } = canvas;

  const resizeCanvas = useAppStore(state => state.resizeCanvas);
  const setCanvasPhysicalSize = useAppStore(state => state.setReconstructionPhysicalSize);

  const activeImage = props.selectedImage?.item.reconstructionCanvasId === canvas.id
    ? props.selectedImage
    : undefined;

  // Source-level measurements, keyed by whichever source canvas they belong
  // to -- only surfaced where actually set (see getSourceCanvases above).
  const sourceMeasurements = getSourceCanvases(canvas)
    .map(source => ({ id: source.canvas.id, label: source.canvas.getLabel(), physicalSize: source.physicalSize }))
    .filter((s): s is { id: string; label: string; physicalSize: PhysicalSize } => !!s.physicalSize);

  // Rescale every image placed on this canvas proportionally, so its
  // coverage/position relative to the page is preserved -- otherwise
  // shrinking the canvas could leave images overflowing its bounds, and
  // enlarging it would leave them looking tiny relative to the new page.
  const onResizePx = (newWidth: number, newHeight: number) => {
    if (width <= 0 || height <= 0 || (newWidth === Math.round(width) && newHeight === Math.round(height))) return;

    const scaleX = newWidth / width;
    const scaleY = newHeight / height;

    resizeCanvas(canvas.id, newWidth, newHeight);

    const { updateImage } = useComposerStore.getState();
    images.forEach(image => updateImage(canvas.id, {
      ...image,
      x: image.x * scaleX,
      y: image.y * scaleY,
      width: image.width * scaleX
    }));
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-md shadow-xs bg-neutral-50 p-2.5 space-y-1">


        <div className="text-xs text-muted-foreground tabular-nums">
          <EditablePhysicalSize
            size={canvas.physicalSize}
            onCommit={size => setCanvasPhysicalSize(canvas.id, size)} />
        </div>

        {canvas.type === 'composite' && (
          <div className="text-xs text-muted-foreground">
            Composite of {canvas.sources.length} canvas{canvas.sources.length === 1 ? '' : 'es'}
          </div>
        )}

        {sourceMeasurements.length > 0 && (
          <div className="text-xs text-muted-foreground tabular-nums space-y-0.5 pt-0.5">
            {sourceMeasurements.map(source => (
              <div key={source.id} className="truncate">
                {canvas.type === 'composite' ? `${source.label}: ` : 'Source scan: '}
                {formatPhysicalSize(source.physicalSize)}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeImage && (
        <SelectedImageDetail canvas={canvas} selection={activeImage} />
      )}

      <div className="space-y-1.5">
        <div className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          Images in this canvas
        </div>

        {images.length === 0 ? (
          <div className="border border-dashed border-foreground/20 rounded-md py-2.5 px-3 text-xs text-muted-foreground text-center">
            No images yet.
          </div>
        ) : (
          <ul className="space-y-1">
            {images.map(image => (
              <ImageRow
                key={getDraggableImageKey(image)}
                canvas={canvas}
                image={image}
                isSelected={!!activeImage && getDraggableImageKey(activeImage.image) === getDraggableImageKey(image)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}

interface SelectedImageDetailProps {

  canvas: ReconstructionCanvas;

  selection: DraggableImageSelection;

}

const SelectedImageDetail = (props: SelectedImageDetailProps) => {
  const { canvas, selection } = props;
  const { image } = selection;

  const height = image.width * image.resource.height / image.resource.width;

  const cells: [string, number][] = [
    ['x', image.x],
    ['y', image.y],
    ['w', image.width],
    ['h', height]
  ];

  return (
    <div className="border border-orange-500/50 bg-orange-50/60 rounded-md p-2.5 space-y-2">
      <div className="text-orange-600 text-[11px] font-medium tracking-wide uppercase">
        Selected image
      </div>

      <div className="text-xs truncate">{getSourceLabel(canvas, image)}</div>

      <div className="grid grid-cols-2 gap-1.5">
        {cells.map(([key, value]) => (
          <div key={key} className="bg-white rounded-sm px-2 py-1 text-xs tabular-nums">
            <div className="text-muted-foreground text-[10px] uppercase">{key}</div>
            {Math.round(value)}
          </div>
        ))}
      </div>
    </div>
  )

}

interface ImageRowProps {

  canvas: ReconstructionCanvas;

  image: DraggableImage;

  isSelected: boolean;

}

const ImageRow = (props: ImageRowProps) => {
  const { canvas, image, isSelected } = props;

  const height = image.width * image.resource.height / image.resource.width;

  return (
    <li className={cn(
      'flex items-center gap-2 p-1.5 rounded-md border',
      isSelected ? 'border-orange-500/50 bg-orange-50/60' : 'border-transparent'
    )}>
      <img
        src={image.resource.getImageURL(80)}
        alt=""
        className="w-8 h-9 rounded-xs object-cover ring-1 ring-foreground/10 shrink-0 bg-neutral-100" />

      <div className="min-w-0 space-y-0.5">
        <div className="text-xs truncate">{getSourceLabel(canvas, image)}</div>
        <div className="text-[10px] text-muted-foreground tabular-nums">
          x:{Math.round(image.x)} y:{Math.round(image.y)} w:{Math.round(image.width)} h:{Math.round(height)}
        </div>
      </div>
    </li>
  )

}

