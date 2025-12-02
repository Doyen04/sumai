import { FileText } from 'lucide-react';
import { cn } from '@/utils';
import { EmptyState, DocumentCardSkeleton } from '@/components/ui';
import { DocumentCard } from './DocumentCard';
import type { Document } from '@/types';

interface DocumentHistoryProps {
    documents: Document[];
    isLoading?: boolean;
    onDocumentClick: (document: Document) => void;
    onDocumentDelete: (document: Document) => void;
    className?: string;
}

export function DocumentHistory({
    documents,
    isLoading = false,
    onDocumentClick,
    onDocumentDelete,
    className,
}: DocumentHistoryProps) {
    if (isLoading) {
        return (
            <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <DocumentCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <EmptyState
                icon={<FileText className="w-6 h-6" />}
                title="No documents yet"
                description="Upload your first document to get started with AI summarization"
                className={className}
            />
        );
    }

    return (
        <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
            {documents.map((doc) => (
                <DocumentCard
                    key={doc.id}
                    document={doc}
                    onClick={() => onDocumentClick(doc)}
                    onDelete={() => onDocumentDelete(doc)}
                />
            ))}
        </div>
    );
}
