export class AuthError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid credentials") {
    super(message, "INVALID_CREDENTIALS");
  }
}

export class EmailAlreadyInUseError extends AuthError {
  constructor(message = "Email already in use") {
    super(message, "EMAIL_IN_USE");
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message = "Session expired") {
    super(message, "SESSION_EXPIRED");
  }
}

export class SessionInvalidError extends AuthError {
  constructor(message = "Session invalid") {
    super(message, "SESSION_INVALID");
  }
}
