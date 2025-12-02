import { useCallback, useSyncExternalStore } from 'react';
import { BREAKPOINTS } from '@/constants';

type Breakpoint = keyof typeof BREAKPOINTS;

function getSnapshot(query: string): boolean {
    return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
    return false;
}

function subscribe(query: string, callback: () => void): () => void {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
}

export function useMediaQuery(query: string): boolean {
    const matches = useSyncExternalStore(
        (callback) => subscribe(query, callback),
        () => getSnapshot(query),
        getServerSnapshot
    );

    return matches;
}

export function useBreakpoint() {
    const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
    const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
    const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
    const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
    const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

    const current = useCallback((): Breakpoint => {
        if (is2xl) return '2xl';
        if (isXl) return 'xl';
        if (isLg) return 'lg';
        if (isMd) return 'md';
        if (isSm) return 'sm';
        return 'sm';
    }, [isSm, isMd, isLg, isXl, is2xl]);

    return {
        isMobile: !isMd,
        isTablet: isMd && !isLg,
        isDesktop: isLg,
        current: current(),
        isSm,
        isMd,
        isLg,
        isXl,
        is2xl,
    };
}
