import { GoogleGenAI, Type } from '@google/genai';
import { PDFDocument } from 'pdf-lib';
import type { Summary, SummaryLength, SummarySection, Highlight, HighlightColorIndex } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Maximum pages per chunk (Gemini limit is 1000)
const MAX_PAGES_PER_CHUNK = 500;

// Initialize the Gemini client
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Define the response schema for Gemini structured output
const summaryResponseSchema = {
    type: Type.OBJECT,
    properties: {
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        enum: ['heading', 'paragraph', 'bullet', 'key-concept'],
                        description: 'The type of section',
                    },
                    content: {
                        type: Type.STRING,
                        description: 'The summary content for this section',
                    },
                    sourceText: {
                        type: Type.STRING,
                        description: 'EXACT verbatim quote copied from the document (10-50 words)',
                    },
                    startIndex: {
                        type: Type.NUMBER,
                        description: 'Character index where sourceText starts in the document (0-based)',
                    },
                    endIndex: {
                        type: Type.NUMBER,
                        description: 'Character index where sourceText ends in the document',
                    },
                },
                required: ['type', 'content'],
            },
            description: 'Array of summary sections',
        },
    },
    required: ['sections'],
};

interface ParsedSummary {
    sections: Array<{
        type: 'heading' | 'paragraph' | 'bullet' | 'key-concept';
        content: string;
        sourceText?: string;
        startIndex?: number;
        endIndex?: number;
    }>;
}

// Map file extensions to MIME types
const MIME_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
};

/**
 * Convert a File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Get MIME type from file extension
 */
function getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Convert Uint8Array to base64 string (memory efficient for large files)
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
    // Process in chunks to avoid stack overflow
    const chunkSize = 0x8000; // 32KB chunks
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return btoa(binary);
}

/**
 * Split a PDF into chunks of MAX_PAGES_PER_CHUNK pages each
 */
async function splitPdfIntoChunks(base64Pdf: string): Promise<{ chunks: string[]; totalPages: number }> {
    // Decode base64 to bytes
    const binaryString = atob(base64Pdf);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    try {
        // Load the PDF with lenient parsing options
        const pdfDoc = await PDFDocument.load(bytes, {
            ignoreEncryption: true,
            updateMetadata: false,
        });

        // Use getPages().length as shown in the example
        const totalPages = pdfDoc.getPages().length;

        // If small enough, return as single chunk
        if (totalPages <= MAX_PAGES_PER_CHUNK) {
            return { chunks: [base64Pdf], totalPages };
        }

        console.log(`Splitting PDF with ${totalPages} pages into chunks of ${MAX_PAGES_PER_CHUNK}...`);

        const chunks: string[] = [];
        let startPage = 0;

        while (startPage < totalPages) {
            const endPage = Math.min(startPage + MAX_PAGES_PER_CHUNK, totalPages);
            const numPages = endPage - startPage;

            // Create a new PDF with just this chunk's pages
            const chunkPdf = await PDFDocument.create();
            const pageIndices = Array.from({ length: numPages }, (_, i) => startPage + i);
            const copiedPages = await chunkPdf.copyPages(pdfDoc, pageIndices);

            // Add each page to the new document
            copiedPages.forEach(page => chunkPdf.addPage(page));

            // Convert chunk to base64 using memory-efficient method
            const chunkBytes = await chunkPdf.save();
            const chunkBase64 = uint8ArrayToBase64(chunkBytes);
            chunks.push(chunkBase64);

            console.log(`Created chunk ${chunks.length}: pages ${startPage + 1}-${endPage}`);
            startPage = endPage;
        }

        return { chunks, totalPages };
    } catch (error) {
        console.warn('PDF splitting failed, will send as single chunk:', error);
        // If splitting fails, return original as single chunk
        // Gemini will return an error if it's too large
        return { chunks: [base64Pdf], totalPages: -1 };
    }
}

/**
 * Process a single PDF chunk and return parsed sections
 */
async function processPdfChunk(
    base64Chunk: string,
    chunkIndex: number,
    totalChunks: number,
    length: SummaryLength
): Promise<ParsedSummary> {
    const lengthInstructions = {
        short: `Create a focused summary with 4-6 key points for this section.`,
        balanced: `Create a comprehensive summary with 8-12 key points for this section.`,
        detailed: `Create an exhaustive summary with 15-20 key points for this section.`,
    };

    const prompt = `You are summarizing PART ${chunkIndex + 1} of ${totalChunks} of a large document.

${lengthInstructions[length]}

IMPORTANT: This is only a portion of the full document. Focus on the content in this section.
- Extract and include data from ALL tables, charts, and diagrams in this section
- For tables: include key rows, columns, and notable values
- For charts/graphs: describe trends, peaks, comparisons

For each point, provide:
- type: "heading", "paragraph", "bullet", or "key-concept"
- content: Your summary of this point
- sourceText: An EXACT quote from this section (15-60 words)

Section types:
- "heading": Section/topic titles (no sourceText needed)
- "key-concept": Critical definitions, main ideas
- "bullet": Important facts, details, steps, table data
- "paragraph": Explanations, examples, context`;

    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { text: prompt },
            { inlineData: { mimeType: 'application/pdf', data: base64Chunk } }
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: summaryResponseSchema,
        },
    });

    if (!response?.text) {
        throw new Error(`No response for chunk ${chunkIndex + 1}`);
    }

    return JSON.parse(response.text) as ParsedSummary;
}

/**
 * Generate a summary using Gemini API with native file support and structured output
 */
export async function generateSummaryWithGemini(
    fileData: { base64: string; mimeType: string; textContent?: string; plainText?: string },
    documentId: string,
    length: SummaryLength = 'balanced'
): Promise<Summary> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const lengthInstructions = {
        short: `Create a focused summary with 8-12 key points covering:
- All main topics/chapters/sections mentioned
- Key definitions and terminology
- Critical facts, figures, dates, and names
- Core concepts that would appear in an exam
- Key data from any tables or charts`,
        balanced: `Create a comprehensive summary with 15-20 key points covering:
- ALL major topics, sections, and themes
- Important definitions, formulas, and terminology
- Key facts, statistics, dates, names, and events
- Cause-effect relationships and processes
- Examples and case studies mentioned
- Conclusions and main arguments
- Important data from tables, charts, and diagrams`,
        detailed: `Create an exhaustive summary with 25-35 key points covering:
- EVERY topic, section, subtopic, and theme in the document
- ALL definitions, formulas, terminology, and technical terms
- ALL facts, figures, statistics, dates, names, and events
- Detailed processes, steps, and procedures
- Cause-effect relationships and their explanations
- ALL examples, case studies, and illustrations
- Arguments, counterarguments, and conclusions
- Any lists, classifications, or categorizations
- Exceptions, edge cases, and important notes
- ALL data from tables, charts, graphs, and diagrams (include specific values)`,
    };

    const prompt = `You are an expert study guide creator. Your goal is to create a summary so comprehensive that someone reading ONLY your summary could answer 70-80% of any questions about this document.

${lengthInstructions[length]}

COVERAGE REQUIREMENTS:
- Scan the ENTIRE document from beginning to end
- Do NOT skip any section, chapter, or topic
- Include information from ALL parts: introduction, body, conclusion, any appendices
- Capture specific details: names, dates, numbers, percentages, formulas
- Include "who, what, when, where, why, how" for key events/concepts
- Note any lists, steps, categories, or classifications completely
- IMPORTANT: Extract and include data from ALL tables, charts, and diagrams
  - For tables: include key rows, columns, and notable values
  - For charts/graphs: describe trends, peaks, comparisons
  - For diagrams: explain the relationships or processes shown

STRUCTURE YOUR SUMMARY:
1. Start with document overview/purpose
2. Cover each major section/topic with its key details
3. Include important supporting details and examples
4. Include table/chart data where relevant
5. End with conclusions/key takeaways

FOR EACH POINT (except headings), you MUST provide:
- sourceText: An EXACT, VERBATIM quote (15-60 words) copied character-for-character
- startIndex: Character position (0-based) where quote STARTS
- endIndex: Character position where quote ENDS

RULES:
- sourceText must be EXACTLY as it appears - same punctuation, capitalization, spacing
- Spread quotes throughout the document (beginning, middle, end sections)
- Include quotes that contain specific facts, definitions, or key statements

Section types:
- "heading": Section/topic titles (no sourceText needed)
- "key-concept": Critical definitions, main ideas (MUST include sourceText + indices)
- "bullet": Important facts, details, steps (MUST include sourceText + indices)  
- "paragraph": Explanations, examples, context (MUST include sourceText + indices)`;

    try {
        let parsed: ParsedSummary;

        // For PDFs, check if we need to split into chunks
        if (fileData.mimeType === 'application/pdf') {
            const { chunks, totalPages } = await splitPdfIntoChunks(fileData.base64);

            if (chunks.length === 1) {
                // Single chunk - process normally
                console.log(`Processing PDF with ${totalPages} pages...`);
                const response = await genAI.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        { text: prompt },
                        { inlineData: { mimeType: 'application/pdf', data: fileData.base64 } }
                    ],
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: summaryResponseSchema,
                    },
                });

                if (!response?.text) {
                    throw new Error('No response from Gemini API');
                }
                parsed = JSON.parse(response.text);
            } else {
                // Multiple chunks - process each and merge
                console.log(`Processing ${chunks.length} chunks for ${totalPages} page PDF...`);
                const allSections: ParsedSummary['sections'] = [];

                for (let i = 0; i < chunks.length; i++) {
                    console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
                    const chunkResult = await processPdfChunk(chunks[i], i, chunks.length, length);
                    allSections.push(...chunkResult.sections);
                }

                parsed = { sections: allSections };
                console.log(`Merged ${allSections.length} sections from ${chunks.length} chunks`);
            }
        } else if (fileData.plainText || fileData.textContent) {
            // For DOCX, TXT, PPTX - use plain text for Gemini (not HTML)
            const textForGemini = fileData.plainText || fileData.textContent;
            console.log('Processing text document...');

            const response = await genAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { text: prompt },
                    { text: `\n\nDocument content:\n---\n${textForGemini}\n---` }
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: summaryResponseSchema,
                },
            });

            if (!response?.text) {
                throw new Error('No response from Gemini API');
            }
            parsed = JSON.parse(response.text);
        } else {
            throw new Error('No content available for summarization');
        }

        console.log('Gemini API response received');

        // Convert to our Summary format
        const sections: SummarySection[] = [];
        const highlights: Highlight[] = [];
        let highlightIndex = 0;

        // Helper to get valid color index (1-5)
        const getColorIndex = (index: number): HighlightColorIndex => {
            const idx = ((index - 1) % 5) + 1;
            return idx as HighlightColorIndex;
        };

        for (let i = 0; i < parsed.sections.length; i++) {
            const section = parsed.sections[i];
            const sectionId = `s${i + 1}`;

            const summarySection: SummarySection = {
                id: sectionId,
                type: section.type,
                content: section.content,
                confidence: 'high',
            };

            // Create highlight for sections with source text and position info
            if (section.sourceText && section.type !== 'heading') {
                highlightIndex++;
                const highlightId = `h${highlightIndex}`;
                summarySection.highlightId = highlightId;

                // Use character indices from Gemini for precise positioning
                const startIdx = section.startIndex ?? 0;
                const endIdx = section.endIndex ?? (startIdx + section.sourceText.length);

                highlights.push({
                    id: highlightId,
                    summaryLineId: sectionId,
                    documentParagraphId: `p-${highlightIndex}`,
                    colorIndex: getColorIndex(highlightIndex),
                    sourceText: section.sourceText,
                    sourceLocation: {
                        page: 1,
                        paragraph: highlightIndex,
                        startOffset: startIdx,
                        endOffset: endIdx,
                    },
                });
            }

            sections.push(summarySection);
        }

        return {
            id: `sum_${Date.now()}`,
            documentId,
            length,
            generatedAt: new Date(),
            content: sections,
            highlights,
        };
    } catch (error: unknown) {
        console.error('Gemini API error:', error);

        // Try to extract the message from Gemini API error response
        const errorObj = error as { message?: string };
        const errorMessage = errorObj?.message || String(error);

        // Try to parse JSON error message from API
        try {
            const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed?.error?.message) {
                    throw new Error(parsed.error.message);
                }
            }
        } catch {
            // Not JSON, use original message
        }

        throw new Error(errorMessage);
    }
}

/**
 * Process a file for Gemini - converts to base64 and extracts text/HTML for display
 */
export async function processFileForGemini(file: File): Promise<{
    base64: string;
    mimeType: string;
    textContent: string;
    plainText: string;
    contentType: 'text' | 'html' | 'pdf';
}> {
    const mimeType = getMimeType(file.name);
    const base64 = await fileToBase64(file);
    const fileType = file.name.split('.').pop()?.toLowerCase();

    // For PDF files, Gemini can read them natively via inlineData
    // No text extraction needed - the PDF is sent directly to Gemini
    if (fileType === 'pdf') {
        return { base64, mimeType, textContent: '', plainText: '', contentType: 'pdf' };
    }

    // For text files, get plain text
    if (mimeType === 'text/plain') {
        const textContent = await file.text();
        return { base64, mimeType, textContent, plainText: textContent, contentType: 'text' };
    }

    // For DOCX, get HTML to preserve formatting for display, and plain text for Gemini
    if (fileType === 'docx') {
        const htmlContent = await parseDocxFileAsHtml(file);
        const plainText = await parseDocxFile(file);
        return { base64, mimeType, textContent: htmlContent, plainText, contentType: 'html' };
    }

    // For other files, extract text
    const textContent = await extractTextForDisplay(file);
    return { base64, mimeType, textContent, plainText: textContent, contentType: 'text' };
}

/**
 * Extract text from a file for display in the document viewer
 */
async function extractTextForDisplay(file: File): Promise<string> {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'txt') {
        return await file.text();
    }

    if (fileType === 'docx') {
        return await parseDocxFile(file);
    }

    // For unsupported types, return a placeholder
    return `[Document: ${file.name}]\n\nThis document type is being processed by Gemini AI for summarization.`;
}

/**
 * Parse DOCX file to text using mammoth (for display purposes)
 */
async function parseDocxFile(file: File): Promise<string> {
    try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || `[DOCX Document: ${file.name}]`;
    } catch (error) {
        console.error('DOCX parsing error:', error);
        return `[DOCX Document: ${file.name}]\n\nUnable to extract text preview. The document will still be processed by Gemini AI.`;
    }
}

/**
 * Parse DOCX file to HTML using mammoth (preserves formatting)
 */
async function parseDocxFileAsHtml(file: File): Promise<string> {
    try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return result.value || `<p>[DOCX Document: ${file.name}]</p>`;
    } catch (error) {
        console.error('DOCX HTML parsing error:', error);
        return `<p>[DOCX Document: ${file.name}]</p><p>Unable to extract formatted preview.</p>`;
    }
}
