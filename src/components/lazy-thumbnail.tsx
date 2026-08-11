import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import pLimit from 'p-limit';
import { cn } from '@/shadcn/utils';

const IDLE_DELAY_MS = 350;

const limit = pLimit(5);

type LazyThumbnailStatus = 'idle' | 'active' | 'loaded';

interface LazyThumbnailProps {

  src: string;

  alt: string;

  className?: string;

  style?: React.CSSProperties;

}

export const LazyThumbnail = (props: LazyThumbnailProps) => {
  const { src, alt, className, style } = props;

  const [status, setStatus] = useState<LazyThumbnailStatus>('idle');

  const releaseRef = useRef<(() => void) | undefined>(undefined);

  const { ref, inView } = useInView({
    rootMargin: '200px 0px',
    skip: status === 'loaded'
  });

  useEffect(() => {
    if (!inView) return;

    let phase: 'debouncing' | 'queued' | 'active' | 'cancelled' = 'debouncing';

    const timer = setTimeout(() => {
      phase = 'queued';

      const done = new Promise<void>(resolve => { releaseRef.current = resolve; });

      limit(() => {
        if (phase === 'cancelled') return;
        phase = 'active';
        setStatus('active');
        return done;
      });
    }, IDLE_DELAY_MS);

    return () => {
      clearTimeout(timer);

      if (phase === 'active') {
        releaseRef.current?.();
        releaseRef.current = undefined;
        setStatus('idle');
      }

      phase = 'cancelled';
    };
  }, [inView]);

  const onSettled = () => {
    releaseRef.current?.();
    releaseRef.current = undefined;
    setStatus('loaded');
  }

  return status === 'idle' ? (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(className, 'bg-muted animate-pulse')}
      style={style} />
  ) : (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onSettled}
      onError={onSettled} />
  )

}
