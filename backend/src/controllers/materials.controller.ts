import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as materialsService from '../services/materials.service';
import { ServiceError } from '../errors/ServiceError';

export async function getMaterials(req: AuthRequest, res: Response): Promise<void> {
  try {
    const topic = typeof req.query.topic === 'string' ? req.query.topic : undefined;
    const materials = await materialsService.getMaterials(topic);
    res.json(materials);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching learning materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMaterialById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const material = await materialsService.getMaterialById(req.params.id as string);
    res.json(material);
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error fetching learning material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
