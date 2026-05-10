// backend/src/__tests__/integration/auth.password.test.ts
import request from 'supertest';
import app from '../../app';
import { connect, disconnect, clearCollections } from '../testDb';
import * as emailService from '../../services/email.service';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

const REGISTER_URL = '/api/auth/register';
const FORGOT_URL = '/api/auth/forgot-password';
const RESET_URL = '/api/auth/reset-password';
const LOGIN_URL = '/api/auth/login';

describe('POST /api/auth/forgot-password', () => {
  let sendSpy: jest.SpiedFunction<typeof emailService.sendPasswordResetEmail>;

  beforeEach(() => {
    sendSpy = jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('returns 200 and generic message for registered email', async () => {
    await request(app).post(REGISTER_URL).send({
      username: 'fp1',
      email: 'fp1@example.com',
      password: 'password123',
    });

    const res = await request(app).post(FORGOT_URL).send({ email: 'fp1@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('reset link');
    expect(sendSpy).toHaveBeenCalled();
  });

  it('returns 200 without sending email for unknown email', async () => {
    const res = await request(app).post(FORGOT_URL).send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app).post(FORGOT_URL).send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  let sendSpy: jest.SpiedFunction<typeof emailService.sendPasswordResetEmail>;

  beforeEach(() => {
    sendSpy = jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('resets password and allows login with new password', async () => {
    await request(app).post(REGISTER_URL).send({
      username: 'rp1',
      email: 'rp1@example.com',
      password: 'oldpassword',
    });

    await request(app).post(FORGOT_URL).send({ email: 'rp1@example.com' });
    const rawToken = sendSpy.mock.calls[0][1] as string;

    const resetRes = await request(app).post(RESET_URL).send({
      token: rawToken,
      password: 'brandnewpass',
    });
    expect(resetRes.status).toBe(200);

    const loginFail = await request(app).post(LOGIN_URL).send({
      email: 'rp1@example.com',
      password: 'oldpassword',
    });
    expect(loginFail.status).toBe(401);

    const loginOk = await request(app).post(LOGIN_URL).send({
      email: 'rp1@example.com',
      password: 'brandnewpass',
    });
    expect(loginOk.status).toBe(200);
    expect(loginOk.body.token).toBeTruthy();
  });

  it('returns 400 for invalid token', async () => {
    const res = await request(app).post(RESET_URL).send({
      token: 'deadbeef'.repeat(8),
      password: 'newpass12',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post(RESET_URL).send({
      token: 'a'.repeat(64),
      password: 'short',
    });
    expect(res.status).toBe(400);
  });
});
