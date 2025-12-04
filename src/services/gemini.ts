import { GoogleGenAI, Type } from '@google/genai';
import type { Summary, SummaryLength, SummarySection, Highlight, HighlightColorIndex } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
 * Generate a summary using Gemini API with native file support and structured output
 */
export async function generateSummaryWithGemini(
    fileData: { base64: string; mimeType: string; textContent?: string },
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
- Core concepts that would appear in an exam`,
        balanced: `Create a comprehensive summary with 15-20 key points covering:
- ALL major topics, sections, and themes
- Important definitions, formulas, and terminology
- Key facts, statistics, dates, names, and events
- Cause-effect relationships and processes
- Examples and case studies mentioned
- Conclusions and main arguments`,
        detailed: `Create an exhaustive summary with 25-35 key points covering:
- EVERY topic, section, subtopic, and theme in the document
- ALL definitions, formulas, terminology, and technical terms
- ALL facts, figures, statistics, dates, names, and events
- Detailed processes, steps, and procedures
- Cause-effect relationships and their explanations
- ALL examples, case studies, and illustrations
- Arguments, counterarguments, and conclusions
- Any lists, classifications, or categorizations
- Exceptions, edge cases, and important notes`,
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

STRUCTURE YOUR SUMMARY:
1. Start with document overview/purpose
2. Cover each major section/topic with its key details
3. Include important supporting details and examples
4. End with conclusions/key takeaways

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
        // Build contents array with text prompt and file data
        const contents: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
            { text: prompt }
        ];

        // Gemini only supports PDF for inlineData, other formats need text extraction
        const supportedInlineTypes = ['application/pdf'];

        if (supportedInlineTypes.includes(fileData.mimeType)) {
            // Use inlineData for PDFs
            contents.push({
                inlineData: {
                    mimeType: fileData.mimeType,
                    data: fileData.base64
                }
            });
        } else if (fileData.textContent) {
            // For DOCX, TXT, PPTX - use extracted text content
            contents.push({ text: `\n\nDocument content:\n---\n${fileData.textContent}\n---` });
        } else {
            throw new Error('No content available for summarization');
        }

        // Use gemini-2.5-flash for better free tier limits
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: summaryResponseSchema,
            },
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error('Invalid response from Gemini API');
        }

        // Parse the structured JSON response
        const parsed: ParsedSummary = JSON.parse(responseText);

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
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Process a file for Gemini - converts to base64 and extracts text for display
 */
export async function processFileForGemini(file: File): Promise<{
    base64: string;
    mimeType: string;
    textContent: string;
}> {
    const mimeType = getMimeType(file.name);
    const base64 = await fileToBase64(file);

    // For text files, also get the text content for display
    let textContent = '';
    if (mimeType === 'text/plain') {
        textContent = await file.text();
    } else {
        // For binary files, we'll extract text for display purposes
        textContent = await extractTextForDisplay(file);
    }

    return { base64, mimeType, textContent };
}

/**
 * Extract text from a file for display in the document viewer
 */
async function extractTextForDisplay(file: File): Promise<string> {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'txt') {
        return await file.text();
    }

    if (fileType === 'pdf') {
        return await parsePdfFile(file);
    }

    if (fileType === 'docx') {
        return await parseDocxFile(file);
    }

    // For unsupported types, return a placeholder
    return `[Document: ${file.name}]\n\nThis document type is being processed by Gemini AI for summarization.`;
}

/**
 * Parse PDF file to text using pdf.js (for display purposes)
 */
async function parsePdfFile(file: File): Promise<string> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item) => {
                    if ('str' in item) {
                        return (item as { str: string }).str;
                    }
                    return '';
                })
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText || `[PDF Document: ${file.name}]`;
    } catch (error) {
        console.error('PDF parsing error:', error);
        return `[PDF Document: ${file.name}]\n\nUnable to extract text preview. The document will still be processed by Gemini AI.`;
    }
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
