import type { Document, Summary, UserSettings, ExportFormat, SummaryLength } from '@/types';
import { processFileForGemini, generateSummaryWithGemini } from './gemini';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory document storage (in production, this would be a database)
const documentStore = new Map<string, {
    document: Document;
    fileData: { base64: string; mimeType: string; textContent: string };
}>();

/**
 * Upload a document to the server
 */
export async function uploadDocument(file: File): Promise<Document> {
    try {
        // Process file for Gemini (get base64, mimeType, and text for display)
        const fileData = await processFileForGemini(file);

        // Estimate page count based on content length (roughly 3000 chars per page)
        const estimatedPages = Math.max(1, Math.ceil(fileData.textContent.length / 3000));

        const document: Document = {
            id: `doc_${Date.now()}`,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() as Document['type'],
            size: file.size,
            pageCount: estimatedPages,
            uploadedAt: new Date(),
            status: 'completed',
            content: fileData.textContent,
        };

        // Store document with file data for Gemini
        documentStore.set(document.id, { document, fileData });

        return document;
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
}

/**
 * Get document content by ID
 */
export function getDocumentContent(documentId: string): string | null {
    const stored = documentStore.get(documentId);
    return stored?.document.content ?? null;
}

/**
 * Get document file data by ID (for Gemini)
 */
export function getDocumentFileData(documentId: string): { base64: string; mimeType: string; textContent: string } | null {
    const stored = documentStore.get(documentId);
    return stored?.fileData ?? null;
}

/**
 * Generate summary for a document using Gemini API
 */
export async function generateSummary(
    documentId: string,
    length: SummaryLength = 'balanced'
): Promise<Summary> {
    // Get the document file data
    const fileData = getDocumentFileData(documentId);

    if (!fileData) {
        throw new Error(`Document ${documentId} not found or has no content`);
    }

    // Generate summary using Gemini with native file support
    const summary = await generateSummaryWithGemini(fileData, documentId, length);

    // Update the stored document with the summary
    const stored = documentStore.get(documentId);
    if (stored) {
        stored.document.summary = summary;
    }

    return summary;
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
    await delay(100);
    documentStore.delete(documentId);
}

/**
 * Get a document by ID
 */
export async function getDocument(documentId: string): Promise<Document | null> {
    await delay(50);
    const stored = documentStore.get(documentId);
    return stored?.document ?? null;
}

/**
 * Get all documents
 */
export async function getDocuments(): Promise<Document[]> {
    await delay(100);

    // Return documents from the store
    const documents: Document[] = [];
    documentStore.forEach(({ document }) => {
        documents.push(document);
    });

    // Sort by upload date (newest first)
    documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return documents;
}
