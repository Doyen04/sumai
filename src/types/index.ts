// Application-wide type definitions

// Document Types
export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    size: number;
    pageCount: number;
    uploadedAt: Date;
    content?: string;
    contentType?: 'text' | 'html' | 'pdf';
    pdfData?: string; // Base64 encoded PDF for native rendering
    summary?: Summary;
    status: DocumentStatus;
}

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'pptx';

export type DocumentStatus =
    | 'uploading'
    | 'processing'
    | 'summarizing'
    | 'completed'
    | 'error';

// Summary Types
export interface Summary {
    id: string;
    documentId: string;
    content: SummarySection[];
    generatedAt: Date;
    length: SummaryLength;
    highlights: Highlight[];
}

export interface SummarySection {
    id: string;
    type: 'heading' | 'paragraph' | 'bullet' | 'key-concept';
    content: string;
    highlightId?: string;
    confidence: ConfidenceLevel;
}

export type SummaryLength = 'short' | 'balanced' | 'detailed';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

// Highlight Types
export interface Highlight {
    id: string;
    summaryLineId: string;
    documentParagraphId: string;
    colorIndex: HighlightColorIndex;
    sourceText: string;
    sourceLocation: {
        page: number;
        paragraph: number;
        startOffset: number;
        endOffset: number;
    };
}

export type HighlightColorIndex = 1 | 2 | 3 | 4 | 5;

export type HighlightVisibility = 'all' | 'key' | 'none';

// Filter Types
export interface HighlightFilter {
    importance: 'all' | 'high' | 'medium' | 'low';
    keyword?: string;
    section?: string;
}

// Export Types
export type ExportFormat = 'pdf' | 'docx' | 'pptx';

export interface ExportOptions {
    format: ExportFormat;
    includeHighlights: boolean;
    includeSummary: boolean;
    includeOriginal: boolean;
}

// Settings Types
export interface UserSettings {
    defaultSummaryLength: SummaryLength;
    defaultExportFormat: ExportFormat;
    highlightIntensity: number; // 0-100
    theme: 'light' | 'dark' | 'system';
    textSize: 'small' | 'medium' | 'large';
    lineSpacing: 'compact' | 'normal' | 'relaxed';
}

// UI State Types
export interface UploadState {
    isDragging: boolean;
    progress: number;
    error?: string;
    file?: File;
}

export interface ViewerState {
    activeHighlightId: string | null;
    scrollPosition: number;
    zoom: number;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    status: 'success' | 'error' | 'loading';
}

export interface ApiError {
    code: string;
    message: string;
    details?: string;
}

// Component Props Types
export interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ButtonVariant {
    variant: 'primary' | 'secondary' | 'ghost' | 'danger';
    size: 'sm' | 'md' | 'lg';
}
