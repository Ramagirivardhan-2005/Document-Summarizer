import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  handleDocumentAIQuery,
  getDocumentInteractions,
  deleteDocumentInteraction,
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply auth protection to all document routes
router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

// Context-Aware AI query and interaction history routes
router.post('/:id/ai-query', handleDocumentAIQuery);
router.get('/:id/interactions', getDocumentInteractions);
router.delete('/:id/interactions/:interactionId', deleteDocumentInteraction);

export default router;
