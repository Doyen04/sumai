import { FileText, Presentation, X, Sparkles } from 'lucide-react';
import { cn, formatFileSize } from '@/utils';
import { Button, ProgressBar } from '@/components/ui';
import { FILE_TYPE_LABELS } from '@/constants';
import type { Document } from '@/types';

interface FilePreviewProps {
    document: Document;
    uploadProgress?: number;
    onRemove?: () => void;
    onGenerateSummary?: () => void;
    className?: string;
}

export function FilePreview({
    document,
    uploadProgress,
    onRemove,
    onGenerateSummary,
    className,
}: FilePreviewProps) {
    const { name, type, size, pageCount, status } = document;
    const isUploading = status === 'uploading';
    const isProcessing = status === 'processing' || status === 'summarizing';
    const isCompleted = status === 'completed';
    const hasError = status === 'error';

    const getIcon = () => {
        if (type === 'pptx') {
            return <Presentation className="w-8 h-8" />;
        }
        return <FileText className="w-8 h-8" />;
    };

    return (
        <div
            className={cn(
                'flex items-center gap-4 p-4 bg-background border border-border rounded-lg',
                hasError && 'border-error bg-error-light',
                className
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    'w-14 h-14 rounded-lg flex items-center justify-center shrink-0',
                    hasError ? 'bg-error/10 text-error' : 'bg-surface text-muted'
                )}
            >
                {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                            {name}
                        </h4>
                        <p className="text-xs text-muted mt-0.5">
                            {FILE_TYPE_LABELS[type]} • {formatFileSize(size)} • {pageCount} pages
                        </p>
                    </div>
                    {onRemove && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRemove}
                            className="h-7 w-7 p-0 shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Progress */}
                {isUploading && uploadProgress !== undefined && (
                    <div className="mt-3">
                        <ProgressBar value={uploadProgress} size="sm" />
                        <p className="text-xs text-muted mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                )}

                {isProcessing && (
                    <div className="mt-3">
                        <ProgressBar value={50} size="sm" />
                        <p className="text-xs text-muted mt-1">Processing document...</p>
                    </div>
                )}

                {hasError && (
                    <p className="text-xs text-error mt-2">
                        Failed to process document. Please try again.
                    </p>
                )}

                {/* Actions */}
                {isCompleted && onGenerateSummary && (
                    <div className="mt-3">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onGenerateSummary}
                            leftIcon={<Sparkles className="w-4 h-4" />}
                        >
                            Generate Summary
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
