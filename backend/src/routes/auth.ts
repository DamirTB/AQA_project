import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
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

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      res.status(409).json({ error: `${field} already exists` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, signOptions);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email is required');
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      res.status(400).json({ error: 'Validation failed', details: errors });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, signOptions);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
