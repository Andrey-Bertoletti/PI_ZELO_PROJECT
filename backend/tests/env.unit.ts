// Carrega variáveis mínimas necessárias para que `config/env.ts` não derrube os testes unitários.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://localhost:5432/zero_test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'unit_test_access_secret_at_least_32_chars_long_xx';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'unit_test_refresh_secret_at_least_32_chars_long_xx';
process.env.BCRYPT_SALT_ROUNDS = '4';
