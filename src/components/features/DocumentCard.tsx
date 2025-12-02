import { FileText, Presentation, Trash2, Download, Eye } from 'lucide-react';
import { cn, formatFileSize, formatRelativeTime } from '@/utils';
import { Card, Badge, Button, Tooltip } from '@/components/ui';
import { FILE_TYPE_LABELS } from '@/constants';
import type { Document, DocumentStatus } from '@/types';

interface DocumentCardProps {
    document: Document;
    onClick?: () => void;
    onDelete?: () => void;
    onDownload?: () => void;
}

const statusConfig: Record<DocumentStatus, { label: string; variant: 'default' | 'info' | 'success' | 'error' }> = {
    uploading: { label: 'Uploading', variant: 'default' },
    processing: { label: 'Processing', variant: 'info' },
    summarizing: { label: 'Summarizing', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    error: { label: 'Error', variant: 'error' },
};

export function DocumentCard({
    document,
    onClick,
    onDelete,
    onDownload,
}: DocumentCardProps) {
    const { name, type, size, uploadedAt, status, pageCount } = document;
    const statusInfo = statusConfig[status];

    const getIcon = () => {
        if (type === 'pptx') {
            return <Presentation className="w-5 h-5" />;
        }
        return <FileText className="w-5 h-5" />;
    };

    return (
        <Card
            className={cn(
                'group cursor-pointer hover:shadow-md transition-shadow duration-200',
                'hover:border-border-hover'
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-muted shrink-0">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-foreground truncate">
                                {name}
                            </h3>
                            <p className="text-xs text-muted mt-0.5">
                                {FILE_TYPE_LABELS[type]} • {formatFileSize(size)} • {pageCount} pages
                            </p>
                        </div>
                        <Badge variant={statusInfo.variant} size="sm">
                            {statusInfo.label}
                        </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted">
                            {formatRelativeTime(uploadedAt)}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip content="View">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClick?.();
                                    }}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Download">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload?.();
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Delete">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-error hover:bg-error-light"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.();
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
