import { useEffect, useRef } from 'react';
import { Spring, type Viewer } from 'openseadragon';
import { OSD_ANIMATION_TIME, OSD_SPRING_STIFFNESS } from '../../composer';
import type { ComposerLayoutItem } from '../../composer-types';

interface AnimatedRectProps extends Omit<React.SVGProps<SVGRectElement>, 'x' | 'y' | 'width' | 'height' | 'ref'> {

  item: ComposerLayoutItem;

  viewer: Viewer;

}

export const AnimatedRect = (props: AnimatedRectProps) => {
  const { item, viewer, ...rest } = props;

  const rectRef = useRef<SVGRectElement>(null);

  const springs = useRef<{ x: Spring; y: Spring; height: Spring }>(undefined);

  if (!springs.current) {
    const options = { springStiffness: OSD_SPRING_STIFFNESS, animationTime: OSD_ANIMATION_TIME };
    springs.current = {
      x: new Spring({ ...options, initial: item.x }),
      y: new Spring({ ...options, initial: item.y }),
      height: new Spring({ ...options, initial: item.height })
    };
  }

  useEffect(() => {
    const { x, y, height } = springs.current!;

    x.update();
    x.springTo(item.x);

    y.update();
    y.springTo(item.y);

    height.update();
    height.springTo(item.height);

    const renderFrame = () => {
      const el = rectRef.current;
      if (!el) return;

      x.update();
      y.update();
      height.update();

      el.setAttribute('x', String(x.current.value));
      el.setAttribute('y', String(y.current.value));
      el.setAttribute('height', String(height.current.value));
    }

    viewer.addHandler('update-viewport', renderFrame);

    return () => {
      viewer.removeHandler('update-viewport', renderFrame);
    };
  }, [viewer, item.x, item.y, item.height]);

  return (
    <rect
      ref={rectRef}
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
      {...rest} />
  );

}
