import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser, authHeader } from '../helpers';
import { LearningMaterial } from '../../models/LearningMaterial';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('GET /api/materials', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/materials');
    expect(res.status).toBe(401);
  });

  it('returns all learning materials', async () => {
    const user = await createUser();
    await LearningMaterial.create({
      title: 'Linear Equations Basics',
      topic: 'Math',
      level: 'beginner',
      content: 'Linear equations are equations of first degree. Solve by isolating the variable.',
    });
    await LearningMaterial.create({
      title: 'Quadratic Functions',
      topic: 'Math',
      level: 'intermediate',
      content: 'Quadratic functions have the form ax^2 + bx + c and graph as parabolas.',
    });

    const res = await request(app)
      .get('/api/materials')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('topic');
  });

  it('filters materials by topic', async () => {
    const user = await createUser();
    await LearningMaterial.create({
      title: 'Triangles and Angles',
      topic: 'Math',
      level: 'beginner',
      content: 'A triangle has three sides. The sum of interior angles is always 180 degrees.',
    });
    await LearningMaterial.create({
      title: 'Academic Reading Strategy',
      topic: 'English',
      level: 'intermediate',
      content: 'Skim for structure, then scan for details and signal words in each paragraph.',
    });

    const res = await request(app)
      .get('/api/materials?topic=Math')
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].topic).toBe('Math');
    expect(res.body[0].title).toBe('Triangles and Angles');
  });
});

describe('GET /api/materials/:id', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/materials/some-id');
    expect(res.status).toBe(401);
  });

  it('returns one learning material by id', async () => {
    const user = await createUser();
    const material = await LearningMaterial.create({
      title: 'Functions and Graphs',
      topic: 'Math',
      level: 'intermediate',
      content: 'Functions map each input to exactly one output. Graphs visualize these relationships.',
    });

    const res = await request(app)
      .get(`/api/materials/${material._id}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body.id.toString()).toBe(material._id.toString());
    expect(res.body.title).toBe('Functions and Graphs');
  });

  it('returns 400 for invalid material id format', async () => {
    const user = await createUser();
    const res = await request(app)
      .get('/api/materials/not-valid-id')
      .set(authHeader(user.token));

    expect(res.status).toBe(400);
  });

  it('returns 404 for missing material', async () => {
    const user = await createUser();
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/materials/${fakeId}`)
      .set(authHeader(user.token));

    expect(res.status).toBe(404);
  });
});
