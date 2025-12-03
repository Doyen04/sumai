import type { Summary, SummaryLength, SummarySection, Highlight, HighlightColorIndex } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

interface ParsedSummary {
    sections: Array<{
        type: 'heading' | 'paragraph' | 'bullet' | 'key-concept';
        content: string;
        sourceText?: string;
    }>;
}

/**
 * Generate a summary using Gemini API
 */
export async function generateSummaryWithGemini(
    documentContent: string,
    documentId: string,
    length: SummaryLength = 'balanced'
): Promise<Summary> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const lengthInstructions = {
        short: 'Create a very concise summary with only 3-5 key points. Be brief and focus on the most critical information.',
        balanced: 'Create a balanced summary with 5-8 key points. Include main ideas and important details.',
        detailed: 'Create a comprehensive summary with 8-12 points. Include main ideas, supporting details, and nuances.',
    };

    const prompt = `You are a document summarization expert. Analyze the following document and create a structured summary.

${lengthInstructions[length]}

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
    "sections": [
        {"type": "heading", "content": "Main Topic Title"},
        {"type": "key-concept", "content": "Most important concept from the document", "sourceText": "exact quote from document"},
        {"type": "heading", "content": "Key Findings"},
        {"type": "bullet", "content": "First key point", "sourceText": "relevant quote"},
        {"type": "bullet", "content": "Second key point", "sourceText": "relevant quote"},
        {"type": "paragraph", "content": "Concluding summary paragraph", "sourceText": "relevant quote"}
    ]
}

Rules:
- "heading" type for section titles
- "key-concept" type for the most important ideas (include sourceText)
- "bullet" type for key points (include sourceText when possible)
- "paragraph" type for detailed explanations (include sourceText when possible)
- sourceText should be exact or near-exact quotes from the document that support the summary point
- Make sure the summary accurately represents the document content

Document to summarize:
---
${documentContent.slice(0, 30000)}
---`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data: GeminiResponse = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }

        const responseText = data.candidates[0].content.parts[0].text;

        // Clean up the response - remove markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.slice(7);
        }
        if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.slice(3);
        }
        if (cleanedResponse.endsWith('```')) {
            cleanedResponse = cleanedResponse.slice(0, -3);
        }
        cleanedResponse = cleanedResponse.trim();

        const parsed: ParsedSummary = JSON.parse(cleanedResponse);

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

            // Create highlight for sections with source text
            if (section.sourceText && section.type !== 'heading') {
                highlightIndex++;
                const highlightId = `h${highlightIndex}`;
                summarySection.highlightId = highlightId;

                highlights.push({
                    id: highlightId,
                    summaryLineId: sectionId,
                    documentParagraphId: `p-${highlightIndex}`,
                    colorIndex: getColorIndex(highlightIndex),
                    sourceText: section.sourceText,
                    sourceLocation: {
                        page: 1,
                        paragraph: highlightIndex,
                        startOffset: 0,
                        endOffset: section.sourceText.length,
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
 * Extract text from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'txt') {
        return await file.text();
    }

    if (fileType === 'pdf') {
        // For PDF files, we'll use pdf.js or send to a server
        // For now, return a message that PDF parsing requires additional setup
        return await parsePdfFile(file);
    }

    if (fileType === 'docx') {
        return await parseDocxFile(file);
    }

    throw new Error(`Unsupported file type: ${fileType}`);
}

/**
 * Parse PDF file to text using pdf.js
 */
async function parsePdfFile(file: File): Promise<string> {
    // Dynamic import of pdf.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => {
                // TextItem has 'str' property, TextMarkedContent does not
                if ('str' in item) {
                    return (item as { str: string }).str;
                }
                return '';
            })
            .join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText;
}

/**
 * Parse DOCX file to text using mammoth
 */
async function parseDocxFile(file: File): Promise<string> {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}
