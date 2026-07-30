import { parseNumber } from '@/store/app-store-utils';
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { EDITABLE_INPUT_CLASS, EDITABLE_TRIGGER_CLASS, isBlurLeavingGroup } from '../reconstruction-sidebar-utils';

interface EditablePixelSizeProps {

  width: number;

  height: number;

  onCommit(width: number, height: number): void;

}

export const EditablePixelSize = (props: EditablePixelSizeProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const [widthStr, setWidthStr] = useState('');
  const [heightStr, setHeightStr] = useState('');

  const groupRef = useRef<HTMLSpanElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    setWidthStr(String(props.width));
    setHeightStr(String(props.height));
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
    <span 
      ref={groupRef} 
      onBlur={onGroupBlur} 
      className="inline-flex items-center gap-1">
      <input
        ref={widthRef}
        value={widthStr}
        onChange={e => setWidthStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={EDITABLE_INPUT_CLASS} />

      <span>×</span>

      <input
        value={heightStr}
        onChange={e => setHeightStr(e.target.value)}
        onKeyDown={onKeyDown}
        className={EDITABLE_INPUT_CLASS} />
      <span>px</span>
    </span>
  ) : (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={EDITABLE_TRIGGER_CLASS}>
      {Math.round(props.width).toLocaleString()} × {Math.round(props.height).toLocaleString()} px
    </button>
  )

}