import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardDescription, Button, ConfirmModal } from '@/components/ui';
import { UploadZone, DocumentHistory } from '@/components/features';
import { getDocuments, deleteDocument } from '@/services';
import type { Document } from '@/types';

export function DashboardPage() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    const handleUploadComplete = (doc: Document) => {
        setDocuments((prev) => [doc, ...prev]);
        navigate(`/documents/${doc.id}`);
    };

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
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-heading-1">Dashboard</h1>
                <p className="text-muted mt-1">
                    Upload documents and get AI-powered summaries with semantic highlighting
                </p>
            </div>

            {/* Upload Section */}
            <Card padding="lg">
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>
                        Drag and drop your document or click to browse
                    </CardDescription>
                </CardHeader>
                <UploadZone onUploadComplete={handleUploadComplete} />
            </Card>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-heading-2">Recent Documents</h2>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/documents')}
                    >
                        View All
                    </Button>
                </div>
                <DocumentHistory
                    documents={documents.slice(0, 6)}
                    isLoading={isLoading}
                    onDocumentClick={handleDocumentClick}
                    onDocumentDelete={setDeleteTarget}
                />
            </div>

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
