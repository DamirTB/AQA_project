import { connect, disconnect, clearCollections } from '../testDb';
import { createUser } from '../helpers';
import * as authService from '../../services/auth.service';
import { ServiceError } from '../../errors/ServiceError';

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
