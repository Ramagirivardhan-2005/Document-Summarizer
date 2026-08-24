/**
 * Utilities for cleaning and normalizing extracted document text
 */

export const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    text
      // Remove null bytes and non-printable control characters except \r, \n, \t
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Replace non-breaking spaces with standard space
      .replace(/\u00A0/g, ' ')
      // Normalize excess whitespace on the same line
      .replace(/[ \t]{2,}/g, ' ')
      // Remove trailing whitespace on each line
      .split('\n')
      .map((line) => line.trim())
      // Consolidate more than 2 consecutive newlines into 2
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};

export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return 'document';
  return fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
};
