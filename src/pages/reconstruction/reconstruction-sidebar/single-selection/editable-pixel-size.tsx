import { parseNumber } from '@/store/app-store-utils';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { Input } from '@/shadcn/input';
import { Field, FieldGroup, FieldLabel } from '@/shadcn/field';
import { EDITABLE_TRIGGER_CLASS, isBlurLeavingGroup } from '../reconstruction-sidebar-utils';

interface EditablePixelSizeProps {

  width: number;

  height: number;

  onCommit(width: number, height: number): void;

}

export const EditablePixelSize = (props: EditablePixelSizeProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const [widthStr, setWidthStr] = useState('');
  const [heightStr, setHeightStr] = useState('');

  const groupRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    setWidthStr(String(props.width));
    setHeightStr(String(props.height));

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

  const onCancel = () => {
    setWidthStr(String(props.width));
    setHeightStr(String(props.height));
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
    <FieldGroup
      ref={groupRef}
      onBlur={onGroupBlur}
      className="flex-row items-center gap-2">
      <Field>
        <FieldLabel htmlFor="pixel-width" className="sr-only">
          Width
        </FieldLabel>
        <Input
          id="pixel-width"
          ref={widthRef}
          value={widthStr}
          onChange={e => setWidthStr(e.target.value)}
          onKeyDown={onKeyDown}
          className="tabular-nums h-7 p-0.5" />
      </Field>

      <span className="text-muted-foreground">×</span>

      <Field>
        <FieldLabel htmlFor="pixel-height" className="sr-only">
          Height
        </FieldLabel>
        <Input
          id="pixel-height"
          value={heightStr}
          onChange={e => setHeightStr(e.target.value)}
          onKeyDown={onKeyDown}
          className="tabular-nums h-7 p-0.5" />
      </Field>

      <span className="text-muted-foreground text-sm shrink-0">px</span>
    </FieldGroup>
  ) : (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={EDITABLE_TRIGGER_CLASS}>
      {Math.round(props.width).toLocaleString()} × {Math.round(props.height).toLocaleString()} px
    </button>
  )

}
