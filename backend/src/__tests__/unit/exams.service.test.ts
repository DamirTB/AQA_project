import mongoose from 'mongoose';
import { connect, disconnect, clearCollections } from '../testDb';
import { createCategory, createExamWithQuestions } from '../helpers';
import * as examsService from '../../services/exams.service';
import { Exam } from '../../models/Exam';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('examsService.getCategories', () => {
  it('returns all categories sorted by name', async () => {
    await createCategory({ name: 'Zebra Cat', description: 'z' });
    await createCategory({ name: 'Alpha Cat', description: 'a' });

    const result = await examsService.getCategories();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alpha Cat');
    expect(result[1].name).toBe('Zebra Cat');
  });

  it('returns an empty array when no categories exist', async () => {
    const result = await examsService.getCategories();
    expect(result).toEqual([]);
  });

  it('returns id, name, description for each category', async () => {
    await createCategory({ name: 'Science', description: 'Science tests' });
    const result = await examsService.getCategories();

    expect(result[0]).toMatchObject({
      name: 'Science',
      description: 'Science tests',
    });
    expect(result[0].id).toBeDefined();
  });
});

describe('examsService.getExams', () => {
  it('returns all exams when no filter is given', async () => {
    await createExamWithQuestions({ title: 'Exam A' });
    await createExamWithQuestions({ title: 'Exam B' });

    const result = await examsService.getExams();
    expect(result).toHaveLength(2);
  });

  it('filters exams by category ID', async () => {
    const cat = await createCategory({ name: 'Math', description: 'Math' });
    await createExamWithQuestions({ title: 'Math Exam', categoryId: cat._id as mongoose.Types.ObjectId });
    await createExamWithQuestions({ title: 'Other Exam' });

    const result = await examsService.getExams(cat._id.toString());
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Math Exam');
  });

  it('returns all exams when category filter is an invalid ObjectId', async () => {
    await createExamWithQuestions({ title: 'Any Exam' });

    const result = await examsService.getExams('not-valid-id');
    expect(result).toHaveLength(1);
  });

  it('includes questionCount in each exam', async () => {
    await createExamWithQuestions({ title: 'Counted Exam', questionCount: 5 });

    const result = await examsService.getExams();
    expect(result[0].questionCount).toBe(5);
  });
});

describe('examsService.getExamById', () => {
  it('returns exam with questions that do NOT include correctOption', async () => {
    const exam = await createExamWithQuestions({ questionCount: 3 });

    const result = await examsService.getExamById(exam._id.toString());

    expect(result.id.toString()).toBe(exam._id.toString());
    expect(result.questions).toHaveLength(3);
    result.questions.forEach((q: any) => {
      expect(q).not.toHaveProperty('correctOption');
    });
  });

  it('returns questions sorted by order', async () => {
    const exam = await createExamWithQuestions({ questionCount: 3 });

    const result = await examsService.getExamById(exam._id.toString());
    const orders = result.questions.map((q: any) => q.order);

    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('throws 400 for an invalid ObjectId', async () => {
    await expect(examsService.getExamById('not-valid')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('throws 404 when exam does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(examsService.getExamById(fakeId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('includes questionCount equal to the number of questions', async () => {
    const exam = await createExamWithQuestions({ questionCount: 4 });
    const result = await examsService.getExamById(exam._id.toString());
    expect(result.questionCount).toBe(4);
  });
});
