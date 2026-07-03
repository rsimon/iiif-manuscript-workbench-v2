import type { ReactNode } from 'react';
import { Link, useLocation} from 'wouter';
import { cn  } from '@/shadcn/utils';
import { IIIFIcon } from '@/components/iiif-icon';

interface NavItemProps {
  
  href: string;

  children: ReactNode;

}

const NavItem = (props: NavItemProps) => {

  const [location] = useLocation();

  return (
    <Link 
      href={props.href}
      className={cn(
        'px-2 py-1.25 rounded-md',
        location === props.href ? 'bg-primary text-white' : undefined
      )}>{props.children}</Link>
  )

}

export const AppHeader = () => {

  return (
    <header className="flex justify-between items-center py-1.5 px-4 border-b text-sm">
      <div className="flex gap-6 items-center">
        <IIIFIcon 
          color 
          className="size-8 mb-0.5" />

        <nav className="flex items-center gap-2">
          <NavItem href="/sources">1. Select Sources</NavItem>
          <NavItem href="/reconstruction">2. Compose</NavItem>
          <NavItem href="/preview">3. Preview and Export</NavItem>
        </nav>
      </div>

      <div className="text-muted-foreground flex gap-4 items-center">
        <div className="cursor-pointer hover:underline hover:text-primary">Help</div>
        <div className="cursor-pointer hover:underline hover:text-primary">About</div>
      </div>
    </header>
  )

}