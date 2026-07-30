import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { IconStack2 } from '@tabler/icons-react';
import { cn } from '@/shadcn/utils';
import { ScrollArea } from '@/shadcn/scroll-area';
import { useAppStore } from '@/store/app-store';
import { parseNumber } from '@/dialogs/physical-dimensions/measurement-utils';
import type { PhysicalSize, ReconstructionCanvas, SourceCanvas } from '@/types';
import { useReconstructionStore } from '../reconstruction-store';
import { useComposerStore } from '../canvas-composer/composer-store';
import { getDraggableImageKey } from '../canvas-composer/composer-utils';
import type { DraggableImage, DraggableImageSelection } from '../canvas-composer/composer-types';

const round = (n: number) => Math.round(n);

// A ReconstructionCanvas is backed by one ('original') or several
// ('composite') underlying IIIF source canvases -- each of which may
// carry its own independently-measured physical size, separate from
// (and potentially out of sync with) the reconstruction canvas's own.
const getSourceCanvases = (canvas: ReconstructionCanvas): SourceCanvas[] =>
  canvas.type === 'original' ? [canvas.source] : canvas.sources;

const getSourceLabel = (canvas: ReconstructionCanvas, image: DraggableImage): string => {
  const source = getSourceCanvases(canvas).find(s => s.canvas.id === image.sourceCanvasId);
  return source?.canvas.getLabel() ?? image.sourceCanvasId;
}

const formatPhysicalSize = (size: PhysicalSize): string =>
  `${size.width} × ${size.height} ${size.unit}`;

export const ReconstructionSidebar = () => {
  const selection = useReconstructionStore(state => state.selection);
  const reconstruction = useAppStore(state => state.reconstruction);

  const selectedImage = useComposerStore(state => state.selectedImage);
  const imagesByCanvasId = useComposerStore(state => state.imagesByCanvasId);

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 py-2.5 px-3 bg-white border-b">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Inspector
        </span>
      </div>

      <ScrollArea className="grow min-h-0">
        <div className="p-3">
          {selection.length === 0 ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Nothing selected. Click a canvas or an image in the composer to inspect it here.
            </p>
          ) : selection.length > 1 ? (
            <MultiSelectionSummary
              selection={selection}
              reconstruction={reconstruction}
              imagesByCanvasId={imagesByCanvasId} />
          ) : (
            <SingleCanvasInspector
              canvas={selection[0]}
              index={reconstruction.findIndex(r => r.id === selection[0].id)}
              images={imagesByCanvasId.get(selection[0].id) ?? []}
              selectedImage={selectedImage} />
          )}
        </div>
      </ScrollArea>
    </div>
  )

}

interface MultiSelectionSummaryProps {

  selection: ReconstructionCanvas[];

  reconstruction: ReconstructionCanvas[];

  imagesByCanvasId: Map<string, DraggableImage[]>;

}

const MultiSelectionSummary = (props: MultiSelectionSummaryProps) => {
  const { selection, reconstruction, imagesByCanvasId } = props;

  const totalImages = selection.reduce(
    (sum, c) => sum + (imagesByCanvasId.get(c.id)?.length ?? 0), 0);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        {selection.length} canvases selected
      </div>

      <div className="text-xs text-muted-foreground tabular-nums">
        {totalImages} image{totalImages === 1 ? '' : 's'} total
      </div>

      <ul className="space-y-1 pt-1">
        {selection.map(canvas => {
          const index = reconstruction.findIndex(r => r.id === canvas.id);
          return (
            <li
              key={canvas.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="tabular-nums w-5 text-right shrink-0">{index + 1}.</span>
              {canvas.type === 'composite' && (
                <IconStack2 className="size-3.5 shrink-0" stroke={1.5} />
              )}
              <span className="truncate">{canvas.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  )

}

interface SingleCanvasInspectorProps {

  canvas: ReconstructionCanvas;

  index: number;

  images: DraggableImage[];

  selectedImage?: DraggableImageSelection;

}

const SingleCanvasInspector = (props: SingleCanvasInspectorProps) => {
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
    if (width <= 0 || height <= 0 || (newWidth === round(width) && newHeight === round(height))) return;

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
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {canvas.type === 'composite' && (
            <IconStack2 className="size-4 text-muted-foreground/80 shrink-0" stroke={1.5} />
          )}
          <span className="truncate">{index + 1}. {canvas.label}</span>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
          <EditablePixelSize width={width} height={height} onCommit={onResizePx} />
          <span>· {images.length} image{images.length === 1 ? '' : 's'}</span>
        </div>

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
            {round(value)}
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
          x:{round(image.x)} y:{round(image.y)} w:{round(image.width)} h:{round(height)}
        </div>
      </div>
    </li>
  )

}

const editableInputClass =
  'w-12 tabular-nums bg-white border rounded-xs px-1 py-0.5 text-xs outline-none ring-1 ring-primary';

const editableTriggerClass =
  'tabular-nums hover:text-foreground hover:underline underline-offset-2 decoration-dotted cursor-text';

// Shared blur handling for a group of inputs edited together (e.g. width +
// height): a plain onBlur per-input would commit prematurely when tabbing
// from one field to the next, so we only treat it as "focus truly left the
// group" when the newly-focused element isn't one of the group's own inputs.
const isBlurLeavingGroup = (e: FocusEvent, group: HTMLElement | null): boolean => {
  const next = e.relatedTarget as Node | null;
  return !(group && next && group.contains(next));
}

interface EditablePixelSizeProps {

  width: number;

  height: number;

  onCommit(width: number, height: number): void;

}

const EditablePixelSize = (props: EditablePixelSizeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [widthStr, setWidthStr] = useState('');
  const [heightStr, setHeightStr] = useState('');

  const groupRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    setWidthStr(String(round(props.width)));
    setHeightStr(String(round(props.height)));

    const frameId = requestAnimationFrame(() => {
      widthRef.current?.focus();
      widthRef.current?.select();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isEditing]);

  const onCommit = () => {
    const w = parseNumber(widthStr);
    const h = parseNumber(heightStr);

    if (w && h) props.onCommit(Math.round(w), Math.round(h));

    setIsEditing(false);
  }

  // Resets the draft back to the committed value before closing, so that
  // the stray blur fired by unmounting the (still-focused) input can't
  // re-commit whatever was left half-typed -- same defense as
  // EditableCanvasLabel's onCancel.
  const onCancel = () => {
    setWidthStr(String(round(props.width)));
    setHeightStr(String(round(props.height)));
    setIsEditing(false);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }

    e.stopPropagation();
  }

  const onGroupBlur = (e: FocusEvent) => {
    if (isBlurLeavingGroup(e, groupRef.current)) onCommit();
  }

  return isEditing ? (
    <span ref={groupRef} onBlur={onGroupBlur} className="inline-flex items-center gap-1">
      <input
        ref={widthRef}
        value={widthStr}
        onChange={e => setWidthStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={editableInputClass} />
      <span>×</span>
      <input
        value={heightStr}
        onChange={e => setHeightStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={editableInputClass} />
      <span>px</span>
    </span>
  ) : (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={editableTriggerClass}>
      {round(props.width).toLocaleString()} × {round(props.height).toLocaleString()} px
    </button>
  )

}

interface EditablePhysicalSizeProps {

  size?: PhysicalSize;

  onCommit(size?: PhysicalSize): void;

}

const EditablePhysicalSize = (props: EditablePhysicalSizeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [widthStr, setWidthStr] = useState('');
  const [heightStr, setHeightStr] = useState('');
  const [unitStr, setUnitStr] = useState('');

  const groupRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    setWidthStr(props.size ? String(props.size.width) : '');
    setHeightStr(props.size ? String(props.size.height) : '');
    setUnitStr(props.size?.unit ?? '');

    const frameId = requestAnimationFrame(() => {
      widthRef.current?.focus();
      widthRef.current?.select();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isEditing]);

  const onCommit = () => {
    const w = parseNumber(widthStr);
    const h = parseNumber(heightStr);
    const unit = unitStr.trim();

    if (w && h && unit) {
      props.onCommit({ width: w, height: h, unit });
    } else if (!widthStr.trim() && !heightStr.trim() && !unit) {
      // All fields cleared -- remove the physical size entirely.
      props.onCommit(undefined);
    }
    // Otherwise the edit is incomplete/invalid: silently discard it and
    // keep whatever was there before, same as EditableCanvasLabel's rule.

    setIsEditing(false);
  }

  // See EditablePixelSize's onCancel -- resets the draft before closing so
  // a stray post-unmount blur can't re-commit a half-typed value.
  const onCancel = () => {
    setWidthStr(props.size ? String(props.size.width) : '');
    setHeightStr(props.size ? String(props.size.height) : '');
    setUnitStr(props.size?.unit ?? '');
    setIsEditing(false);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }

    e.stopPropagation();
  }

  const onGroupBlur = (e: FocusEvent) => {
    if (isBlurLeavingGroup(e, groupRef.current)) onCommit();
  }

  if (!isEditing) {
    return props.size ? (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={editableTriggerClass}>
        Physical size: {formatPhysicalSize(props.size)}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-muted-foreground/70 hover:text-foreground hover:underline underline-offset-2 decoration-dotted cursor-text">
        + Add physical size
      </button>
    );
  }

  return (
    <span ref={groupRef} onBlur={onGroupBlur} className="inline-flex items-center gap-1 flex-wrap">
      <input
        ref={widthRef}
        placeholder="–"
        value={widthStr}
        onChange={e => setWidthStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={editableInputClass} />
      <span>×</span>
      <input
        placeholder="–"
        value={heightStr}
        onChange={e => setHeightStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={editableInputClass} />
      <input
        placeholder="unit"
        value={unitStr}
        onChange={e => setUnitStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={editableInputClass} />
    </span>
  )

}
