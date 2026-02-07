import { z } from 'zod';
import { ValidationError } from '../api/errors.js';

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new ValidationError(`Validation failed: ${messages}`, error.errors);
    }
    throw error;
  }
}
