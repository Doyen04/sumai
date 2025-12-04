import { useState } from 'react';
import {
    FileDown,
    Copy,
    Check,
    RefreshCw,
    FileText,
    Presentation,
    Eye,
    EyeOff,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/utils';
import { Button, Tooltip } from '@/components/ui';
import type { SummaryLength, HighlightVisibility, ExportFormat } from '@/types';
import { SUMMARY_LENGTH_OPTIONS } from '@/constants';

interface SummaryControlsProps {
    summaryLength: SummaryLength;
    highlightVisibility: HighlightVisibility;
    isRegenerating?: boolean;
    onLengthChange: (length: SummaryLength) => void;
    onVisibilityChange: (visibility: HighlightVisibility) => void;
    onRegenerate: () => void;
    onExport: (format: ExportFormat) => void;
    onCopy: () => void;
    className?: string;
}

export function SummaryControls({
    summaryLength,
    highlightVisibility,
    isRegenerating = false,
    onLengthChange,
    onVisibilityChange,
    onRegenerate,
    onExport,
    onCopy,
    className,
}: SummaryControlsProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const visibilityOptions = [
        { value: 'all', label: 'All highlights', icon: Eye },
        { value: 'key', label: 'Key only', icon: Sparkles },
        { value: 'none', label: 'No highlights', icon: EyeOff },
    ];

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-3 p-4 bg-background border-t border-border',
                className
            )}
        >
            {/* Summary Length */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Length:</span>
                <div className="flex rounded-md border border-border overflow-hidden">
                    {SUMMARY_LENGTH_OPTIONS.map((option) => (
                        <Tooltip key={option.value} content={option.description}>
                            <button
                                onClick={() => onLengthChange(option.value as SummaryLength)}
                                className={cn(
                                    'px-3 py-1.5 text-sm font-medium transition-colors',
                                    summaryLength === option.value
                                        ? 'bg-accent text-white'
                                        : 'bg-background text-muted hover:bg-surface-hover'
                                )}
                            >
                                {option.label}
                            </button>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Highlight Visibility */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Show:</span>
                <div className="flex rounded-md border border-border overflow-hidden">
                    {visibilityOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <Tooltip key={option.value} content={option.label}>
                                <button
                                    onClick={() => onVisibilityChange(option.value as HighlightVisibility)}
                                    className={cn(
                                        'px-2.5 py-1.5 transition-colors',
                                        highlightVisibility === option.value
                                            ? 'bg-accent text-white'
                                            : 'bg-background text-muted hover:bg-surface-hover'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRegenerate}
                    isLoading={isRegenerating}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                    Regenerate
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    className={isCopied ? 'bg-accent text-white' : ''}
                >
                    {isCopied ? 'Copied!' : 'Copy'}
                </Button>

                {/* Export Dropdown */}
                <div className="relative">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        leftIcon={<FileDown className="w-4 h-4" />}
                    >
                        Export
                    </Button>

                    {showExportMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowExportMenu(false)}
                            />
                            <div className="absolute right-0 bottom-full mb-2 w-40 bg-background border border-border rounded-lg shadow-lg z-20 py-1">
                                <button
                                    onClick={() => {
                                        onExport('pdf');
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export as PDF
                                </button>
                                <button
                                    onClick={() => {
                                        onExport('docx');
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export as Word
                                </button>
                                <button
                                    onClick={() => {
                                        onExport('pptx');
                                        setShowExportMenu(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                                >
                                    <Presentation className="w-4 h-4" />
                                    Export as PowerPoint
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
