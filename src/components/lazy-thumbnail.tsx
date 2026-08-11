import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import pLimit from 'p-limit';
import { cn } from '@/shadcn/utils';

// Skip loading thumbnails the user is just scrolling past.
const IDLE_DELAY_MS = 350;

// Caps how many thumbnails can be fetching/decoding at once, so a burst of
// rows crossing the intersection threshold during fast scroll doesn't all
// hit the network simultaneously. Shared across every thumbnail on the page.
const limit = pLimit(5);

type Status = 'idle' | 'active' | 'loaded';

interface LazyThumbnailProps {

  src: string;

  alt: string;

  className?: string;

  style?: React.CSSProperties;

}

export const LazyThumbnail = (props: LazyThumbnailProps) => {
  const { src, alt, className, style } = props;

  const [status, setStatus] = useState<Status>('idle');
  const statusRef = useRef<Status>('idle');

  // Resolves the p-limit task, freeing its concurrency slot. Set while a
  // load is queued or active; cleared once settled or aborted.
  const releaseRef = useRef<(() => void) | undefined>(undefined);

  const { ref, inView } = useInView({
    rootMargin: '200px 0px',
    skip: status === 'loaded'
  });

  // Debounce + queue a load once the thumbnail comes into view.
  useEffect(() => {
    if (!inView || statusRef.current !== 'idle') return;

    let cancelled = false;

    const timer = setTimeout(() => {
      const done = new Promise<void>(resolve => { releaseRef.current = resolve; });

      limit(() => {
        if (cancelled) return;
        statusRef.current = 'active';
        setStatus('active');
        return done;
      });
    }, IDLE_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView]);

  // Abort if the thumbnail leaves the viewport before it finished loading.
  useEffect(() => {
    if (status !== 'active' || inView) return;

    releaseRef.current?.();
    releaseRef.current = undefined;
    statusRef.current = 'idle';
    setStatus('idle');
  }, [inView, status]);

  const onSettled = () => {
    releaseRef.current?.();
    releaseRef.current = undefined;
    statusRef.current = 'loaded';
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
