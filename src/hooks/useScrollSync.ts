import { useRef, useCallback, useEffect } from 'react';

interface UseScrollSyncOptions {
    enabled?: boolean;
}

export function useScrollSync(options: UseScrollSyncOptions = {}) {
    const { enabled = true } = options;

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const isSyncing = useRef(false);

    const scrollToElement = useCallback((
        elementId: string,
        panel: 'left' | 'right' = 'left'
    ) => {
        const panelRef = panel === 'left' ? leftPanelRef : rightPanelRef;
        const container = panelRef.current;

        if (!container) return;

        const element = container.querySelector(`[data-highlight-id="${elementId}"]`);
        if (element) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollTop = container.scrollTop + elementRect.top - containerRect.top - 100;

            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth',
            });
        }
    }, []);

    const syncScroll = useCallback((
        source: 'left' | 'right',
        scrollPercent: number
    ) => {
        if (!enabled || isSyncing.current) return;

        isSyncing.current = true;

        const targetRef = source === 'left' ? rightPanelRef : leftPanelRef;
        const target = targetRef.current;

        if (target) {
            const maxScroll = target.scrollHeight - target.clientHeight;
            target.scrollTop = maxScroll * scrollPercent;
        }

        // Reset syncing flag after animation frame
        requestAnimationFrame(() => {
            isSyncing.current = false;
        });
    }, [enabled]);

    const handleScroll = useCallback((e: Event, source: 'left' | 'right') => {
        if (!enabled) return;

        const target = e.target as HTMLDivElement;
        const scrollPercent = target.scrollTop / (target.scrollHeight - target.clientHeight);
        syncScroll(source, scrollPercent);
    }, [enabled, syncScroll]);

    useEffect(() => {
        const leftPanel = leftPanelRef.current;
        const rightPanel = rightPanelRef.current;

        if (!enabled) return;

        const leftHandler = (e: Event) => handleScroll(e, 'left');
        const rightHandler = (e: Event) => handleScroll(e, 'right');

        leftPanel?.addEventListener('scroll', leftHandler);
        rightPanel?.addEventListener('scroll', rightHandler);

        return () => {
            leftPanel?.removeEventListener('scroll', leftHandler);
            rightPanel?.removeEventListener('scroll', rightHandler);
        };
    }, [enabled, handleScroll]);

    return {
        leftPanelRef,
        rightPanelRef,
        scrollToElement,
    };
}
