import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, authHeader } from '../helpers';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/forum/topics', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/forum/topics');
    expect(res.status).toBe(401);
  });

  it('returns an empty array when there are no topics', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/forum/topics')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all topics with authorUsername and commentCount', async () => {
    const user = await createUser({ username: 'forumer', email: 'forumer@example.com' });

    await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'First Topic', body: 'This is the body of the first forum topic.' });

    await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Second Topic', body: 'This is the body of the second forum topic.' });

    const res = await request(app)
      .get('/api/forum/topics')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('authorUsername', 'forumer');
    expect(res.body[0]).toHaveProperty('commentCount', 0);
  });
});

describe('POST /api/forum/topics', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/forum/topics')
      .send({ title: 'Hi', body: 'Body text here for this topic.' });
    expect(res.status).toBe(401);
  });

  it('creates a topic and returns 201 with topic data', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'New Topic Title', body: 'The body of this new forum topic.' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('New Topic Title');
  });

  it('returns 400 when title is too short (< 3 chars)', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'ab', body: 'Body text for this short title topic.' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is too short (< 10 chars)', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Valid Title', body: 'Short' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when title or body is missing', async () => {
    const user = await createUser();

    const res = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Only Title' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/forum/topics/:id', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/forum/topics/someid');
    expect(res.status).toBe(401);
  });

  it('returns the topic with its comments', async () => {
    const user = await createUser();

    const created = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Topic With Comments', body: 'This is the body of the topic with comments.' });

    await request(app)
      .post(`/api/forum/topics/${created.body.id}/comments`)
      .set(authHeader(user.token))
      .send({ body: 'A comment on this topic' });

    const res = await request(app)
      .get(`/api/forum/topics/${created.body.id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Topic With Comments');
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].body).toBe('A comment on this topic');
  });

  it('returns 404 when topic does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/forum/topics/${fakeId}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid topic ID', async () => {
    const user = await createUser();

    const res = await request(app)
      .get('/api/forum/topics/bad-id')
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });
});

describe('POST /api/forum/topics/:id/comments', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/forum/topics/someid/comments')
      .send({ body: 'A comment' });
    expect(res.status).toBe(401);
  });

  it('creates a comment and returns 201 with comment data', async () => {
    const user = await createUser();

    const topic = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Commentable Topic', body: 'The body of this commentable topic.' });

    const res = await request(app)
      .post(`/api/forum/topics/${topic.body.id}/comments`)
      .set(authHeader(user.token))
      .send({ body: 'My first comment here' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.body).toBe('My first comment here');
  });

  it('returns 400 when comment body is empty', async () => {
    const user = await createUser();

    const topic = await request(app)
      .post('/api/forum/topics')
      .set(authHeader(user.token))
      .send({ title: 'Empty Comment Topic', body: 'The body of this empty comment topic.' });

    const res = await request(app)
      .post(`/api/forum/topics/${topic.body.id}/comments`)
      .set(authHeader(user.token))
      .send({ body: '' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when the topic does not exist', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/forum/topics/${fakeId}/comments`)
      .set(authHeader(user.token))
      .send({ body: 'Orphan comment for a missing topic' });

    expect(res.status).toBe(404);
  });
});
