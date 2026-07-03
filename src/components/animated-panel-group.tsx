import { useEffect, useState, type ReactNode } from 'react';
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

  const { openSize, open, onOpenChange, ...rest } = props;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open && panel.isCollapsed()) {
      panel.resize(openSize);
    } else if (!open && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [open, openSize]);

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
      onResize={onResize}>
      {props.children}
    </Panel>
  )

}