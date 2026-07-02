import mongoose from 'mongoose';
import { ALL_CONTENT_TYPES } from '../constants/contentTypes.js';

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    contentType: {
      type: String,
      enum: ALL_CONTENT_TYPES,
      required: [true, 'Content type is required'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    textContent: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

lessonSchema.index({ courseId: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
