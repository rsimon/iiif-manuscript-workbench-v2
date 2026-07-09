import { useEffect } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractInstruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import type { ReconstructionCanvas } from '@/types';
import { useDragAndDrop, type DragPayload } from './use-drag-and-drop';
import { ReconstructionTreeItem } from './reconstruction-tree-item';

interface ReconstructionTreeProps {

  canvases: ReconstructionCanvas[];

  onChange(canvases: ReconstructionCanvas[]): void;

}

export const ReconstructionTree = (props: ReconstructionTreeProps) => {

  const { extractChild, mergeInto, reorderRoot } = useDragAndDrop();

  useEffect(() => monitorForElements({
    onDrop({ source, location }) {
      const target = location.current.dropTargets[0];
      if (!target) return;

      const payload = source.data as unknown as DragPayload;
      const instruction = extractInstruction(target.data);
      if (!instruction) return;

      const targetIndex = target.data.index as number;

      if (instruction.type === 'make-child') {
        props.onChange(mergeInto(props.canvases, target.data.id as string, payload));
      } else if (
        instruction.type === 'reorder-above' ||
        instruction.type === 'reorder-below'
      ) {
        if (payload.kind === 'root') {
          const finishIndex = getReorderDestinationIndex({
            startIndex: payload.index,
            indexOfTarget: targetIndex,
            closestEdgeOfTarget: instruction.type === 'reorder-above' ? 'top' : 'bottom',
            axis: 'vertical'
          });

          if (finishIndex !== payload.index)
            props.onChange(reorderRoot(props.canvases, payload.index, finishIndex));
        } else {
          const insertIndex =
            instruction.type === 'reorder-above' ? targetIndex : targetIndex + 1;

          props.onChange(extractChild(props.canvases, payload, insertIndex));
        }
      }
      // 'instruction-blocked' (composite onto composite) falls through: no-op
    }
  }), [props.canvases, props.onChange, extractChild, mergeInto, reorderRoot]);

  return (
    <ul className="flex flex-col gap-2">
      {props.canvases.map((item, index) => (
        <ReconstructionTreeItem 
          key={item.id} 
          item={item} 
          index={index} />
      ))}
    </ul>
  )

}