import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Group, Panel, usePanelRef, type PanelProps } from 'react-resizable-panels';
import { cn } from '@/shadcn/utils';

interface AnimatedPanelGroupProps {

  className?: string;

  children: ReactNode;

}

export const AnimatedPanelGroup = (props: AnimatedPanelGroupProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Don't animate on initial render (glitch!), but enable animate after
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Group
      className={cn(
        props.className,
        animate && '*:transition-[flex] *:duration-300 has-data-[separator=active]:*:transition-none'
      )}>

      {props.children}
    </Group>
  )
  
}

interface AnimatedPanelProps extends PanelProps {

  openSize: number;

  open: boolean;

  onOpenChange(open: boolean): void;

}

export const AnimatedPanel = (props: AnimatedPanelProps) => {
  const panelRef = usePanelRef();
  const elementRef = useRef<HTMLDivElement>(null);

  const { openSize, open, onOpenChange, children, ...rest } = props;

  // Fix panel contents to their final width while opening/closing (and let
  // it get clipped by the Panel's own overflow) to avoid reflowing.
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open && panel.isCollapsed()) {
      setIsAnimating(true);
      panel.resize(openSize);
    } else if (!open && !panel.isCollapsed()) {
      setIsAnimating(true);
      panel.collapse();
    }
  }, [open, openSize]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName.startsWith('flex'))
        setIsAnimating(false);
    }

    el.addEventListener('transitionend', onTransitionEnd);
    return () => el.removeEventListener('transitionend', onTransitionEnd);
  }, []);

  const onResize = () => {
    const collapsed = panelRef.current?.isCollapsed() ?? true;
    onOpenChange(!collapsed);
  }

  return (
    <Panel
      {...rest}
      collapsible
      defaultSize={0}
      panelRef={panelRef}
      elementRef={elementRef}
      onResize={onResize}
      style={{ overflow: 'hidden' }}>
      <div
        className="h-full"
        style={isAnimating ? { width: openSize } : undefined}>
        {children}
      </div>
    </Panel>
  )

}