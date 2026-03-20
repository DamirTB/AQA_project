import mongoose from 'mongoose';
import { Bookmark } from '../models/Bookmark';
import { ServiceError } from '../errors/ServiceError';

export async function getBookmarks(userId: string) {
  const bookmarks = await Bookmark.find({ userId })
    .populate('examId', 'title description timeLimitMinutes')
    .sort({ createdAt: -1 })
    .lean();

  return bookmarks.map((b) => {
    const exam = b.examId as unknown as {
      _id: string;
      title: string;
      description: string;
      timeLimitMinutes: number;
    };
    return {
      id: b._id,
      examId: exam._id,
      examTitle: exam.title,
      examDescription: exam.description,
      timeLimitMinutes: exam.timeLimitMinutes,
      createdAt: b.createdAt,
    };
  });
}

export async function addBookmark(userId: string, examId: string) {
  if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
    throw new ServiceError(400, 'Valid exam ID is required');
  }

  const existing = await Bookmark.findOne({ userId, examId });
  if (existing) throw new ServiceError(409, 'Exam is already bookmarked');

  const bookmark = await Bookmark.create({ userId, examId });
  return { id: bookmark._id, examId: bookmark.examId, createdAt: bookmark.createdAt };
}

export async function removeBookmark(userId: string, examId: string) {
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    throw new ServiceError(400, 'Invalid exam ID format');
  }

  const result = await Bookmark.findOneAndDelete({ userId, examId });
  if (!result) throw new ServiceError(404, 'Bookmark not found');
}
