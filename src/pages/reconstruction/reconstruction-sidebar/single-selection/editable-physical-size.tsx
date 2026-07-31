import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import type { PhysicalSize } from '@/types';
import { parseNumber } from '@/store/app-store-utils';
import { Input } from '@/shadcn/input';
import { Field, FieldGroup, FieldLabel } from '@/shadcn/field';
import { isBlurLeavingGroup } from '../reconstruction-sidebar-utils';
import { IconPlus } from '@tabler/icons-react';

interface EditablePhysicalSizeProps {

  size?: PhysicalSize;

  onCommit(size?: PhysicalSize): void;

}

const formatPhysicalSize = (size: PhysicalSize): string =>
  `${size.width} × ${size.height} ${size.unit}`;

export const EditablePhysicalSize = (props: EditablePhysicalSizeProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const [widthStr, setWidthStr] = useState('');
  const [heightStr, setHeightStr] = useState('');
  const [unitStr, setUnitStr] = useState('');

  const groupRef = useRef<HTMLDivElement>(null);
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

    setIsEditing(false);
  }

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

  return isEditing ? (
    <FieldGroup
      ref={groupRef}
      onBlur={onGroupBlur}
      className="flex-row items-center gap-2">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="physical-width" className="sr-only">
          Width
        </FieldLabel>
        <Input
          id="physical-width"
          ref={widthRef}
          placeholder="–"
          value={widthStr}
          onChange={e => setWidthStr(e.target.value)}
          onKeyDown={onKeyDown}
          className="tabular-nums shrink-0 h-7 p-1 field-sizing-content min-w-[4ch] max-w-[8ch]" />
      </Field>

      <span className="text-muted-foreground">×</span>

      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="physical-height" className="sr-only">
          Height
        </FieldLabel>
        <Input
          id="physical-height"
          placeholder="–"
          value={heightStr}
          onChange={e => setHeightStr(e.target.value)}
          onKeyDown={onKeyDown}
          className="tabular-nums shrink-0 h-7 p-1 field-sizing-content min-w-[4ch] max-w-[8ch]" />
      </Field>

      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="physical-unit" className="sr-only">
          Unit
        </FieldLabel>
        <Input
          id="physical-unit"
          placeholder="unit"
          value={unitStr}
          onChange={e => setUnitStr(e.target.value)}
          onKeyDown={onKeyDown}
          className="tabular-nums shrink-0 h-7 p-1 field-sizing-content min-w-[4ch] max-w-[6ch]" />
      </Field>
    </FieldGroup>
  ) : props.size ? (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="tabular-nums hover:text-foreground hover:underline underline-offset-2 decoration-dotted cursor-text text-sm">
      {formatPhysicalSize(props.size)}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="text-primary flex gap-0.5 items-center text-sm hover:underline cursor-pointer underline-offset-2 decoration-dotted">
      <IconPlus className="size-3.5" /> Set dimensions
    </button>
  )

}
