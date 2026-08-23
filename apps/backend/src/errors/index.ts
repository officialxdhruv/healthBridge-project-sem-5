export class CustomError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends CustomError {
  constructor(message = "Validation failed") {
    super(message, 400, "VALIDATION_FAILED");
  }
}

export class EntityNotFoundError extends CustomError {
  constructor(message = "Not found") {
    super(message, 404, "NOT_FOUND");
  }
}
