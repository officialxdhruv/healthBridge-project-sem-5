/** Password hashing contract. Swappable (e.g. bcrypt, argon2) without touching consumers. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
