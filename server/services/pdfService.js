import pdfParse from 'pdf-parse';
import { cleanExtractedText } from '../utils/textCleaner.js';

/**
 * Extracts text and metadata from a PDF buffer page-by-page
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{ text: string, pages: Array<{ pageNumber: number, text: string }>, pageCount: number, info: object }>}
 */
export const extractTextFromPdf = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty PDF buffer received');
    }

    const pages = [];

    const customPageRender = (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY;
        let text = '';
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }

        const cleaned = cleanExtractedText(text);
        pages.push({
          pageNumber: pageData.pageIndex + 1,
          text: cleaned,
        });

        return text;
      });
    };

    const data = await pdfParse(buffer, {
      pagerender: customPageRender,
    });

    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    const fullCleanedText = cleanExtractedText(data.text);
    const pageCount = data.numpages || (pages.length > 0 ? pages.length : 1);

    // Fallback if pages was empty
    if (pages.length === 0 && fullCleanedText) {
      pages.push({
        pageNumber: 1,
        text: fullCleanedText,
      });
    }

    return {
      text: fullCleanedText,
      pages,
      pageCount,
      info: data.info || {},
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
