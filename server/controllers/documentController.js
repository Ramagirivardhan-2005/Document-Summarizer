import path from 'path';
import Document from '../models/Document.js';
import Summary from '../models/Summary.js';
import Interaction from '../models/Interaction.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { extractTextFromImage } from '../services/ocrService.js';
import { processDocumentAIQuery } from '../services/geminiService.js';

/**
 * @desc    Upload document, detect type, extract text (PDF/OCR page-by-page) and save
 * @route   POST /api/documents/upload
 * @access  Private
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select and upload a valid document file (PDF, JPG, JPEG, PNG)',
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Check empty file
    if (!buffer || buffer.length === 0 || size === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file is empty. Please upload a file with content.',
      });
    }

    // Determine file extension and type
    const ext = path.extname(originalname).toLowerCase().replace('.', '');
    let fileType = ext;
    if (fileType === 'jpeg') fileType = 'jpg';

    if (!['pdf', 'jpg', 'png'].includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format. Please upload a PDF, JPG, or PNG document.',
      });
    }

    let extractedText = '';
    let pages = [];
    let pageCount = 1;

    // Extract text based on file type
    if (fileType === 'pdf') {
      try {
        const pdfResult = await extractTextFromPdf(buffer);
        extractedText = pdfResult.text;
        pages = pdfResult.pages || [];
        pageCount = pdfResult.pageCount || (pages.length > 0 ? pages.length : 1);
      } catch (pdfErr) {
        return res.status(422).json({
          success: false,
          message: `Unable to parse PDF document: ${pdfErr.message}. The file may be password-protected or corrupted.`,
        });
      }
    } else {
      // Image OCR (Handwritten & Printed Vision OCR)
      try {
        const ocrResult = await extractTextFromImage(buffer, 'eng', mimetype);
        extractedText = ocrResult.text;
        pages = ocrResult.pages || [{ pageNumber: 1, text: extractedText }];
        pageCount = 1;
      } catch (ocrErr) {
        return res.status(422).json({
          success: false,
          message: `OCR processing failed for this image: ${ocrErr.message}`,
        });
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message:
          'No readable text could be extracted from this document. Please ensure the document is clear, contains legible text, and is not an empty or scanned blank page.',
      });
    }

    // If pages is empty, create at least 1 page
    if (!pages || pages.length === 0) {
      pages = [{ pageNumber: 1, text: extractedText }];
    }

    // Create document in database
    const document = await Document.create({
      userId: req.user._id,
      fileName: originalname,
      fileType: ext === 'jpeg' ? 'jpeg' : fileType,
      fileSize: size,
      extractedText,
      pages,
      pageCount,
      status: 'extracted',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and text extracted successfully',
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all documents for the authenticated user
 * @route   GET /api/documents
 * @access  Private
 */
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select('-extractedText -pages.text') // lightweight list
      .sort({ createdAt: -1 })
      .lean();

    const documentIds = documents.map((doc) => doc._id);
    const summaries = await Summary.find({ documentId: { $in: documentIds } }).lean();

    const summaryMap = {};
    summaries.forEach((sum) => {
      summaryMap[sum.documentId.toString()] = sum;
    });

    const documentsWithSummary = documents.map((doc) => ({
      ...doc,
      summary: summaryMap[doc._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: documentsWithSummary.length,
      data: {
        documents: documentsWithSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const summary = await Summary.findOne({ documentId: document._id }).sort({ createdAt: -1 });
    const interactions = await Interaction.find({ documentId: document._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        document,
        summary,
        interactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Execute Context-Aware AI query (selection, page, page range, translate, flowchart)
 * @route   POST /api/documents/:id/ai-query
 * @access  Private
 */
export const handleDocumentAIQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    let {
      actionType = 'custom', // 'summarize' | 'explain' | 'translate' | 'flowchart' | 'custom' | 'qa'
      scope = 'document', // 'document' | 'page' | 'page_range' | 'selection'
      selectedText = '',
      pageNumber = 1,
      startPage = 1,
      endPage = 1,
      prompt = '',
      summaryLength = 'short',
      targetLanguage = 'Telugu',
    } = req.body;

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.',
      });
    }

    // Sanitize numeric parameters
    const safePageNumber = Number(pageNumber) || 1;
    const safeStartPage = Number(startPage) || 1;
    const safeEndPage = Number(endPage) || 1;

    // If selection scope but no selected text, fallback to page or document
    if (scope === 'selection' && (!selectedText || selectedText.trim().length === 0)) {
      scope = document.pages && document.pages.length > 0 ? 'page' : 'document';
    }

    // Determine the text block to feed to Gemini
    let pageRangeText = '';

    if (scope === 'page') {
      const pageObj = (document.pages || []).find((p) => p.pageNumber === safePageNumber);
      pageRangeText = pageObj ? pageObj.text : document.extractedText;
    } else if (scope === 'page_range') {
      const filtered = (document.pages || []).filter(
        (p) => p.pageNumber >= safeStartPage && p.pageNumber <= safeEndPage
      );
      if (filtered.length > 0) {
        pageRangeText = filtered
          .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`)
          .join('\n\n');
      } else {
        pageRangeText = document.extractedText;
      }
    }

    const aiResult = await processDocumentAIQuery({
      documentText: document.extractedText || 'Document Content',
      selectedText: selectedText || '',
      scope,
      pageRangeText,
      prompt,
      actionType,
      summaryLength,
      targetLanguage,
      fileName: document.fileName,
    });

    // Formulate a clean query title/description for recording
    let queryDescription = prompt;
    if (!queryDescription) {
      if (actionType === 'summarize') {
        queryDescription = `Summarize ${scope === 'selection' ? 'Selection' : scope} (${summaryLength})`;
      } else if (actionType === 'translate') {
        queryDescription = `Translate to ${targetLanguage}`;
      } else if (actionType === 'explain') {
        queryDescription = `Explain in Simple English`;
      } else if (actionType === 'flowchart') {
        queryDescription = `Explain methodology & create flowchart`;
      } else {
        queryDescription = `AI Analysis`;
      }
    }

    // Save interaction
    const interaction = await Interaction.create({
      userId: req.user._id,
      documentId: document._id,
      actionType,
      scope,
      scopeDetails: {
        pageNumber: safePageNumber,
        startPage: safeStartPage,
        endPage: safeEndPage,
        selectedTextSnippet: selectedText ? selectedText.slice(0, 300) : '',
      },
      query: queryDescription,
      targetLanguage: actionType === 'translate' ? targetLanguage : '',
      response: aiResult.response,
    });

    res.status(200).json({
      success: true,
      data: {
        interaction,
      },
    });
  } catch (error) {
    console.error('handleDocumentAIQuery Error:', error);
    next(error);
  }
};

/**
 * @desc    Get all interactions for a document
 * @route   GET /api/documents/:id/interactions
 * @access  Private
 */
export const getDocumentInteractions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interactions = await Interaction.find({
      documentId: id,
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: {
        interactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete single interaction
 * @route   DELETE /api/documents/:id/interactions/:interactionId
 * @access  Private
 */
export const deleteDocumentInteraction = async (req, res, next) => {
  try {
    const { id, interactionId } = req.params;
    await Interaction.deleteOne({
      _id: interactionId,
      documentId: id,
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete document and associated summaries + interactions
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete associated summaries & interactions
    await Summary.deleteMany({ documentId: document._id });
    await Interaction.deleteMany({ documentId: document._id });

    // Delete document
    await Document.deleteOne({ _id: document._id });

    res.status(200).json({
      success: true,
      message: 'Document, summaries, and interactions deleted successfully',
      data: {
        deletedId: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
