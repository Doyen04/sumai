import type { Document, Summary, UserSettings, ExportFormat } from '@/types';


// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Upload a document to the server
 */
export async function uploadDocument(file: File): Promise<Document> {
    // Simulate upload delay
    await delay(1500);

    // In production, this would make an API call
    return {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.split('.').pop() as Document['type'],
        size: file.size,
        pageCount: Math.ceil(file.size / 3000),
        uploadedAt: new Date(),
        status: 'completed',
    };
}

/**
 * Generate summary for a document
 */
export async function generateSummary(
    documentId: string,
    length: 'short' | 'balanced' | 'detailed' = 'balanced'
): Promise<Summary> {
    // Simulate processing delay
    await delay(2000);

    // Mock summary data
    return {
        id: `sum_${Date.now()}`,
        documentId,
        length,
        generatedAt: new Date(),
        content: [
            {
                id: 's1',
                type: 'heading',
                content: 'Executive Summary',
                confidence: 'high',
            },
            {
                id: 's2',
                type: 'key-concept',
                content: 'This document outlines the key strategies for digital transformation in enterprise environments.',
                highlightId: 'h1',
                confidence: 'high',
            },
            {
                id: 's3',
                type: 'heading',
                content: 'Key Findings',
                confidence: 'high',
            },
            {
                id: 's4',
                type: 'bullet',
                content: 'Organizations that prioritize digital transformation see 23% higher revenue growth.',
                highlightId: 'h2',
                confidence: 'high',
            },
            {
                id: 's5',
                type: 'bullet',
                content: 'Cloud adoption remains the primary driver of transformation initiatives.',
                highlightId: 'h3',
                confidence: 'medium',
            },
            {
                id: 's6',
                type: 'bullet',
                content: 'Employee training and change management are critical success factors.',
                highlightId: 'h4',
                confidence: 'medium',
            },
            {
                id: 's7',
                type: 'paragraph',
                content: 'The research indicates that successful digital transformation requires a holistic approach combining technology, process improvement, and cultural change.',
                highlightId: 'h5',
                confidence: 'high',
            },
        ],
        highlights: [
            {
                id: 'h1',
                summaryLineId: 's2',
                documentParagraphId: 'p-0',
                colorIndex: 1,
                sourceText: 'Digital transformation strategies...',
                sourceLocation: { page: 1, paragraph: 1, startOffset: 0, endOffset: 150 },
            },
            {
                id: 'h2',
                summaryLineId: 's4',
                documentParagraphId: 'p-2',
                colorIndex: 2,
                sourceText: 'Revenue growth statistics...',
                sourceLocation: { page: 2, paragraph: 3, startOffset: 0, endOffset: 200 },
            },
            {
                id: 'h3',
                summaryLineId: 's5',
                documentParagraphId: 'p-4',
                colorIndex: 3,
                sourceText: 'Cloud adoption trends...',
                sourceLocation: { page: 3, paragraph: 1, startOffset: 0, endOffset: 175 },
            },
            {
                id: 'h4',
                summaryLineId: 's6',
                documentParagraphId: 'p-5',
                colorIndex: 4,
                sourceText: 'Training requirements...',
                sourceLocation: { page: 4, paragraph: 2, startOffset: 0, endOffset: 180 },
            },
            {
                id: 'h5',
                summaryLineId: 's7',
                documentParagraphId: 'p-7',
                colorIndex: 5,
                sourceText: 'Holistic approach details...',
                sourceLocation: { page: 5, paragraph: 1, startOffset: 0, endOffset: 220 },
            },
        ],
    };
}

/**
 * Export document with summary
 */
export async function exportDocument(
    ...[/* documentId */, /* format */]: [string, ExportFormat]
): Promise<Blob> {
    await delay(1000);

    // In production, this would return the actual file
    return new Blob(['Export content'], { type: 'application/octet-stream' });
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
    await delay(300);

    return {
        defaultSummaryLength: 'balanced',
        defaultExportFormat: 'pdf',
        highlightIntensity: 70,
        theme: 'light',
        textSize: 'medium',
        lineSpacing: 'normal',
    };
}

/**
 * Update user settings
 */
export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await delay(300);

    // In production, this would persist to the server
    return {
        defaultSummaryLength: 'balanced',
        defaultExportFormat: 'pdf',
        highlightIntensity: 70,
        theme: 'light',
        textSize: 'medium',
        lineSpacing: 'normal',
        ...settings,
    };
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
    await delay(500);
    // In production, this would delete from the server
    console.debug('Delete document:', documentId);
}

/**
 * Get all documents
 */
export async function getDocuments(): Promise<Document[]> {
    await delay(500);

    // Return mock data
    return [
        {
            id: 'doc_1',
            name: 'Q4 Financial Report.pdf',
            type: 'pdf',
            size: 2456789,
            pageCount: 24,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'completed',
        },
        {
            id: 'doc_2',
            name: 'Product Strategy 2024.docx',
            type: 'docx',
            size: 1234567,
            pageCount: 15,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            status: 'completed',
        },
        {
            id: 'doc_3',
            name: 'Meeting Notes.txt',
            type: 'txt',
            size: 45678,
            pageCount: 3,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            status: 'completed',
        },
    ];
}
