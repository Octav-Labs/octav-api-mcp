export class OctavAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'OctavAPIError';
  }
}

export class AuthenticationError extends OctavAPIError {
  constructor(message = 'Invalid API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class InsufficientCreditsError extends OctavAPIError {
  constructor(message = 'Insufficient credits', public creditsNeeded?: number) {
    super(message, 402);
    this.name = 'InsufficientCreditsError';
  }
}

export class RateLimitError extends OctavAPIError {
  constructor(message = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}
