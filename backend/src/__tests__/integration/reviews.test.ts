// backend/src/__tests__/integration/reviews.test.ts
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions, createCompletedAttempt, authHeader } from '../helpers';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('POST /api/exams/:id/reviews', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/exams/someid/reviews')
      .send({ rating: 5, comment: 'Great' });
    expect(res.status).toBe(401);
  });

  it('returns 201 with review data after a completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 4, comment: 'Very helpful exam!' });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(4);
    expect(res.body.comment).toBe('Very helpful exam!');
  });

  it('returns 403 when user has no completed attempt', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 3, comment: 'Has not attempted' });

    expect(res.status).toBe(403);
  });

  it('returns 409 when user tries to review the same exam twice', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 5, comment: 'First review' });

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 2, comment: 'Second review attempt' });

    expect(res.status).toBe(409);
  });

  it('returns 400 when rating is missing', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ comment: 'No rating provided' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is out of range', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 10, comment: 'Out of range rating' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when comment is empty', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    const res = await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 4, comment: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/exams/:id/reviews', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/exams/someid/reviews');
    expect(res.status).toBe(401);
  });

  it('returns reviews for an exam with author username', async () => {
    const user = await createUser({ username: 'reviewer', email: 'rv@example.com' });
    const exam = await createExamWithQuestions();
    await createCompletedAttempt(user._id, exam);

    await request(app)
      .post(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token))
      .send({ rating: 5, comment: 'Excellent!' });

    const res = await request(app)
      .get(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].username).toBe('reviewer');
    expect(res.body[0].rating).toBe(5);
  });

  it('returns an empty array when the exam has no reviews', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const res = await request(app)
      .get(`/api/exams/${exam._id}/reviews`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 400 for an invalid exam ID', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/exams/bad-id/reviews')
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });
});
