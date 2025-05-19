
"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768; // Standard md breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Ensure window is defined (for SSR compatibility, though this is a client component)
    if (typeof window === 'undefined') {
      setIsMobile(false); 
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Set initial state
    setIsMobile(mql.matches);

    // Add listener
    mql.addEventListener("change", onChange);

    // Cleanup listener
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return isMobile;
}
