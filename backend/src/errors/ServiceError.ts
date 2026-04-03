// backend/src/errors/ServiceError.ts
export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
