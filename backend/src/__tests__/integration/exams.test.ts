import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createCategory, createExamWithQuestions, authHeader } from '../helpers';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/exams/categories', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/exams/categories');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/exams/categories')
      .set('Authorization', 'InvalidToken');
    expect(res.status).toBe(401);
  });

  it('returns 200 with an array of categories', async () => {
    const user = await createUser();
    await createCategory({ name: 'Science' });
    await createCategory({ name: 'Math' });

    const res = await request(app)
      .get('/api/exams/categories')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('id');
  });

  it('returns an empty array when no categories exist', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/exams/categories')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/exams', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/exams');
    expect(res.status).toBe(401);
  });

  it('returns 200 with all exams', async () => {
    const user = await createUser();
    await createExamWithQuestions({ title: 'Exam 1' });
    await createExamWithQuestions({ title: 'Exam 2' });

    const res = await request(app)
      .get('/api/exams')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('questionCount');
  });

  it('filters exams by category when ?category= is provided', async () => {
    const user = await createUser();
    const cat = await createCategory({ name: 'Filtered Cat' });
    await createExamWithQuestions({ title: 'Filtered Exam', categoryId: cat._id as mongoose.Types.ObjectId });
    await createExamWithQuestions({ title: 'Other Exam' });

    const res = await request(app)
      .get(`/api/exams?category=${cat._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Filtered Exam');
  });

  it('returns all exams when category filter is invalid', async () => {
    const user = await createUser();
    await createExamWithQuestions({ title: 'Any Exam' });

    const res = await request(app)
      .get('/api/exams?category=not-valid')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/exams/:id', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/exams/someId');
    expect(res.status).toBe(401);
  });

  it('returns 200 with exam details and questions', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 3 });

    const res = await request(app)
      .get(`/api/exams/${exam._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(exam.title);
    expect(res.body.questions).toHaveLength(3);
  });

  it('does not expose correctOption in questions', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ questionCount: 2 });

    const res = await request(app)
      .get(`/api/exams/${exam._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    res.body.questions.forEach((q: any) => {
      expect(q).not.toHaveProperty('correctOption');
    });
  });

  it('returns 400 for an invalid ObjectId', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/exams/not-valid')
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });

  it('returns 404 when exam does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/exams/${fakeId}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(404);
  });
});
