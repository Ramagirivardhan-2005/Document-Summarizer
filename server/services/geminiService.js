import { GoogleGenerativeAI } from '@google/generative-ai';

// In development environments with self-signed inspection certs, allow TLS
if (process.env.NODE_ENV !== 'production' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const candidateModels = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-pro',
  'gemini-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

/**
 * Robust execution helper that tries candidate models and handles 503/429/404 errors with retries
 */
const executeGeminiWithFallback = async ({
  prompt,
  systemInstruction,
  responseMimeType,
  imagePart = null,
  temperature = 0.2,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key') {
    throw new Error('GEMINI_API_KEY is not configured on the backend server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of candidateModels) {
    // Attempt with retry
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const modelConfig = {
          model: modelName,
          generationConfig: {
            temperature,
            ...(responseMimeType && { responseMimeType }),
          },
          ...(systemInstruction && { systemInstruction }),
        };

        const model = genAI.getGenerativeModel(modelConfig);

        const contents = imagePart ? [prompt, imagePart] : prompt;
        const result = await model.generateContent(contents);
        const responseText = result.response.text();

        return { responseText, modelUsed: modelName };
      } catch (error) {
        lastError = error;
        console.warn(
          `[Gemini Fallback] Model '${modelName}' attempt ${attempt + 1} failed: ${error.message}`
        );

        const isTransient =
          error.message?.includes('503') ||
          error.message?.includes('429') ||
          error.message?.includes('overloaded') ||
          error.message?.includes('high demand') ||
          error.message?.includes('Resource has been exhausted') ||
          error.message?.includes('Service Unavailable');

        const isNotFound = error.message?.includes('404') || error.message?.includes('not found');

        if (isNotFound) {
          // Break inner loop immediately to try next candidate model
          break;
        }

        if (isTransient && attempt === 0) {
          // Wait 600ms before second attempt
          await new Promise((r) => setTimeout(r, 600));
          continue;
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  console.error('All Gemini candidate models failed. Last error:', lastError?.message);
  throw new Error(`Gemini AI service unavailable: ${lastError?.message}`);
};

/**
 * Extracts and transcribes text from handwritten or printed images using Gemini Multimodal Vision
 */
export const extractHandwrittenTextWithGeminiVision = async (
  imageBuffer,
  mimeType = 'image/jpeg'
) => {
  const prompt = `You are an expert handwritten and printed document transcription specialist. 
Carefully read and transcribe ALL handwritten text, cursive handwriting, printed text, numbers, annotations, and notes from this image.

Instructions:
1. Preserve exact structure, paragraphs, headings, list bullets, and dates.
2. Decipher messy, cursive, or faint handwriting accurately.
3. Do not add commentary or assumptions outside of what is written on the document.
4. Output ONLY the transcribed document text.`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg',
    },
  };

  const { responseText } = await executeGeminiWithFallback({
    prompt,
    imagePart,
    temperature: 0.1,
  });

  return {
    text: responseText.trim(),
    confidence: 'high (Gemini Vision OCR)',
  };
};

/**
 * Service to handle Google Gemini API document structured summarization
 */
export const generateDocumentSummary = async (
  documentText,
  summaryLength = 'medium',
  fileName = ''
) => {
  if (!documentText || documentText.trim().length === 0) {
    throw new Error('Cannot summarize empty document text.');
  }

  const lengthGuidelines = {
    short: {
      overview: '1-2 concise sentences.',
      summary: '1 concise, punchy paragraph (approx 80-120 words).',
      keyPointsCount: '3 to 5 key bullet points.',
      mainIdeasCount: '2 to 3 main core ideas.',
      topicsCount: '2 to 3 important topics.',
      conclusion: '1-2 sentences summarizing final impact/takeaway.',
    },
    medium: {
      overview: '2-3 sentences covering context and objective.',
      summary: '2 to 3 well-structured, informative paragraphs (approx 200-300 words).',
      keyPointsCount: '5 to 7 key bullet points.',
      mainIdeasCount: '4 to 5 main ideas.',
      topicsCount: '3 to 5 important topics.',
      conclusion: 'A solid paragraph highlighting results and takeaways.',
    },
    long: {
      overview: 'A detailed executive overview (3-4 sentences).',
      summary: 'Comprehensive, multi-paragraph deep-dive summary (approx 400-600 words).',
      keyPointsCount: '8 to 12 detailed key bullet points.',
      mainIdeasCount: '6 to 8 main ideas.',
      topicsCount: '5 to 8 important topics with brief context.',
      conclusion: 'A comprehensive analytical conclusion with findings and recommendations.',
    },
  };

  const selectedLength =
    lengthGuidelines[summaryLength.toLowerCase()] || lengthGuidelines.medium;

  const systemInstruction = `You are a document summarization assistant. Summarize only the information contained in the provided document (including handwritten notes, reports, articles). Do not invent facts. Preserve important names, dates, numbers, technical terms, and conclusions. Create a clear and accurate summary based on the selected summary length.

Summary Length: ${summaryLength.toUpperCase()}
Guidelines for this length:
- Overview: ${selectedLength.overview}
- Main Summary: ${selectedLength.summary}
- Key Points: ${selectedLength.keyPointsCount}
- Main Ideas: ${selectedLength.mainIdeasCount}
- Important Topics: ${selectedLength.topicsCount}
- Conclusion: ${selectedLength.conclusion}

You MUST respond strictly with a valid JSON object conforming to this schema:
{
  "title": "Clear, representative title for the document or subject matter",
  "overview": "High-level summary of the document purpose and context",
  "summary": "The main structured summary text formatted with readable paragraphs",
  "keyPoints": ["Point 1", "Point 2", ...],
  "mainIdeas": ["Main Idea 1", "Main Idea 2", ...],
  "importantTopics": ["Topic 1", "Topic 2", ...],
  "conclusion": "Final concluding takeaways and wrap-up"
}`;

  const prompt = `Document Filename: ${fileName || 'Uploaded Document'}

--- BEGIN DOCUMENT TEXT ---
${documentText}
--- END DOCUMENT TEXT ---

Please generate the structured summary for this document strictly in JSON format as specified.`;

  const { responseText } = await executeGeminiWithFallback({
    prompt,
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.2,
  });

  let parsedSummary;
  try {
    parsedSummary = JSON.parse(responseText);
  } catch (parseError) {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      parsedSummary = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse Gemini JSON response');
    }
  }

  return {
    title: parsedSummary.title || fileName || 'Document Summary',
    overview: parsedSummary.overview || '',
    summary: parsedSummary.summary || '',
    keyPoints: Array.isArray(parsedSummary.keyPoints) ? parsedSummary.keyPoints : [],
    mainIdeas: Array.isArray(parsedSummary.mainIdeas) ? parsedSummary.mainIdeas : [],
    importantTopics: Array.isArray(parsedSummary.importantTopics)
      ? parsedSummary.importantTopics
      : [],
    conclusion: parsedSummary.conclusion || '',
    summaryLength: summaryLength.toLowerCase(),
  };
};

/**
 * Flexible Document AI Query handler
 */
export const processDocumentAIQuery = async ({
  documentText,
  selectedText = '',
  scope = 'document',
  pageRangeText = '',
  prompt = '',
  actionType = 'custom',
  summaryLength = 'short',
  targetLanguage = 'Telugu',
  fileName = '',
}) => {
  let activeText = '';
  let scopeDescription = 'Full Document';

  if (scope === 'selection' && selectedText && selectedText.trim().length > 0) {
    activeText = selectedText;
    scopeDescription = 'User Selected Text Snippet';
  } else if (
    (scope === 'page' || scope === 'page_range') &&
    pageRangeText &&
    pageRangeText.trim().length > 0
  ) {
    activeText = pageRangeText;
    scopeDescription = `Selected Page(s) Content`;
  } else {
    activeText = documentText;
    scopeDescription = 'Full Document Context';
  }

  if (!activeText || activeText.trim().length === 0) {
    activeText = documentText || selectedText || pageRangeText || 'Document content unavailable.';
  }

  const actionSystemInstruction = `You are a precision AI Document Assistant. You analyze provided document text (including handwritten notes and scanned pages) and answer strictly based on the provided text. Never invent facts. Preserve exact names, numbers, data, and terminology. Use clean Markdown formatting.`;

  let specificPrompt = '';

  switch (actionType) {
    case 'summarize': {
      if (scope === 'selection') {
        if (summaryLength === 'short') {
          specificPrompt = `Summarize the following selected text concisely into exactly 2 to 3 clear, informative sentences:

--- SELECTED TEXT ---
${activeText}
--- END TEXT ---`;
        } else {
          specificPrompt = `Provide a structured summary of the following selected text (${summaryLength} length) with bullet points and main takeaways:

--- SELECTED TEXT ---
${activeText}
--- END TEXT ---`;
        }
      } else {
        specificPrompt = `Summarize the following document content (${scopeDescription}) with ${summaryLength.toUpperCase()} depth. Include an Overview, Key Points, and Takeaways:

--- CONTEXT (${scopeDescription}) ---
${activeText}
--- END CONTEXT ---`;
      }
      break;
    }

    case 'explain': {
      specificPrompt = `Explain the following text in simple, easy-to-understand plain English. Break down complex jargon, methodology, or concepts into clear, accessible terms with structured bullet points:

--- CONTEXT (${scopeDescription}) ---
${activeText}
--- END CONTEXT ---`;
      break;
    }

    case 'flowchart': {
      specificPrompt = `Analyze the methodology, process, workflow, or sequence described in the following text. 
1. Explain the process step-by-step in plain English.
2. Provide a valid Mermaid.js flowchart diagram enclosed in a \`\`\`mermaid code block illustrating the exact workflow or architecture.

--- CONTEXT (${scopeDescription}) ---
${activeText}
--- END CONTEXT ---`;
      break;
    }

    case 'translate': {
      specificPrompt = `Translate the following text accurately into ${targetLanguage}. Maintain the original tone, numbers, terminology, and paragraph structure:

--- TEXT TO TRANSLATE (${scopeDescription}) ---
${activeText}
--- END TEXT ---

Please provide the accurate translation in ${targetLanguage}.`;
      break;
    }

    case 'custom':
    case 'qa':
    default: {
      specificPrompt = `User Request / Question: "${prompt || 'Analyze and explain this content.'}"

--- CONTEXT (${scopeDescription}) ---
${activeText}
--- END CONTEXT ---

If the user asks for a flowchart or diagram, include a valid Mermaid.js diagram in \`\`\`mermaid block.
Answer accurately based on the context above.`;
      break;
    }
  }

  const { responseText } = await executeGeminiWithFallback({
    prompt: specificPrompt,
    systemInstruction: actionSystemInstruction,
    temperature: 0.2,
  });

  return {
    response: responseText,
    actionType,
    scope,
    targetLanguage: actionType === 'translate' ? targetLanguage : undefined,
  };
};
