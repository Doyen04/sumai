import { forwardRef } from 'react';
import { ChevronRight, AlertCircle, CheckCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/utils';
import { Button, Badge, SummarySkeleton, Tooltip } from '@/components/ui';
import type { Summary, SummarySection, ConfidenceLevel } from '@/types';

interface SummaryPanelProps {
    summary: Summary | null;
    isLoading?: boolean;
    activeHighlightId: string | null;
    onSummaryItemClick: (sectionId: string, highlightId?: string) => void;
    onSummaryItemHover: (highlightId: string | null) => void;
    className?: string;
}

const confidenceIcons: Record<ConfidenceLevel, typeof CheckCircle> = {
    high: CheckCircle,
    medium: MinusCircle,
    low: AlertCircle,
};

const confidenceColors: Record<ConfidenceLevel, string> = {
    high: 'text-success',
    medium: 'text-muted',
    low: 'text-warning',
};

export const SummaryPanel = forwardRef<HTMLDivElement, SummaryPanelProps>(
    (
        {
            summary,
            isLoading = false,
            activeHighlightId,
            onSummaryItemClick,
            onSummaryItemHover,
            className,
        },
        ref
    ) => {
        const renderSection = (section: SummarySection) => {
            const isActive = section.highlightId === activeHighlightId;
            const ConfidenceIcon = confidenceIcons[section.confidence];

            switch (section.type) {
                case 'heading':
                    return (
                        <h3
                            key={section.id}
                            className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0"
                        >
                            {section.content}
                        </h3>
                    );

                case 'key-concept':
                    return (
                        <div
                            key={section.id}
                            className={cn(
                                'flex items-start gap-2 p-3 rounded-lg mb-2',
                                'bg-accent-light border border-accent/20',
                                section.highlightId && 'cursor-pointer hover:bg-accent-muted'
                            )}
                            onClick={() => onSummaryItemClick(section.id, section.highlightId)}
                            onMouseEnter={() => section.highlightId && onSummaryItemHover(section.highlightId)}
                            onMouseLeave={() => onSummaryItemHover(null)}
                        >
                            <Badge variant="info" size="sm">Key</Badge>
                            <span className="text-sm text-foreground flex-1">{section.content}</span>
                            {section.highlightId && (
                                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                            )}
                        </div>
                    );

                case 'bullet':
                    return (
                        <div
                            key={section.id}
                            className={cn(
                                'flex items-start gap-3 py-2 px-3 -mx-3 rounded-md',
                                'transition-colors duration-150',
                                section.highlightId && 'cursor-pointer hover:bg-surface-hover',
                                isActive && 'bg-highlight-2'
                            )}
                            onClick={() => onSummaryItemClick(section.id, section.highlightId)}
                            onMouseEnter={() => section.highlightId && onSummaryItemHover(section.highlightId)}
                            onMouseLeave={() => onSummaryItemHover(null)}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-muted mt-2 shrink-0" />
                            <p className="text-sm text-muted flex-1">{section.content}</p>
                            <div className="flex items-center gap-2 shrink-0">
                                <Tooltip content={`${section.confidence} confidence`}>
                                    <ConfidenceIcon
                                        className={cn('w-4 h-4', confidenceColors[section.confidence])}
                                    />
                                </Tooltip>
                                {section.highlightId && (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                        </div>
                    );

                case 'paragraph':
                default:
                    return (
                        <div
                            key={section.id}
                            className={cn(
                                'py-2 px-3 -mx-3 rounded-md',
                                'transition-colors duration-150',
                                section.highlightId && 'cursor-pointer hover:bg-surface-hover',
                                isActive && 'bg-highlight-2'
                            )}
                            onClick={() => onSummaryItemClick(section.id, section.highlightId)}
                            onMouseEnter={() => section.highlightId && onSummaryItemHover(section.highlightId)}
                            onMouseLeave={() => onSummaryItemHover(null)}
                        >
                            <div className="flex items-start gap-2">
                                <p className="text-sm text-muted flex-1">{section.content}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Tooltip content={`${section.confidence} confidence`}>
                                        <ConfidenceIcon
                                            className={cn('w-4 h-4', confidenceColors[section.confidence])}
                                        />
                                    </Tooltip>
                                    {section.highlightId && (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            {section.highlightId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-7 text-xs text-accent"
                                >
                                    Show more context
                                </Button>
                            )}
                        </div>
                    );
            }
        };

        if (isLoading) {
            return (
                <div className={cn('h-full overflow-auto p-6', className)}>
                    <SummarySkeleton />
                </div>
            );
        }

        if (!summary) {
            return (
                <div className={cn('h-full flex items-center justify-center p-6', className)}>
                    <p className="text-sm text-muted text-center">
                        Upload a document to generate a summary
                    </p>
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn('h-full overflow-auto', className)}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-border p-4 z-10">
                    <h2 className="text-lg font-semibold text-foreground">Summary</h2>
                    <p className="text-sm text-muted mt-0.5">
                        {summary.content.length} sections • {summary.length} length
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 summary-content">
                    {summary.content.map(renderSection)}
                </div>
            </div>
        );
    }
);

SummaryPanel.displayName = 'SummaryPanel';
