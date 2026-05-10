// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ServiceError } from '../errors/ServiceError';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body;
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
  } else if (username.trim().length < 3 || username.trim().length > 30) {
    errors.push('Username must be between 3 and 30 characters');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  try {
    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string') errors.push('Email is required');
  if (!password || typeof password !== 'string') errors.push('Password is required');

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).json({ error: 'Validation failed', details: ['A valid email is required'] });
    return;
  }

  try {
    await authService.forgotPassword(email);
    // Always return 200 so we don't reveal whether the email is registered
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body;
  const errors: string[] = [];

  if (!token || typeof token !== 'string') errors.push('Reset token is required');
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  try {
    await authService.resetPassword(token, password);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
