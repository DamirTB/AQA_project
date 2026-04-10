import mongoose from 'mongoose';
import { LearningMaterial } from '../models/LearningMaterial';
import { ServiceError } from '../errors/ServiceError';

export async function getMaterials(topic?: string) {
  const filter: Record<string, unknown> = {};

  if (topic && topic.trim().length > 0) {
    filter.topic = topic.trim();
  }

  const materials = await LearningMaterial.find(filter).sort({ createdAt: -1 }).lean();

  return materials.map((m) => ({
    id: m._id,
    title: m.title,
    topic: m.topic,
    level: m.level,
    content: m.content,
    createdAt: m.createdAt,
  }));
}

export async function getMaterialById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ServiceError(400, 'Invalid material ID format');
  }

  const material = await LearningMaterial.findById(id).lean();
  if (!material) {
    throw new ServiceError(404, 'Learning material not found');
  }

  return {
    id: material._id,
    title: material.title,
    topic: material.topic,
    level: material.level,
    content: material.content,
    createdAt: material.createdAt,
  };
}
