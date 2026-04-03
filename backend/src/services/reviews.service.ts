// backend/src/services/reviews.service.ts
import mongoose from 'mongoose';
import { ExamReview } from '../models/ExamReview';
import { Attempt } from '../models/Attempt';
import { ServiceError } from '../errors/ServiceError';

export async function createReview(
  userId: string,
  examId: string,
  rating: number,
  comment: string,
) {
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    throw new ServiceError(400, 'Invalid exam ID format');
  }

  const completedAttempt = await Attempt.findOne({ userId, examId, status: 'completed' });
  if (!completedAttempt) {
    throw new ServiceError(403, 'You must complete this exam before leaving a review');
  }

  const existing = await ExamReview.findOne({ userId, examId });
  if (existing) throw new ServiceError(409, 'You have already reviewed this exam');

  const review = await ExamReview.create({
    userId,
    examId,
    rating: Math.round(rating),
    comment: comment.trim(),
  });

  return {
    id: review._id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export async function getReviews(examId: string) {
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    throw new ServiceError(400, 'Invalid exam ID format');
  }

  const reviews = await ExamReview.find({ examId })
    .populate('userId', 'username')
    .sort({ createdAt: -1 })
    .lean();

  return reviews.map((r) => {
    const user = r.userId as unknown as { _id: string; username: string };
    return {
      id: r._id,
      username: user.username,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    };
  });
}
