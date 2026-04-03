// backend/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { ServiceError } from '../errors/ServiceError';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

export interface AuthResult {
  token: string;
  user: { id: unknown; username: string; email: string };
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
  });

  if (existing) {
    const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
    throw new ServiceError(409, `${field} already exists`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase(),
    passwordHash,
  });

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, signOptions);
  return { token, user: { id: user._id, username: user.username, email: user.email } };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ServiceError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ServiceError(401, 'Invalid email or password');

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, signOptions);
  return { token, user: { id: user._id, username: user.username, email: user.email } };
}
