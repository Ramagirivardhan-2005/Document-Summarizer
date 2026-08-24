import express from 'express';
import {
  createSummary,
  getSummaryByDocumentId,
  regenerateSummary,
} from '../controllers/summaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth protection to all summary routes
router.use(protect);

router.post('/:documentId', createSummary);
router.get('/:documentId', getSummaryByDocumentId);
router.post('/:documentId/regenerate', regenerateSummary);

export default router;
