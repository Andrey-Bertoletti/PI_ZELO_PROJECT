# ZERO Backend

API REST do ZERO Marketplace.

## Estrutura

```
src/
  app.ts        bootstrap Express (testável)
  server.ts     entrada de produção (listen)
  config/       env (Zod), prisma
  middleware/   auth, errorHandler, rateLimit, validate
  validators/   schemas Zod
  services/     regras de negócio
  controllers/  adaptadores HTTP
  routes/       rotas Express
  utils/        errors, logger, password, tokens
prisma/
  schema.prisma
  seed.ts
tests/
  unit/         sem banco
  integration/  com banco (Supertest)
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | hot-reload com `tsx watch` |
| `npm run build` | compila TS para `dist/` |
| `npm start` | roda o build de produção |
| `npm run prisma:migrate` | cria migrações em dev |
| `npm run prisma:deploy` | aplica migrações em prod |
| `npm run prisma:seed` | popula com dados de exemplo |
| `npm run prisma:studio` | UI gráfica do Prisma |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | unit + integration |
| `npm run test:unit` | só unitários |
| `npm run test:integration` | só integração (precisa de Postgres + `TEST_DATABASE_URL`) |

## Setup e troubleshooting

Veja `docs/SETUP.md` na raiz do repositório. Configure `.env` antes de qualquer coisa — o servidor não sobe sem `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (≥ 32 chars cada) e `DATABASE_URL`.

## Convenção de erros

```json
{ "error": { "code": "CODE", "message": "Mensagem em PT-BR", "details": {} } }
```

Códigos: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.
