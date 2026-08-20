/** Thrown by adapters when a unique email already exists (Mongo E11000 at write time). */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already in use");
    this.name = "DuplicateEmailError";
  }
}
