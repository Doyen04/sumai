import { useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { cn } from '@/utils';
import { Button, ProgressBar, Alert } from '@/components/ui';
import { useFileUpload } from '@/hooks';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_LABEL } from '@/constants';
import type { Document } from '@/types';

interface UploadZoneProps {
    onUploadComplete: (document: Document) => void;
    className?: string;
}

export function UploadZone({ onUploadComplete, className }: UploadZoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        state,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleFileSelect,
        resetState,
    } = useFileUpload({
        onUploadComplete: (doc) => {
            onUploadComplete(doc);
            setTimeout(resetState, 1500);
        },
    });

    const { isDragging, progress, error, file } = state;
    const isUploading = progress > 0 && progress < 100;

    return (
        <div className={cn('w-full', className)}>
            {/* Drop Zone */}
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-8',
                    'flex flex-col items-center justify-center',
                    'cursor-pointer transition-all duration-200',
                    'min-h-[200px]',
                    isDragging
                        ? 'border-accent bg-accent-light'
                        : 'border-border hover:border-accent hover:bg-surface-hover',
                    error && 'border-error bg-error-light'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={SUPPORTED_EXTENSIONS.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {isUploading ? (
                    // Upload Progress
                    <div className="w-full max-w-xs text-center">
                        <File className="w-12 h-12 text-accent mx-auto mb-4" />
                        <p className="text-sm font-medium text-foreground mb-2">
                            {file?.name}
                        </p>
                        <ProgressBar value={progress} showLabel className="mb-2" />
                        <p className="text-xs text-muted">Uploading...</p>
                    </div>
                ) : (
                    // Default State
                    <>
                        <div
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                                isDragging ? 'bg-accent/10' : 'bg-surface'
                            )}
                        >
                            <Upload
                                className={cn(
                                    'w-7 h-7',
                                    isDragging ? 'text-accent' : 'text-muted'
                                )}
                            />
                        </div>
                        <p className="text-base font-medium text-foreground mb-1">
                            {isDragging ? 'Drop file here' : 'Drag and drop your document'}
                        </p>
                        <p className="text-sm text-muted mb-4">
                            or click to browse files
                        </p>
                        <Button variant="secondary" size="sm" tabIndex={-1}>
                            Select File
                        </Button>
                    </>
                )}
            </div>

            {/* Supported Formats */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted">
                <span>Supported: PDF, Word, TXT, PowerPoint</span>
                <span className="w-px h-3 bg-border" />
                <span>Max size: {MAX_FILE_SIZE_LABEL}</span>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="error" className="mt-4" onClose={resetState}>
                    {error}
                </Alert>
            )}
        </div>
    );
}
