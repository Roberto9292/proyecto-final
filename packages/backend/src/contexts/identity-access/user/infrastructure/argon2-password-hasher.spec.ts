import { Argon2PasswordHasher } from './argon2-password-hasher';

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('should be defined', () => {
    expect(hasher).toBeDefined();
  });

  it('produces an argon2id hash instead of storing the plain password', async () => {
    const hash = await hasher.hash('password123');

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain('password123');
  });

  it('produces a different hash for the same password, because it is salted', async () => {
    const [first, second] = await Promise.all([
      hasher.hash('password123'),
      hasher.hash('password123'),
    ]);

    expect(first).not.toBe(second);
  });

  it('verifies the password that produced the hash', async () => {
    const hash = await hasher.hash('password123');

    await expect(hasher.verify(hash, 'password123')).resolves.toBe(true);
  });

  it('rejects a password that does not match', async () => {
    const hash = await hasher.hash('password123');

    await expect(hasher.verify(hash, 'otra-clave')).resolves.toBe(false);
  });
});
