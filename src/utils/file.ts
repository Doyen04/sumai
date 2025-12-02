import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants';
import type { DocumentType } from '@/types';

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(ext as typeof SUPPORTED_EXTENSIONS[number]);
}

/**
 * Check if file size is within limits
 */
export function isFileSizeValid(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}

/**
 * Get document type from file extension
 */
export function getDocumentType(filename: string): DocumentType | null {
    const ext = getFileExtension(filename);
    const typeMap: Record<string, DocumentType> = {
        '.pdf': 'pdf',
        '.docx': 'docx',
        '.txt': 'txt',
        '.pptx': 'pptx',
    };
    return typeMap[ext] || null;
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    if (!isFileTypeSupported(file.name)) {
        return {
            valid: false,
            error: `File type not supported. Please upload PDF, Word, TXT, or PowerPoint files.`,
        };
    }

    if (!isFileSizeValid(file.size)) {
        return {
            valid: false,
            error: `File size exceeds the maximum limit of 50MB.`,
        };
    }

    return { valid: true };
}

/**
 * Generate unique file ID
 */
export function generateFileId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file icon name based on type
 */
export function getFileIcon(type: DocumentType): string {
    const iconMap: Record<DocumentType, string> = {
        pdf: 'FileText',
        docx: 'FileText',
        txt: 'FileText',
        pptx: 'Presentation',
    };
    return iconMap[type] || 'File';
}
