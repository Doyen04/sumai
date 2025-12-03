import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List } from 'lucide-react';
import { Button, Input, ConfirmModal, EmptyState } from '@/components/ui';
import { DocumentHistory } from '@/components/features';
import { getDocuments, deleteDocument } from '@/services';
import type { Document } from '@/types';

export function DocumentsPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const docs = await getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDocumentClick = (doc: Document) => {
        navigate(`/documents/${doc.id}`);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            setIsDeleting(true);
            await deleteDocument(deleteTarget.id);
            setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error('Failed to delete document:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading-1">Documents</h1>
                    <p className="text-muted mt-1">
                        Manage your uploaded documents and summaries
                    </p>
                </div>
                <Button onClick={() => navigate('/')}>Upload New</Button>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftElement={<Search className="w-4 h-4" />}
                    className="max-w-xs"
                />

                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-9 w-9 p-0"
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-9 w-9 p-0"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Documents Grid/List */}
            {filteredDocuments.length === 0 && !isLoading ? (
                <EmptyState
                    title="No documents found"
                    description={
                        searchQuery
                            ? "Try adjusting your search query"
                            : "Upload your first document to get started"
                    }
                    action={
                        !searchQuery && (
                            <Button onClick={() => navigate('/')}>Upload Document</Button>
                        )
                    }
                />
            ) : (
                <DocumentHistory
                    documents={filteredDocuments}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    onDocumentClick={handleDocumentClick}
                    onDocumentDelete={setDeleteTarget}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Document"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
