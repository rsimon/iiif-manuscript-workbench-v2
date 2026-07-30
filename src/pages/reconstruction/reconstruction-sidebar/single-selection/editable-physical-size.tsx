import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import type { PhysicalSize } from '@/types';
import { parseNumber } from '@/store/app-store-utils';
import { EDITABLE_INPUT_CLASS, EDITABLE_TRIGGER_CLASS, isBlurLeavingGroup } from '../reconstruction-sidebar-utils';

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
    <span ref={groupRef} onBlur={onGroupBlur} className="inline-flex items-center gap-1 flex-wrap">
      <input
        ref={widthRef}
        placeholder="–"
        value={widthStr}
        onChange={e => setWidthStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={EDITABLE_INPUT_CLASS} />
      <span>×</span>
      <input
        placeholder="–"
        value={heightStr}
        onChange={e => setHeightStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={EDITABLE_INPUT_CLASS} />
      <input
        placeholder="unit"
        value={unitStr}
        onChange={e => setUnitStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={EDITABLE_INPUT_CLASS} />
    </span>
  ) : props.size ? (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={EDITABLE_TRIGGER_CLASS}>
      Physical size: {formatPhysicalSize(props.size)}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="text-muted-foreground/70 hover:text-foreground hover:underline underline-offset-2 decoration-dotted cursor-text">
      + Add physical size
    </button>
  )

}