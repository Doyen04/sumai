import { forwardRef, useMemo } from 'react';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/utils';
import { Button, Input, DocumentViewerSkeleton } from '@/components/ui';
import type { Highlight } from '@/types';
import { HIGHLIGHT_COLORS } from '@/constants';

interface DocumentViewerProps {
    content: string;
    highlights: Highlight[];
    activeHighlightId: string | null;
    hoveredHighlightId: string | null;
    isLoading?: boolean;
    onHighlightClick: (highlight: Highlight) => void;
    onHighlightHover: (highlightId: string | null) => void;
    className?: string;
}

interface TextSegment {
    text: string;
    highlight: Highlight | null;
}

export const DocumentViewer = forwardRef<HTMLDivElement, DocumentViewerProps>(
    (
        {
            content,
            highlights,
            activeHighlightId,
            hoveredHighlightId,
            isLoading = false,
            onHighlightClick,
            onHighlightHover,
            className,
        },
        ref
    ) => {
        // Get the CSS class for highlight color based on colorIndex
        const getHighlightStyle = (colorIndex: number, isActive: boolean) => {
            const colorMap: Record<number, { base: string; active: string; border: string }> = {
                1: { base: 'bg-amber-100', active: 'bg-amber-200', border: 'ring-amber-400' },
                2: { base: 'bg-blue-100', active: 'bg-blue-200', border: 'ring-blue-400' },
                3: { base: 'bg-green-100', active: 'bg-green-200', border: 'ring-green-400' },
                4: { base: 'bg-pink-100', active: 'bg-pink-200', border: 'ring-pink-400' },
                5: { base: 'bg-indigo-100', active: 'bg-indigo-200', border: 'ring-indigo-400' },
            };
            const colors = colorMap[colorIndex] || colorMap[1];
            return {
                bg: isActive ? colors.active : colors.base,
                border: colors.border,
            };
        };

        // Find all occurrences of source texts in the content and create segments
        const segments = useMemo((): TextSegment[] => {
            if (!content || !highlights.length) {
                return [{ text: content, highlight: null }];
            }

            // Find positions of all highlights in the content
            const matches: Array<{ start: number; end: number; highlight: Highlight }> = [];

            for (const highlight of highlights) {
                if (!highlight.sourceText || highlight.sourceText.length < 5) continue;

                // First, try to use the character offsets from Gemini (most precise)
                const sourceLocation = highlight.sourceLocation;
                if (sourceLocation && sourceLocation.startOffset > 0 && sourceLocation.endOffset > sourceLocation.startOffset) {
                    const start = sourceLocation.startOffset;
                    const end = Math.min(sourceLocation.endOffset, content.length);

                    // Verify the text at this position is similar to sourceText
                    const textAtPosition = content.slice(start, end);
                    const sourceTextLower = highlight.sourceText.toLowerCase().trim();
                    const textAtPosLower = textAtPosition.toLowerCase().trim();

                    // Check if position text matches sourceText (allowing some flexibility)
                    if (textAtPosLower.includes(sourceTextLower.slice(0, 30)) ||
                        sourceTextLower.includes(textAtPosLower.slice(0, 30))) {
                        matches.push({ start, end, highlight });
                        continue;
                    }
                }

                // Fallback: Try to find the source text in the content (case-insensitive)
                const searchText = highlight.sourceText.trim();
                const contentLower = content.toLowerCase();
                const searchLower = searchText.toLowerCase();

                let index = contentLower.indexOf(searchLower);
                if (index !== -1) {
                    matches.push({
                        start: index,
                        end: index + searchText.length,
                        highlight,
                    });
                } else {
                    // Try partial match with first 40 chars
                    const partialSearch = searchLower.slice(0, 40);
                    index = contentLower.indexOf(partialSearch);
                    if (index !== -1) {
                        // Find the end of the sentence or paragraph
                        let endIndex = index + highlight.sourceText.length;
                        const nextPeriod = content.indexOf('.', index + partialSearch.length);
                        const nextNewline = content.indexOf('\n', index + partialSearch.length);
                        if (nextPeriod !== -1 && nextPeriod < endIndex + 100) {
                            endIndex = nextPeriod + 1;
                        } else if (nextNewline !== -1 && nextNewline < endIndex + 100) {
                            endIndex = nextNewline;
                        }
                        matches.push({
                            start: index,
                            end: Math.min(endIndex, content.length),
                            highlight,
                        });
                    }
                }
            }

            if (matches.length === 0) {
                return [{ text: content, highlight: null }];
            }

            // Sort matches by start position
            matches.sort((a, b) => a.start - b.start);

            // Remove overlapping matches (keep the first one)
            const nonOverlapping: typeof matches = [];
            for (const match of matches) {
                const lastMatch = nonOverlapping[nonOverlapping.length - 1];
                if (!lastMatch || match.start >= lastMatch.end) {
                    nonOverlapping.push(match);
                }
            }

            // Build segments
            const result: TextSegment[] = [];
            let lastEnd = 0;

            for (const match of nonOverlapping) {
                // Add non-highlighted text before this match
                if (match.start > lastEnd) {
                    result.push({
                        text: content.slice(lastEnd, match.start),
                        highlight: null,
                    });
                }

                // Add highlighted text
                result.push({
                    text: content.slice(match.start, match.end),
                    highlight: match.highlight,
                });

                lastEnd = match.end;
            }

            // Add remaining text after last match
            if (lastEnd < content.length) {
                result.push({
                    text: content.slice(lastEnd),
                    highlight: null,
                });
            }

            return result;
        }, [content, highlights]);

        // Render content with inline highlights
        const renderContent = () => {
            return (
                <div className="document-content whitespace-pre-wrap leading-relaxed">
                    {segments.map((segment, idx) => {
                        if (!segment.highlight) {
                            return <span key={idx}>{segment.text}</span>;
                        }

                        const highlight = segment.highlight;
                        const isActive = activeHighlightId === highlight.id || hoveredHighlightId === highlight.id;
                        const style = getHighlightStyle(highlight.colorIndex, isActive);

                        return (
                            <mark
                                key={idx}
                                data-highlight-id={highlight.id}
                                className={cn(
                                    'cursor-pointer rounded px-0.5 transition-all duration-150',
                                    style.bg,
                                    isActive && `ring-2 ${style.border}`
                                )}
                                onClick={() => onHighlightClick(highlight)}
                                onMouseEnter={() => onHighlightHover(highlight.id)}
                                onMouseLeave={() => onHighlightHover(null)}
                            >
                                {segment.text}
                            </mark>
                        );
                    })}
                </div>
            );
        };

        if (isLoading) {
            return (
                <div className={cn('h-full overflow-auto', className)}>
                    <DocumentViewerSkeleton />
                </div>
            );
        }

        return (
            <div className={cn('flex flex-col h-full', className)}>
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-3 border-b border-border bg-background">
                    <Input
                        placeholder="Search in document..."
                        leftElement={<Search className="w-4 h-4" />}
                        className="flex-1 max-w-xs h-8 text-sm"
                    />
                    <div className="flex items-center gap-1 ml-auto">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                            <ZoomOut className="w-8 h-8" />
                        </Button>
                        <span className="text-sm text-muted px-2">100%</span>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                            <ZoomIn className="w-8 h-8" />
                        </Button>
                    </div>
                </div>

                {/* Document Content */}
                <div
                    ref={ref}
                    className="flex-1 overflow-auto p-6 bg-background"
                >
                    {renderContent()}
                </div>

                {/* Highlight Legend */}
                <div className="flex items-center gap-4 p-3 border-t border-border bg-surface text-xs">
                    <span className="text-muted">Highlights:</span>
                    {HIGHLIGHT_COLORS.map((color) => (
                        <div key={color.index} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: color.base }}
                            />
                            <span className="text-muted">{color.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

DocumentViewer.displayName = 'DocumentViewer';
