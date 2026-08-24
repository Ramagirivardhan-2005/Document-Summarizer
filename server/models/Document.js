import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    pageNumber: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    pages: {
      type: [pageSchema],
      default: [],
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'extracted', 'summarized', 'failed'],
      default: 'uploaded',
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

const Document = mongoose.model('Document', documentSchema);
export default Document;
