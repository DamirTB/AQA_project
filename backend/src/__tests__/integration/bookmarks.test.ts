// backend/src/__tests__/integration/bookmarks.test.ts
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, createExamWithQuestions, authHeader } from '../helpers';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/bookmarks', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/bookmarks');
    expect(res.status).toBe(401);
  });

  it('returns an empty array when user has no bookmarks', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/bookmarks')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns the user\'s bookmarks with exam details', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions({ title: 'Saved Exam' });

    await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .get('/api/bookmarks')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].examTitle).toBe('Saved Exam');
  });

  it('does not return another user\'s bookmarks', async () => {
    const user1 = await createUser({ username: 'bm1', email: 'bm1@example.com' });
    const user2 = await createUser({ username: 'bm2', email: 'bm2@example.com' });
    const exam = await createExamWithQuestions();

    await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user1.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .get('/api/bookmarks')
      .set(authHeader(user2.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/bookmarks', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/bookmarks').send({ examId: 'any' });
    expect(res.status).toBe(401);
  });

  it('creates a bookmark and returns 201', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const res = await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.examId.toString()).toBe(exam._id.toString());
  });

  it('returns 409 when the same exam is bookmarked twice', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    expect(res.status).toBe(409);
  });

  it('returns 400 for an invalid exam ID', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: 'bad-id' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/bookmarks/:examId', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).delete('/api/bookmarks/someid');
    expect(res.status).toBe(401);
  });

  it('removes a bookmark and returns 200', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    await request(app)
      .post('/api/bookmarks')
      .set(authHeader(user.token))
      .send({ examId: exam._id.toString() });

    const res = await request(app)
      .delete(`/api/bookmarks/${exam._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);

    const listRes = await request(app)
      .get('/api/bookmarks')
      .set(authHeader(user.token));

    expect(listRes.body).toEqual([]);
  });

  it('returns 404 when bookmark does not exist', async () => {
    const user = await createUser();
    const exam = await createExamWithQuestions();

    const res = await request(app)
      .delete(`/api/bookmarks/${exam._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid exam ID format', async () => {
    const user = await createUser();

    const res = await request(app)
      .delete('/api/bookmarks/not-valid-id')
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });
});
