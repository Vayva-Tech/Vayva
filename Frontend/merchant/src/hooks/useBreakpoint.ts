import { useEffect, useState } from 'react';

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UseBreakpointProps {
  breakpoint?: Breakpoint;
}

export function useBreakpoint({ breakpoint = 'md' }: UseBreakpointProps = {}) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setCurrentBreakpoint(
        width >= breakpoints['2xl'] ? '2xl' :
        width >= breakpoints.xl ? 'xl' :
        width >= breakpoints.lg ? 'lg' :
        width >= breakpoints.md ? 'md' : 'sm'
      );
      setIsMobile(width < breakpoints[breakpoint]);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoint]);

  return { isMobile, currentBreakpoint };
}

export function getResponsiveClasses(classes: Record<Breakpoint, string>): string {
  return Object.values(classes).join(' ');
}
