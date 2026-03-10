import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  constructor(
    message: string = "Internal server error",
    private statusCode: ContentfulStatusCode = 500,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  getStatusCode(): ContentfulStatusCode {
    return this.statusCode;
  }
}

export class DbConnectionError extends AppError {
  constructor(message: string = "Failed to connect to the database") {
    super(message, 503);
  }
}

export class DbQueryError extends AppError {
  constructor(message: string = "Database query failed") {
    super(message, 500);
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Auth failed") {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class MissingEnvVarError extends AppError {
  constructor(variableName: string) {
    super(`${variableName} is missing`, 500);
  }
}

export class JwtSignError extends AppError {
  constructor(message: string = "Unable to sign JWT") {
    super(message, 503);
  }
}

export class NotProvidedError extends AppError {
  constructor(message: string = "Required value not provided") {
    super(message, 400);
  }
}

export class IllegalArgumentError extends AppError {
  constructor(message: string = "Illegal argument provided") {
    super(message, 400);
  }
}
