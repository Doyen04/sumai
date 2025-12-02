import { useState, useCallback, useRef } from 'react';
import type { UploadState, Document, DocumentType } from '@/types';
import { validateFile, generateFileId, getDocumentType } from '@/utils';

interface UseFileUploadOptions {
    onUploadComplete?: (document: Document) => void;
    onUploadError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
    const { onUploadComplete, onUploadError } = options;
    const [state, setState] = useState<UploadState>({
        isDragging: false,
        progress: 0,
        error: undefined,
        file: undefined,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const resetState = useCallback(() => {
        setState({
            isDragging: false,
            progress: 0,
            error: undefined,
            file: undefined,
        });
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: true }));
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: false }));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const processFile = useCallback(async (file: File) => {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setState(prev => ({ ...prev, error: validation.error }));
            onUploadError?.(validation.error!);
            return;
        }

        setState(prev => ({
            ...prev,
            file,
            error: undefined,
            progress: 0,
        }));

        // Simulate upload progress
        abortControllerRef.current = new AbortController();

        try {
            // Simulated upload with progress
            for (let i = 0; i <= 100; i += 10) {
                if (abortControllerRef.current.signal.aborted) {
                    throw new Error('Upload cancelled');
                }
                await new Promise(resolve => setTimeout(resolve, 100));
                setState(prev => ({ ...prev, progress: i }));
            }

            // Create document object
            const document: Document = {
                id: generateFileId(),
                name: file.name,
                type: getDocumentType(file.name) as DocumentType,
                size: file.size,
                pageCount: Math.ceil(file.size / 3000), // Rough estimate
                uploadedAt: new Date(),
                status: 'completed',
            };

            onUploadComplete?.(document);
            setState(prev => ({ ...prev, progress: 100 }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setState(prev => ({ ...prev, error: errorMessage }));
            onUploadError?.(errorMessage);
        }
    }, [onUploadComplete, onUploadError]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: false }));

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const cancelUpload = useCallback(() => {
        abortControllerRef.current?.abort();
        resetState();
    }, [resetState]);

    return {
        state,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
        cancelUpload,
        resetState,
    };
}
