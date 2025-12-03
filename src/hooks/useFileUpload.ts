import { useState, useCallback, useRef } from 'react';
import type { UploadState, Document } from '@/types';
import { validateFile } from '@/utils';
import { uploadDocument } from '@/services/api';

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

        abortControllerRef.current = new AbortController();

        try {
            // Show initial progress
            setState(prev => ({ ...prev, progress: 10 }));

            // Upload and extract text from the file
            const document = await uploadDocument(file);

            // Show progress updates
            setState(prev => ({ ...prev, progress: 90 }));

            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 200));
            setState(prev => ({ ...prev, progress: 100 }));

            onUploadComplete?.(document);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setState(prev => ({ ...prev, error: errorMessage, progress: 0 }));
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
