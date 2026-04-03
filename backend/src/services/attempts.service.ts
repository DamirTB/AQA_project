// backend/src/services/attempts.service.ts
import mongoose from 'mongoose';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { Attempt } from '../models/Attempt';
import { ServiceError } from '../errors/ServiceError';

function formatQuestions(questions: any[]) {
  return questions.map((q) => ({
    id: q._id,
    text: q.text,
    options: q.options,
    order: q.order,
  }));
}

export async function startAttempt(userId: string, examId: string) {
  if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
    throw new ServiceError(400, 'Valid exam ID is required');
  }

  const exam = await Exam.findById(examId).lean();
  if (!exam) throw new ServiceError(404, 'Exam not found');

  const existing = await Attempt.findOne({ userId, examId, status: 'in_progress' });

  if (existing) {
    const questions = await Question.find({ examId })
      .select('-correctOption')
      .sort({ order: 1 })
      .lean();

    return {
      attemptId: existing._id,
      exam: { id: exam._id, title: exam.title, timeLimitMinutes: exam.timeLimitMinutes },
      questions: formatQuestions(questions),
      startedAt: existing.startedAt,
      answers: Object.fromEntries(existing.answers || new Map()),
    };
  }

  const totalQuestions = await Question.countDocuments({ examId });
  const attempt = await Attempt.create({
    userId,
    examId,
    totalQuestions,
    status: 'in_progress',
    startedAt: new Date(),
  });

  const questions = await Question.find({ examId })
    .select('-correctOption')
    .sort({ order: 1 })
    .lean();

  return {
    attemptId: attempt._id,
    exam: { id: exam._id, title: exam.title, timeLimitMinutes: exam.timeLimitMinutes },
    questions: formatQuestions(questions),
    startedAt: attempt.startedAt,
    answers: {},
  };
}

export async function submitAttempt(
  userId: string,
  attemptId: string,
  answers: Record<string, number>,
) {
  if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new ServiceError(400, 'Valid attempt ID is required');
  }

  const attempt = await Attempt.findOne({ _id: attemptId, userId });
  if (!attempt) throw new ServiceError(404, 'Attempt not found');

  if (attempt.status === 'completed') {
    throw new ServiceError(400, 'This attempt has already been submitted');
  }

  const exam = await Exam.findById(attempt.examId).lean();
  if (exam) {
    const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000;
    const allowedSeconds = exam.timeLimitMinutes * 60 + 30;
    if (elapsed > allowedSeconds) {
      throw new ServiceError(400, 'Time limit exceeded');
    }
  }

  const questions = await Question.find({ examId: attempt.examId }).lean();

  let score = 0;
  const breakdown = questions.map((question) => {
    const questionId = question._id.toString();
    const selected = answers[questionId] ?? null;
    const isCorrect = selected === question.correctOption;
    if (isCorrect) score++;
    return {
      questionId,
      questionText: question.text,
      selectedOption: selected,
      correctOption: question.correctOption,
      isCorrect,
    };
  });

  attempt.answers = new Map(Object.entries(answers).map(([k, v]) => [k, v]));
  attempt.score = score;
  attempt.totalQuestions = questions.length;
  attempt.status = 'completed';
  attempt.submittedAt = new Date();
  await attempt.save();

  return {
    attemptId: attempt._id,
    score,
    totalQuestions: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    breakdown,
    submittedAt: attempt.submittedAt,
  };
}

export async function getResult(userId: string, attemptId: string) {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new ServiceError(400, 'Invalid attempt ID format');
  }

  const attempt = await Attempt.findOne({ _id: attemptId, userId })
    .populate('examId', 'title')
    .lean();

  if (!attempt) throw new ServiceError(404, 'Attempt not found');
  if (attempt.status !== 'completed') {
    throw new ServiceError(400, 'Attempt has not been submitted yet');
  }

  const exam = attempt.examId as unknown as { _id: string; title: string };
  const questions = await Question.find({ examId: exam._id }).sort({ order: 1 }).lean();

  const answersMap =
    attempt.answers instanceof Map
      ? Object.fromEntries(attempt.answers)
      : (attempt.answers as any) || {};

  const breakdown = questions.map((q) => {
    const qId = q._id.toString();
    const selected = answersMap[qId] ?? null;
    return {
      questionId: qId,
      questionText: q.text,
      options: q.options,
      selectedOption: selected,
      correctOption: q.correctOption,
      isCorrect: selected === q.correctOption,
    };
  });

  return {
    attemptId: attempt._id,
    examTitle: exam.title,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage:
      attempt.score !== null ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0,
    breakdown,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
  };
}

export async function getHistory(userId: string) {
  const attempts = await Attempt.find({ userId })
    .populate('examId', 'title timeLimitMinutes')
    .sort({ startedAt: -1 })
    .lean();

  return attempts.map((a) => {
    const exam = a.examId as unknown as { _id: string; title: string; timeLimitMinutes: number };
    return {
      attemptId: a._id,
      examId: exam._id,
      examTitle: exam.title,
      score: a.score,
      totalQuestions: a.totalQuestions,
      percentage: a.score !== null ? Math.round((a.score / a.totalQuestions) * 100) : null,
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    };
  });
}
