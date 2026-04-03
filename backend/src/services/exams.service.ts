// backend/src/services/exams.service.ts
import mongoose from 'mongoose';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { Category } from '../models/Category';
import { ServiceError } from '../errors/ServiceError';

export async function getCategories() {
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories.map((c) => ({
    id: c._id,
    name: c.name,
    description: c.description,
  }));
}

export async function getExams(categoryFilter?: string) {
  const filter: Record<string, unknown> = {};

  if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
    filter.categoryId = categoryFilter;
  }

  const exams = await Exam.find(filter).populate('categoryId', 'name').lean();

  return Promise.all(
    exams.map(async (exam) => {
      const questionCount = await Question.countDocuments({ examId: exam._id });
      const cat = exam.categoryId as unknown as { _id: string; name: string } | null;
      return {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        timeLimitMinutes: exam.timeLimitMinutes,
        questionCount,
        categoryId: cat?._id || null,
        categoryName: cat?.name || null,
        createdAt: exam.createdAt,
      };
    }),
  );
}

export async function getExamById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError(400, 'Invalid exam ID format');
  }

  const exam = await Exam.findById(id).populate('categoryId', 'name').lean();
  if (!exam) throw new ServiceError(404, 'Exam not found');

  const questions = await Question.find({ examId: id })
    .select('-correctOption')
    .sort({ order: 1 })
    .lean();

  const cat = exam.categoryId as unknown as { _id: string; name: string } | null;

  return {
    id: exam._id,
    title: exam.title,
    description: exam.description,
    timeLimitMinutes: exam.timeLimitMinutes,
    questionCount: questions.length,
    categoryId: cat?._id || null,
    categoryName: cat?.name || null,
    questions: questions.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      order: q.order,
    })),
    createdAt: exam.createdAt,
  };
}
