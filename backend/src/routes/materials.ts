import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as materialsController from '../controllers/materials.controller';

export const materialsRouter = Router();

materialsRouter.get('/', authenticateToken, materialsController.getMaterials);
materialsRouter.get('/:id', authenticateToken, materialsController.getMaterialById);
