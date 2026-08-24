import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['summarize', 'explain', 'translate', 'flowchart', 'custom', 'qa'],
      required: true,
    },
    scope: {
      type: String,
      enum: ['document', 'page', 'page_range', 'selection'],
      default: 'document',
    },
    scopeDetails: {
      pageNumber: Number,
      startPage: Number,
      endPage: Number,
      selectedTextSnippet: String,
    },
    query: {
      type: String,
      required: true,
    },
    targetLanguage: {
      type: String,
      default: '',
    },
    response: {
      type: String,
      required: true,
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Interaction = mongoose.model('Interaction', interactionSchema);
export default Interaction;
