import { forwardRef } from 'react';
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
        // Parse content and apply highlights
        const renderContent = () => {
            if (!highlights.length) {
                return <div className="document-content whitespace-pre-wrap">{content}</div>;
            }

            // For demo, we'll render with simple highlighting
            // In production, this would parse the content and insert highlight spans
            return (
                <div className="document-content">
                    {content.split('\n\n').map((paragraph, idx) => {
                        const highlight = highlights.find(h => h.documentParagraphId === `p-${idx}`);

                        if (highlight) {
                            return (
                                <p
                                    key={idx}
                                    data-highlight-id={highlight.id}
                                    className={cn(
                                        'mb-4 py-1 -mx-1 px-1 rounded',
                                        activeHighlightId === highlight.id || hoveredHighlightId === highlight.id
                                            ? 'bg-highlight-2-active ring-2 ring-accent/30'
                                            : 'bg-highlight-2'
                                    )}
                                    onClick={() => onHighlightClick(highlight)}
                                    onMouseEnter={() => onHighlightHover(highlight.id)}
                                    onMouseLeave={() => onHighlightHover(null)}
                                >
                                    {paragraph}
                                </p>
                            );
                        }

                        return <p key={idx} className="mb-4">{paragraph}</p>;
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
                <div className="flex items-center gap-2 p-3 border-b border-border bg-white">
                    <Input
                        placeholder="Search in document..."
                        leftElement={<Search className="w-4 h-4" />}
                        className="flex-1 max-w-xs h-8 text-sm"
                    />
                    <div className="flex items-center gap-1 ml-auto">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted px-2">100%</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Document Content */}
                <div
                    ref={ref}
                    className="flex-1 overflow-auto p-6 bg-white"
                >
                    {renderContent()}
                </div>

                {/* Highlight Legend */}
                <div className="flex items-center gap-4 p-3 border-t border-border bg-surface text-xs">
                    <span className="text-muted">Highlights:</span>
                    {HIGHLIGHT_COLORS.slice(0, 3).map((color) => (
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
