import { compare, hash } from "bcrypt-ts";
import type { PasswordHasher } from "./hasher";

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds: number;

  constructor(rounds = 10) {
    this.rounds = rounds;
  }

  hash(plain: string): Promise<string> {
    return hash(plain, this.rounds);
  }

  verify(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
