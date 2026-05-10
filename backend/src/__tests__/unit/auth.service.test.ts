// backend/src/__tests__/unit/auth.service.test.ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connect, disconnect, clearCollections } from '../testDb';
import { createUser } from '../helpers';
import * as authService from '../../services/auth.service';
import * as emailService from '../../services/email.service';
import { ServiceError } from '../../errors/ServiceError';
import { User } from '../../models/User';

beforeAll(connect);
afterAll(disconnect);
afterEach(clearCollections);

describe('authService.register', () => {
  it('creates a new user and returns a token and user object', async () => {
    const result = await authService.register('alice', 'alice@example.com', 'secret99');

    expect(result.token).toBeTruthy();
    expect(result.user.username).toBe('alice');
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.id).toBeDefined();
  });

  it('lowercases the email on registration', async () => {
    const result = await authService.register('bob', 'BOB@EXAMPLE.COM', 'pass1234');
    expect(result.user.email).toBe('bob@example.com');
  });

  it('trims whitespace from username', async () => {
    const result = await authService.register('  carol  ', 'carol@example.com', 'pass1234');
    expect(result.user.username).toBe('carol');
  });

  it('throws 409 when email is already registered', async () => {
    await authService.register('dave', 'dave@example.com', 'pass1234');

    await expect(authService.register('dave2', 'dave@example.com', 'pass1234')).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already exists',
    });
  });

  it('throws 409 when username is already taken', async () => {
    await authService.register('eve', 'eve@example.com', 'pass1234');

    await expect(authService.register('eve', 'eve2@example.com', 'pass1234')).rejects.toMatchObject({
      statusCode: 409,
      message: 'Username already exists',
    });
  });

  it('does not store the plaintext password', async () => {
    const result = await authService.register('frank', 'frank@example.com', 'plainpass');
    expect((result.user as any).password).toBeUndefined();
    expect((result.user as any).passwordHash).toBeUndefined();
  });
});

describe('authService.login', () => {
  beforeEach(async () => {
    await authService.register('grace', 'grace@example.com', 'correct-password');
  });

  it('returns a token and user when credentials are valid', async () => {
    const result = await authService.login('grace@example.com', 'correct-password');

    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe('grace@example.com');
    expect(result.user.username).toBe('grace');
  });

  it('is case-insensitive on email', async () => {
    const result = await authService.login('GRACE@EXAMPLE.COM', 'correct-password');
    expect(result.user.email).toBe('grace@example.com');
  });

  it('throws 401 when password is wrong', async () => {
    await expect(authService.login('grace@example.com', 'wrong-password')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws 401 when email does not exist', async () => {
    await expect(authService.login('nobody@example.com', 'any-password')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('throws a ServiceError (not a generic Error) on failure', async () => {
    await expect(authService.login('nobody@example.com', 'pass')).rejects.toBeInstanceOf(ServiceError);
  });
});

describe('authService.forgotPassword', () => {
  let sendSpy: jest.SpiedFunction<typeof emailService.sendPasswordResetEmail>;

  beforeEach(() => {
    sendSpy = jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('does not send email when email is not registered', async () => {
    await authService.forgotPassword('missing@example.com');
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('stores a hashed token and sends email with raw token when user exists', async () => {
    await authService.register('hpuser', 'hp@example.com', 'password123');
    await authService.forgotPassword('hp@example.com');

    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [toEmail, rawToken] = sendSpy.mock.calls[0];
    expect(toEmail).toBe('hp@example.com');
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);

    const user = await User.findOne({ email: 'hp@example.com' });
    expect(user?.resetPasswordToken).toBe(crypto.createHash('sha256').update(rawToken).digest('hex'));
    expect(user?.resetPasswordExpires).toBeDefined();
    expect(user!.resetPasswordExpires!.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('authService.resetPassword', () => {
  let sendSpy: jest.SpiedFunction<typeof emailService.sendPasswordResetEmail>;

  beforeEach(() => {
    sendSpy = jest.spyOn(emailService, 'sendPasswordResetEmail').mockResolvedValue(undefined);
  });

  afterEach(() => {
    sendSpy.mockRestore();
  });

  it('updates password and clears reset fields when token is valid', async () => {
    await authService.register('rpuser', 'rp@example.com', 'oldpassword');
    await authService.forgotPassword('rp@example.com');
    const rawToken = sendSpy.mock.calls[0][1] as string;

    await authService.resetPassword(rawToken, 'newpassword123');

    const user = await User.findOne({ email: 'rp@example.com' });
    expect(user?.resetPasswordToken).toBeUndefined();
    expect(user?.resetPasswordExpires).toBeUndefined();
    expect(await bcrypt.compare('newpassword123', user!.passwordHash)).toBe(true);
  });

  it('throws 400 for invalid token', async () => {
    await expect(authService.resetPassword('not-a-valid-token-hex', 'newpass12')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Invalid or expired reset token',
    });
  });

  it('throws 400 when token has expired', async () => {
    await authService.register('exuser', 'ex@example.com', 'password123');
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    await User.updateOne(
      { email: 'ex@example.com' },
      { resetPasswordToken: hashed, resetPasswordExpires: new Date(Date.now() - 1000) },
    );

    await expect(authService.resetPassword(raw, 'newpass12')).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
