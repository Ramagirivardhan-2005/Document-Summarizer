import { createWorker } from 'tesseract.js';
import { cleanExtractedText } from '../utils/textCleaner.js';
import { extractHandwrittenTextWithGeminiVision } from './geminiService.js';

/**
 * Extracts text from handwritten or printed images using a Dual-Engine Pipeline:
 * 1. Gemini Multimodal Vision AI (State-of-the-art handwriting, cursive, notes & diagrams)
 * 2. Tesseract.js OCR (Reliable offline fallback for standard printed text)
 *
 * @param {Buffer|string} imageBuffer - Image buffer or path
 * @param {string} [lang='eng'] - OCR language
 * @param {string} [mimeType='image/jpeg'] - Image MIME type
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string }>, confidence: number|string, engine: string }>}
 */
export const extractTextFromImage = async (
  imageBuffer,
  lang = 'eng',
  mimeType = 'image/jpeg'
) => {
  if (!imageBuffer) {
    throw new Error('Empty image input received');
  }

  // 1. Try Gemini Vision AI first (Native handwriting, cursive, whiteboard, and printed recognition)
  try {
    const visionResult = await extractHandwrittenTextWithGeminiVision(imageBuffer, mimeType);
    if (visionResult.text && visionResult.text.trim().length > 0) {
      const cleaned = cleanExtractedText(visionResult.text);
      return {
        text: cleaned,
        pages: [{ pageNumber: 1, text: cleaned }],
        confidence: 98,
        engine: 'Gemini Multimodal Vision (Handwritten & Printed OCR)',
      };
    }
  } catch (visionErr) {
    console.warn('Gemini Vision OCR error, attempting Tesseract.js fallback:', visionErr.message);
  }

  // 2. Fallback to Tesseract.js OCR
  let worker = null;
  try {
    worker = await createWorker(lang);
    const result = await worker.recognize(imageBuffer);
    await worker.terminate();
    worker = null;

    const cleanedText = cleanExtractedText(result.data.text);
    const confidence = result.data.confidence || 0;

    return {
      text: cleanedText,
      pages: [{ pageNumber: 1, text: cleanedText }],
      confidence,
      engine: 'Tesseract.js OCR',
    };
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        console.error('Worker termination error:', termErr.message);
      }
    }
    console.error('OCR Extraction Error:', error.message);
    throw new Error(`Failed to extract text from image with OCR: ${error.message}`);
  }
};
