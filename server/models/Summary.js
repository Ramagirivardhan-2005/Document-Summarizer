import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: 'Document Summary',
      trim: true,
    },
    overview: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      required: [true, 'Summary body is required'],
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    mainIdeas: {
      type: [String],
      default: [],
    },
    importantTopics: {
      type: [String],
      default: [],
    },
    conclusion: {
      type: String,
      default: '',
    },
    summaryLength: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium',
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

const Summary = mongoose.model('Summary', summarySchema);
export default Summary;
