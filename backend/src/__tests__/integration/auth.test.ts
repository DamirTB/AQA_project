import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

const REGISTER_URL = '/api/auth/register';
const LOGIN_URL = '/api/auth/login';

describe('POST /api/auth/register', () => {
  it('returns 201 with token and user on valid input', async () => {
    const res = await request(app).post(REGISTER_URL).send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('alice');
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 400 when username is too short (< 3 chars)', async () => {
    const res = await request(app).post(REGISTER_URL).send({
      username: 'ab',
      email: 'short@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 400 when username is too long (> 30 chars)', async () => {
    const res = await request(app).post(REGISTER_URL).send({
      username: 'a'.repeat(31),
      email: 'long@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app).post(REGISTER_URL).send({
      username: 'validuser',
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short (< 6 chars)', async () => {
    const res = await request(app).post(REGISTER_URL).send({
      username: 'validuser',
      email: 'valid@example.com',
      password: 'abc',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post(REGISTER_URL).send({ username: 'onlyname' });

    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post(REGISTER_URL).send({
      username: 'first',
      email: 'dup@example.com',
      password: 'password123',
    });

    const res = await request(app).post(REGISTER_URL).send({
      username: 'second',
      email: 'dup@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  it('returns 409 when username is already taken', async () => {
    await request(app).post(REGISTER_URL).send({
      username: 'taken',
      email: 'taken1@example.com',
      password: 'password123',
    });

    const res = await request(app).post(REGISTER_URL).send({
      username: 'taken',
      email: 'taken2@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(REGISTER_URL).send({
      username: 'loginuser',
      email: 'login@example.com',
      password: 'correct-pass',
    });
  });

  it('returns 200 with token and user on valid credentials', async () => {
    const res = await request(app).post(LOGIN_URL).send({
      email: 'login@example.com',
      password: 'correct-pass',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('loginuser');
  });

  it('returns 401 when password is wrong', async () => {
    const res = await request(app).post(LOGIN_URL).send({
      email: 'login@example.com',
      password: 'wrong-pass',
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 when email does not exist', async () => {
    const res = await request(app).post(LOGIN_URL).send({
      email: 'nobody@example.com',
      password: 'any-pass',
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post(LOGIN_URL).send({ password: 'pass123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app).post(LOGIN_URL).send({ email: 'login@example.com' });
    expect(res.status).toBe(400);
  });
});
