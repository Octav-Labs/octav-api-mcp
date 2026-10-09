import { z } from 'zod';
import { ConfirmationRequiredError, ValidationError } from '../api/errors.js';

// Returns the schema's output type, so fields with defaults are never undefined
export function validateInput<S extends z.ZodTypeAny>(schema: S, data: unknown): z.output<S> {
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

// Refuse a tool call that deletes or overwrites account data unless confirm: true was
// passed, matching the octav CLI's --yes. The model gets the effect spelled out first.
export function requireConfirmation(confirm: boolean | undefined, effect: string): void {
  if (confirm !== true) {
    throw new ConfirmationRequiredError(`${effect}. Call again with confirm: true to confirm.`);
  }
}
