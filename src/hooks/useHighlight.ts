import { useState, useCallback, useMemo } from 'react';
import type { Highlight, HighlightColorIndex, HighlightVisibility, HighlightFilter } from '@/types';

interface UseHighlightOptions {
    highlights: Highlight[];
    onHighlightClick?: (highlight: Highlight) => void;
}

export function useHighlight({ highlights, onHighlightClick }: UseHighlightOptions) {
    const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
    const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<HighlightVisibility>('all');
    const [filter, setFilter] = useState<HighlightFilter>({
        importance: 'all',
    });

    const filteredHighlights = useMemo(() => {
        if (visibility === 'none') return [];

        let filtered = [...highlights];

        // Filter by visibility
        if (visibility === 'key') {
            // Assume highlights with colorIndex 1 or 2 are "key"
            filtered = filtered.filter(h => h.colorIndex <= 2);
        }

        // Filter by importance (based on confidence in summary)
        if (filter.importance !== 'all') {
            // This would need to be connected to actual confidence data
            // For now, we keep all
        }

        // Filter by keyword
        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            filtered = filtered.filter(h =>
                h.sourceText.toLowerCase().includes(keyword)
            );
        }

        return filtered;
    }, [highlights, visibility, filter]);

    const handleHighlightHover = useCallback((highlightId: string | null) => {
        setHoveredHighlightId(highlightId);
    }, []);

    const handleHighlightClick = useCallback((highlight: Highlight) => {
        setActiveHighlightId(highlight.id);
        onHighlightClick?.(highlight);
    }, [onHighlightClick]);

    const clearActiveHighlight = useCallback(() => {
        setActiveHighlightId(null);
    }, []);

    const getHighlightStyle = useCallback((
        highlightId: string,
        colorIndex: HighlightColorIndex
    ) => {
        const isActive = activeHighlightId === highlightId;
        const isHovered = hoveredHighlightId === highlightId;

        const colorMap: Record<HighlightColorIndex, { base: string; active: string }> = {
            1: { base: 'bg-highlight-1', active: 'bg-highlight-1-active' },
            2: { base: 'bg-highlight-2', active: 'bg-highlight-2-active' },
            3: { base: 'bg-highlight-3', active: 'bg-highlight-3-active' },
            4: { base: 'bg-highlight-4', active: 'bg-highlight-4-active' },
            5: { base: 'bg-highlight-5', active: 'bg-highlight-5-active' },
        };

        const colors = colorMap[colorIndex];

        return {
            className: `
        ${isActive || isHovered ? colors.active : colors.base}
        ${isActive ? 'highlight-glow' : ''}
        transition-all duration-150 cursor-pointer
        ${isHovered ? 'ring-2 ring-accent/50' : ''}
      `.trim(),
            isActive,
            isHovered,
        };
    }, [activeHighlightId, hoveredHighlightId]);

    return {
        activeHighlightId,
        hoveredHighlightId,
        visibility,
        filter,
        filteredHighlights,
        setVisibility,
        setFilter,
        handleHighlightHover,
        handleHighlightClick,
        clearActiveHighlight,
        getHighlightStyle,
    };
}
