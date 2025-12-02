// Application Constants

// Supported file types
export const SUPPORTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
} as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.pptx'] as const;

export const FILE_TYPE_LABELS: Record<string, string> = {
    pdf: 'PDF Document',
    docx: 'Word Document',
    txt: 'Text File',
    pptx: 'PowerPoint',
};

// File size limits
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILE_SIZE_LABEL = '50MB';

// Summary lengths
export const SUMMARY_LENGTH_OPTIONS = [
    { value: 'short', label: 'Short', description: 'Quick overview, key points only' },
    { value: 'balanced', label: 'Balanced', description: 'Comprehensive yet concise' },
    { value: 'detailed', label: 'Detailed', description: 'In-depth analysis with context' },
] as const;

// Highlight colors - matching CSS variables
export const HIGHLIGHT_COLORS = [
    { index: 1, name: 'Amber', base: '#fef3c7', active: '#fde68a' },
    { index: 2, name: 'Blue', base: '#dbeafe', active: '#bfdbfe' },
    { index: 3, name: 'Green', base: '#dcfce7', active: '#bbf7d0' },
    { index: 4, name: 'Pink', base: '#fce7f3', active: '#fbcfe8' },
    { index: 5, name: 'Indigo', base: '#e0e7ff', active: '#c7d2fe' },
] as const;

// Navigation items
export const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/documents', label: 'Documents', icon: 'FileText' },
    { path: '/settings', label: 'Settings', icon: 'Settings' },
    { path: '/help', label: 'Help', icon: 'HelpCircle' },
] as const;

// Confidence level indicators
export const CONFIDENCE_LABELS = {
    low: { label: 'Low confidence', color: 'text-warning' },
    medium: { label: 'Medium confidence', color: 'text-muted' },
    high: { label: 'High confidence', color: 'text-success' },
} as const;

// Export format options
export const EXPORT_FORMAT_OPTIONS = [
    { value: 'pdf', label: 'PDF', icon: 'FileText' },
    { value: 'docx', label: 'Word', icon: 'FileText' },
    { value: 'pptx', label: 'PowerPoint', icon: 'Presentation' },
] as const;

// Text size options
export const TEXT_SIZE_OPTIONS = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
] as const;

// Line spacing options
export const LINE_SPACING_OPTIONS = [
    { value: 'compact', label: 'Compact', multiplier: 1.4 },
    { value: 'normal', label: 'Normal', multiplier: 1.6 },
    { value: 'relaxed', label: 'Relaxed', multiplier: 1.8 },
] as const;

// API endpoints (placeholder)
export const API_ENDPOINTS = {
    upload: '/api/documents/upload',
    summarize: '/api/documents/summarize',
    export: '/api/documents/export',
    documents: '/api/documents',
    settings: '/api/settings',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    settings: 'sumai_settings',
    documents: 'sumai_documents',
    recentFiles: 'sumai_recent',
} as const;

// Animation durations (ms)
export const ANIMATION = {
    fast: 150,
    normal: 200,
    slow: 300,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;
