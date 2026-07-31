import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { parseNumber } from '@/store/app-store-utils';
import { Input } from '@/shadcn/input';
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/shadcn/field';
import type { DraggableImage } from '../../reconstruction-types';
import { isBlurLeavingGroup } from '../reconstruction-sidebar-utils';

interface EditableImagePositionProps {

  image: DraggableImage;

  onCommit(x: number, y: number, width: number): void;

}

// Unlike width/height, x/y may legitimately be zero or negative
// (an image can be dragged partially off-canvas).
const parseCoord = (s: string): number | undefined => {
  const n = Number.parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

const INPUT_CLASS = 'tabular-nums h-7 p-1 shrink-0 field-sizing-content min-w-[4ch] max-w-[8ch]';
const TRIGGER_CLASS = 'w-full text-right tabular-nums hover:text-foreground hover:underline underline-offset-3 decoration-dotted cursor-text text-sm bg-muted py-0.5 px-1.5 rounded';
const FIELD_CLASS = 'col-span-2 grid grid-cols-subgrid w-auto gap-1.5 items-baseline';
const LABEL_CLASS = 'text-muted-foreground font-normal text-[10px] uppercase';

export const EditableImagePosition = (props: EditableImagePositionProps) => {
  const { image } = props;

  const aspectRatio = image.resource.width / image.resource.height;
  const height = image.width / aspectRatio;

  const [isEditing, setIsEditing] = useState(false);

  const [xStr, setXStr] = useState('');
  const [yStr, setYStr] = useState('');
  const [wStr, setWStr] = useState('');
  const [hStr, setHStr] = useState('');

  const [sizeSource, setSizeSource] = useState<'w' | 'h'>('w');

  const groupRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    setXStr(String(Math.round(image.x)));
    setYStr(String(Math.round(image.y)));
    setWStr(String(Math.round(image.width)));
    setHStr(String(Math.round(height)));

    setSizeSource('w');

    const frameId = requestAnimationFrame(() => {
      xRef.current?.focus();
      xRef.current?.select();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isEditing]);

  const onCommit = () => {
    const x = parseCoord(xStr);
    const y = parseCoord(yStr);

    const w = parseNumber(wStr);
    const h = parseNumber(hStr);

    const width = sizeSource === 'h'
      ? (h === undefined ? undefined : h * aspectRatio)
      : w;

    if (x !== undefined && y !== undefined && width !== undefined) {
      props.onCommit(x, y, width);
    }

    setIsEditing(false);
  }

  const onCancel = () => setIsEditing(false);

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

  return (
    <FieldSet className="gap-1 items-start space-y-1.5 px-4 pb-4">
      <FieldLegend variant="label" className="data-[variant=label]:text-xs uppercase font-normal text-muted-foreground">
        Selected image
      </FieldLegend>
 
      <FieldGroup
        ref={groupRef}
        onBlur={onGroupBlur}
        className="gap-1 p-0.5">
        <div className="grid w-full grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1.5 items-baseline">
          <Field orientation="horizontal" className={FIELD_CLASS}>
            <FieldLabel htmlFor="image-x" className={LABEL_CLASS}>
              x
            </FieldLabel>
            {isEditing ? (
              <Input
                id="image-x"
                ref={xRef}
                value={xStr}
                onChange={e => setXStr(e.target.value)}
                onKeyDown={onKeyDown}
                className={INPUT_CLASS} />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={TRIGGER_CLASS}>
                {Math.round(image.x)}
              </button>
            )}
          </Field>
 
          <Field orientation="horizontal" className={FIELD_CLASS}>
            <FieldLabel htmlFor="image-y" className={LABEL_CLASS}>
              y
            </FieldLabel>
            {isEditing ? (
              <Input
                id="image-y"
                value={yStr}
                onChange={e => setYStr(e.target.value)}
                onKeyDown={onKeyDown}
                className={INPUT_CLASS} />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={TRIGGER_CLASS}>
                {Math.round(image.y)}
              </button>
            )}
          </Field>
 
          <Field orientation="horizontal" className={FIELD_CLASS}>
            <FieldLabel htmlFor="image-w" className={LABEL_CLASS}>
              w
            </FieldLabel>
            {isEditing ? (
              <Input
                id="image-w"
                value={wStr}
                onChange={e => {
                  setWStr(e.target.value);
                  setSizeSource('w');
                }}
                onKeyDown={onKeyDown}
                className={INPUT_CLASS} />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={TRIGGER_CLASS}>
                {Math.round(image.width)}
              </button>
            )}
          </Field>
 
          <Field orientation="horizontal" className={FIELD_CLASS}>
            <FieldLabel htmlFor="image-h" className={LABEL_CLASS}>
              h
            </FieldLabel>
            {isEditing ? (
              <Input
                id="image-h"
                value={hStr}
                onChange={e => {
                  setHStr(e.target.value);
                  setSizeSource('h');
                }}
                onKeyDown={onKeyDown}
                className={INPUT_CLASS} />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={TRIGGER_CLASS}>
                {Math.round(height)}
              </button>
            )}
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )

}
