import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button, Alert, Spinner } from '@/components/ui';
import {
    DocumentViewer,
    SummaryPanel,
    SummaryControls,
} from '@/components/features';
import { useHighlight, useScrollSync } from '@/hooks';
import { generateSummary, getDocument } from '@/services';
import type { Document, Summary, SummaryLength, HighlightVisibility, ExportFormat } from '@/types';

export function DocumentViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<Document | null>(null);
    const [isLoadingDocument, setIsLoadingDocument] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [summaryLength, setSummaryLength] = useState<SummaryLength>('balanced');
    const [highlightVisibility, setHighlightVisibility] = useState<HighlightVisibility>('all');
    const [error, setError] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const {
        activeHighlightId,
        hoveredHighlightId,
        filteredHighlights,
        handleHighlightClick,
        handleHighlightHover,
        setVisibility,
    } = useHighlight({
        highlights: summary?.highlights || [],
    });

    const { leftPanelRef, rightPanelRef, scrollToElement } = useScrollSync();

    // Load document on mount
    useEffect(() => {
        const loadDocument = async () => {
            if (!id) return;

            try {
                setIsLoadingDocument(true);
                const doc = await getDocument(id);
                if (doc) {
                    setDocument(doc);
                } else {
                    setError('Document not found. It may have been deleted or the session expired.');
                    setIsLoadingSummary(false);
                }
            } catch (err) {
                console.error('Failed to load document:', err);
                setError('Failed to load document.');
                setIsLoadingSummary(false);
            } finally {
                setIsLoadingDocument(false);
            }
        };

        loadDocument();
    }, [id]);

    const handleGenerateSummary = useCallback(async () => {
        // For PDFs, content is empty but we still have the file data
        // Check if document exists (not just content) since PDFs have pdfData instead
        if (!id || !document) return;

        try {
            setIsLoadingSummary(true);
            setError(null);
            const result = await generateSummary(id, summaryLength);
            setSummary(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
            setError(errorMessage);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [id, summaryLength, document]);

    // Auto-generate summary when document is loaded
    useEffect(() => {
        // Trigger for non-PDF (has content) or PDF (has pdfData)
        const canGenerateSummary = document?.content || document?.pdfData;
        if (canGenerateSummary && !summary) {
            handleGenerateSummary();
        }
    }, [document?.content, document?.pdfData, summary, handleGenerateSummary]);

    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);
            await handleGenerateSummary();
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleLengthChange = async (length: SummaryLength) => {
        if (length === summaryLength) return;

        setSummaryLength(length);

        // Regenerate summary with new length (check for content OR pdfData for PDFs)
        if (id && (document?.content || document?.pdfData)) {
            try {
                setIsRegenerating(true);
                setError(null);
                const result = await generateSummary(id, length);
                setSummary(result);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
                setError(errorMessage);
            } finally {
                setIsRegenerating(false);
            }
        }
    };

    const handleVisibilityChange = (visibility: HighlightVisibility) => {
        setHighlightVisibility(visibility);
        setVisibility(visibility);
    };

    const handleSummaryItemClick = (sectionId: string, highlightId?: string) => {
        if (highlightId) {
            handleHighlightClick({
                id: highlightId,
                summaryLineId: sectionId,
                documentParagraphId: '',
                colorIndex: 1,
                sourceText: '',
                sourceLocation: { page: 1, paragraph: 1, startOffset: 0, endOffset: 0 },
            });
            scrollToElement(highlightId, 'left');
        }
    };

    const handleDocumentHighlightClick = (highlight: typeof filteredHighlights[0]) => {
        handleHighlightClick(highlight);
        scrollToElement(highlight.summaryLineId, 'right');
    };

    const handleExport = (format: ExportFormat) => {
        // In production, this would trigger actual export
        console.log('Exporting as:', format);
    };

    const handleCopy = () => {
        if (summary) {
            const text = summary.content
                .map((s) => s.content)
                .join('\n\n');
            navigator.clipboard.writeText(text);
        }
    };

    // Loading state
    if (isLoadingDocument) {
        return (
            <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg" className="mx-auto mb-4" />
                    <p className="text-muted">Loading document...</p>
                </div>
            </div>
        );
    }

    // Document not found
    if (!document) {
        return (
            <div className="h-[calc(100vh-7rem)] flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Document Not Found</h2>
                    <p className="text-muted mb-6">
                        The document you're looking for doesn't exist or has been removed.
                        Please upload a new document to get started.
                    </p>
                    <Button onClick={() => navigate('/')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-7rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-semibold text-foreground truncate">
                        {document.name}
                    </h1>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="error" className="mb-4" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Main Content - Split View */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Document Viewer (Left Panel) */}
                <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden">
                    <DocumentViewer
                        ref={leftPanelRef}
                        content={document.content || ''}
                        contentType={document.contentType}
                        pdfData={document.pdfData}
                        highlights={highlightVisibility !== 'none' ? filteredHighlights : []}
                        activeHighlightId={activeHighlightId}
                        hoveredHighlightId={hoveredHighlightId}
                        isLoading={false}
                        onHighlightClick={handleDocumentHighlightClick}
                        onHighlightHover={handleHighlightHover}
                    />
                </div>

                {/* Summary Panel (Right Panel) */}
                <div className="w-[400px] xl:w-[480px] bg-background border border-border rounded-lg overflow-hidden flex flex-col">
                    <SummaryPanel
                        ref={rightPanelRef}
                        summary={summary}
                        isLoading={isLoadingSummary}
                        activeHighlightId={activeHighlightId}
                        onSummaryItemClick={handleSummaryItemClick}
                        onSummaryItemHover={handleHighlightHover}
                        className="flex-1"
                    />

                    {summary && (
                        <SummaryControls
                            summaryLength={summaryLength}
                            highlightVisibility={highlightVisibility}
                            isRegenerating={isRegenerating}
                            onLengthChange={handleLengthChange}
                            onVisibilityChange={handleVisibilityChange}
                            onRegenerate={handleRegenerate}
                            onExport={handleExport}
                            onCopy={handleCopy}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
