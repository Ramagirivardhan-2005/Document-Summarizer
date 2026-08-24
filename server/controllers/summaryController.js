import Document from '../models/Document.js';
import Summary from '../models/Summary.js';
import { generateDocumentSummary } from '../services/geminiService.js';

/**
 * @desc    Generate a summary for a document
 * @route   POST /api/summaries/:documentId
 * @access  Private
 */
export const createSummary = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { summaryLength = 'medium' } = req.body;

    const validLengths = ['short', 'medium', 'long'];
    const chosenLength = validLengths.includes(summaryLength.toLowerCase())
      ? summaryLength.toLowerCase()
      : 'medium';

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you do not have permission to access it.',
      });
    }

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This document does not contain any extracted text to summarize.',
      });
    }

    // Call Gemini Service
    const aiResult = await generateDocumentSummary(
      document.extractedText,
      chosenLength,
      document.fileName
    );

    // Create or update summary for this document
    let summary = await Summary.findOne({
      documentId: document._id,
      userId: req.user._id,
    });

    if (summary) {
      summary.title = aiResult.title;
      summary.overview = aiResult.overview;
      summary.summary = aiResult.summary;
      summary.keyPoints = aiResult.keyPoints;
      summary.mainIdeas = aiResult.mainIdeas;
      summary.importantTopics = aiResult.importantTopics;
      summary.conclusion = aiResult.conclusion;
      summary.summaryLength = chosenLength;
      await summary.save();
    } else {
      summary = await Summary.create({
        userId: req.user._id,
        documentId: document._id,
        title: aiResult.title,
        overview: aiResult.overview,
        summary: aiResult.summary,
        keyPoints: aiResult.keyPoints,
        mainIdeas: aiResult.mainIdeas,
        importantTopics: aiResult.importantTopics,
        conclusion: aiResult.conclusion,
        summaryLength: chosenLength,
      });
    }

    // Update document status
    document.status = 'summarized';
    await document.save();

    res.status(201).json({
      success: true,
      message: 'Summary generated successfully',
      data: {
        summary,
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary for a document
 * @route   GET /api/summaries/:documentId
 * @access  Private
 */
export const getSummaryByDocumentId = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const summary = await Summary.findOne({
      documentId: document._id,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary has not been generated for this document yet.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary,
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Regenerate summary with new or existing length
 * @route   POST /api/summaries/:documentId/regenerate
 * @access  Private
 */
export const regenerateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { summaryLength = 'medium' } = req.body;

    const validLengths = ['short', 'medium', 'long'];
    const chosenLength = validLengths.includes(summaryLength.toLowerCase())
      ? summaryLength.toLowerCase()
      : 'medium';

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Document text is empty.',
      });
    }

    // Call Gemini
    const aiResult = await generateDocumentSummary(
      document.extractedText,
      chosenLength,
      document.fileName
    );

    let summary = await Summary.findOne({
      documentId: document._id,
      userId: req.user._id,
    });

    if (summary) {
      summary.title = aiResult.title;
      summary.overview = aiResult.overview;
      summary.summary = aiResult.summary;
      summary.keyPoints = aiResult.keyPoints;
      summary.mainIdeas = aiResult.mainIdeas;
      summary.importantTopics = aiResult.importantTopics;
      summary.conclusion = aiResult.conclusion;
      summary.summaryLength = chosenLength;
      await summary.save();
    } else {
      summary = await Summary.create({
        userId: req.user._id,
        documentId: document._id,
        title: aiResult.title,
        overview: aiResult.overview,
        summary: aiResult.summary,
        keyPoints: aiResult.keyPoints,
        mainIdeas: aiResult.mainIdeas,
        importantTopics: aiResult.importantTopics,
        conclusion: aiResult.conclusion,
        summaryLength: chosenLength,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Summary regenerated successfully',
      data: {
        summary,
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};
