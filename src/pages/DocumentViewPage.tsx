import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button, Alert } from '@/components/ui';
import {
    DocumentViewer,
    SummaryPanel,
    SummaryControls,
} from '@/components/features';
import { useHighlight, useScrollSync } from '@/hooks';
import { generateSummary } from '@/services';
import type { Document, Summary, SummaryLength, HighlightVisibility, ExportFormat } from '@/types';

// Mock document content
const MOCK_CONTENT = `Digital Transformation: A Strategic Imperative

In today's rapidly evolving business landscape, digital transformation has become more than just a buzzword—it's a strategic imperative for organizations seeking to remain competitive and relevant. This comprehensive guide explores the key drivers, challenges, and best practices for successful digital transformation initiatives.

Understanding Digital Transformation

Digital transformation refers to the integration of digital technology into all areas of a business, fundamentally changing how organizations operate and deliver value to customers. It's not merely about adopting new technologies; it's about reimagining business processes, culture, and customer experiences in the digital age.

The business case for digital transformation is compelling. Organizations that prioritize digital transformation see 23% higher revenue growth compared to their peers. This growth stems from improved operational efficiency, enhanced customer experiences, and the ability to tap into new revenue streams.

Key Drivers of Transformation

Cloud adoption remains the primary driver of transformation initiatives. The scalability, flexibility, and cost-effectiveness of cloud solutions enable organizations to innovate faster and respond to market changes with agility. Cloud platforms also facilitate collaboration and data sharing across organizational boundaries.

Data analytics and artificial intelligence are transforming decision-making processes. By leveraging advanced analytics, organizations can gain deeper insights into customer behavior, optimize operations, and predict market trends with greater accuracy.

Employee training and change management are critical success factors. Technology alone cannot drive transformation; people must embrace new ways of working. Organizations that invest in comprehensive training programs and foster a culture of continuous learning are more likely to succeed.

Implementation Best Practices

The research indicates that successful digital transformation requires a holistic approach combining technology, process improvement, and cultural change. Organizations should start with a clear vision and strategy, aligned with business objectives and customer needs.

Executive sponsorship is essential for overcoming resistance and ensuring adequate resource allocation. Leaders must champion the transformation effort and model the behaviors they expect from others.

An iterative, agile approach allows organizations to test ideas quickly, learn from failures, and scale successful initiatives. This reduces risk and enables faster time-to-value compared to traditional waterfall methodologies.

Measuring Success

Key performance indicators should be established at the outset to track progress and demonstrate value. These metrics should encompass both operational improvements and business outcomes, such as revenue growth, customer satisfaction, and employee engagement.

Regular reviews and adjustments ensure the transformation stays on track and adapts to changing circumstances. Continuous improvement should be embedded in the organizational DNA.

Conclusion

Digital transformation is not a destination but a journey. Organizations that embrace this reality and commit to ongoing evolution will be best positioned to thrive in the digital economy. The time to act is now—those who delay risk being left behind.`;

export function DocumentViewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<Document | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
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

    const handleGenerateSummary = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoadingSummary(true);
            setError(null);
            const result = await generateSummary(id, summaryLength);
            setSummary(result);
        } catch {
            setError('Failed to generate summary. Please try again.');
        } finally {
            setIsLoadingSummary(false);
        }
    }, [id, summaryLength]);

    useEffect(() => {
        // Mock loading document
        setDocument({
            id: id || 'doc_1',
            name: 'Digital Transformation Guide.pdf',
            type: 'pdf',
            size: 2456789,
            pageCount: 12,
            uploadedAt: new Date(),
            status: 'completed',
        });

        // Auto-generate summary
        handleGenerateSummary();
    }, [id, handleGenerateSummary]);

    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);
            await handleGenerateSummary();
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleLengthChange = (length: SummaryLength) => {
        setSummaryLength(length);
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
                        {document?.name || 'Loading...'}
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
                <div className="flex-1 bg-white border border-border rounded-lg overflow-hidden">
                    <DocumentViewer
                        ref={leftPanelRef}
                        content={MOCK_CONTENT}
                        highlights={highlightVisibility !== 'none' ? filteredHighlights : []}
                        activeHighlightId={activeHighlightId}
                        hoveredHighlightId={hoveredHighlightId}
                        isLoading={false}
                        onHighlightClick={handleDocumentHighlightClick}
                        onHighlightHover={handleHighlightHover}
                    />
                </div>

                {/* Summary Panel (Right Panel) */}
                <div className="w-[400px] xl:w-[480px] bg-white border border-border rounded-lg overflow-hidden flex flex-col">
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
