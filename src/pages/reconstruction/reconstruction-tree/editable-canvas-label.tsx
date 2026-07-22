import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { withStopPropagation } from '@/shadcn/utils';

interface EditableCanvasLabelProps {

  value: string;

  isEditing?: boolean;
  
  onIsEditingChange?(editing: boolean): void;

  onCommit?(newLabel: string): void;

}

export const EditableCanvasLabel = (props: EditableCanvasLabelProps) => {
  const { value, isEditing } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!isEditing) return;

    setDraft(value);

    const frameId = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => {
      cancelAnimationFrame(frameId);
    }
  }, [isEditing]);

  const onCommit = () => {
    const trimmed = draft.trim();

    if (trimmed && trimmed !== value)
      props.onCommit?.(trimmed);
    
    props.onIsEditingChange?.(false);
  }

  const onCancel = () => {
    setDraft(value);
    props.onIsEditingChange?.(false);
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

  return isEditing ? (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onClick={withStopPropagation()}
      onBlur={onCommit}
      onKeyDown={onKeyDown}
      className="field-sizing-content min-w-[2ch] max-w-full text-sm bg-transparent outline-none ring-1 
        ring-primary rounded-xs px-0.5 -mx-0.5" />
  ) : (
    <span
      className="truncate cursor-text text-sm"
      onClick={withStopPropagation(() => props.onIsEditingChange?.(true))}>
      {value}
    </span>
  )

}