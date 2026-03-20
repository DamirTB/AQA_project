import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Exam } from '../models/Exam';
import { Question } from '../models/Question';
import { Category } from '../models/Category';
import { Attempt } from '../models/Attempt';

const JWT_SECRET = 'dev-secret-key';

export interface TestUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  token: string;
}

export interface TestExam {
  _id: mongoose.Types.ObjectId;
  title: string;
  timeLimitMinutes: number;
  questions: Array<{ _id: mongoose.Types.ObjectId; correctOption: number }>;
}

export async function createUser(overrides: Partial<{ username: string; email: string; password: string }> = {}): Promise<TestUser> {
  const username = overrides.username ?? 'testuser';
  const email = overrides.email ?? 'test@example.com';
  const password = overrides.password ?? 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, passwordHash });
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  return { _id: user._id as mongoose.Types.ObjectId, username, email, token };
}

export async function createCategory(overrides: Partial<{ name: string; description: string }> = {}) {
  return Category.create({
    name: overrides.name ?? 'Test Category',
    description: overrides.description ?? 'A test category',
  });
}

export async function createExamWithQuestions(
  overrides: Partial<{ title: string; timeLimitMinutes: number; questionCount: number; categoryId: mongoose.Types.ObjectId }> = {},
): Promise<TestExam> {
  const exam = await Exam.create({
    title: overrides.title ?? 'Test Exam',
    description: 'A test exam description',
    timeLimitMinutes: overrides.timeLimitMinutes ?? 60,
    categoryId: overrides.categoryId ?? null,
  });

  const count = overrides.questionCount ?? 3;
  const questions = await Question.insertMany(
    Array.from({ length: count }, (_, i) => ({
      examId: exam._id,
      text: `Question ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOption: 0,
      order: i,
    })),
  );

  return {
    _id: exam._id as mongoose.Types.ObjectId,
    title: exam.title,
    timeLimitMinutes: exam.timeLimitMinutes,
    questions: questions.map((q) => ({ _id: q._id as mongoose.Types.ObjectId, correctOption: q.correctOption })),
  };
}

export async function createCompletedAttempt(userId: mongoose.Types.ObjectId, exam: TestExam) {
  const answers = new Map(exam.questions.map((q) => [q._id.toString(), q.correctOption]));
  return Attempt.create({
    userId,
    examId: exam._id,
    answers,
    score: exam.questions.length,
    totalQuestions: exam.questions.length,
    status: 'completed',
    startedAt: new Date(Date.now() - 60000),
    submittedAt: new Date(),
  });
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
