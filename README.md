<<<<<<< HEAD
# PI_ZELO_PROJECT
Zelo é uma plataforma SaaS moderna para automação, gestão de processos e produtividade, com autenticação segura, multi-tenant, integração com IA, dashboards inteligentes e arquitetura escalável usando Next.js e Supabase.
=======
# ZERO Marketplace

Marketplace mobile de serviços locais (encanador, eletricista, reformas, limpeza, etc.) com prestadores verificados, orçamento inteligente e modo emergência 24h.

Implementação em **monorepo**:

- **`mobile/`** — App React Native (Expo) + TypeScript — roda em iOS, Android e Web
- **`backend/`** — API Node.js + TypeScript + Express + Prisma
- **PostgreSQL** — banco relacional

Baseado no design `design-package/zelo-project/` (handoff Claude Design).

> Instruções de instalação, credenciais de desenvolvimento, fluxo de testes e checklist de segurança ficam em [`docs/SETUP.md`](./docs/SETUP.md) e [`docs/SECURITY.md`](./docs/SECURITY.md). **Não comite o arquivo `.env`** — use sempre `.env.example` como base.

---

## Telas implementadas

### Do design original (7 telas)
1. **Home / Marketplace** — busca, banner Orçamento Inteligente, botão SOS, 8 categorias, profissionais em alta, próximos
2. **Lista de profissionais** — filtros + ordenação
3. **Perfil do profissional** — KYC, stats, preços, portfolio, reviews, CTA fixo
4. **Orçamento Inteligente** — fluxo multi-step com estimativa final
5. **Emergência** — botão SOS pulsante + estado de matching com ETA
6. **Painel do prestador** — ganhos semanais (gráfico), estatísticas, agenda
7. **Lista de mensagens / chat**

### Extras (telas funcionais adicionais)
- **Welcome / Login / Cadastro** — fluxo completo com validação de senha
- **Detalhes do agendamento** — aceitar, iniciar, concluir, cancelar
- **Chat 1:1** — com polling de mensagens
- **Notificações** — listar, marcar como lida
- **Pagamento** — PIX / Cartão (mock confirmação)
- **Configurações** — notificações, privacidade, 2FA, **alternar modo claro/escuro**

### Tema claro e escuro
Toggle disponível em **Perfil → Configurações → Aparência**. A preferência fica salva no dispositivo (SecureStore / AsyncStorage). Por padrão acompanha o tema do sistema.

### Onde rodar
- **Android** — Expo Go ou emulador
- **iOS** — Expo Go ou simulador
- **Web** — `npm run web` (modo desenvolvedor — abre em `http://localhost:8081`)

Detalhes em [`docs/SETUP.md`](./docs/SETUP.md).

---

## Stack

| Camada      | Tecnologias |
|-------------|-------------|
| Mobile      | React Native 0.74, Expo 51, React Navigation v6, Axios, Lucide, React Native SVG, expo-secure-store, react-native-web |
| Backend     | Node.js 20+, Express 4, TypeScript 5, Prisma 5, Zod, Pino |
| Banco       | PostgreSQL 14+ |
| Segurança   | bcryptjs, JWT (access + refresh com rotação), Helmet, CORS, express-rate-limit, hpp, validação Zod |
| Testes      | Jest, Supertest |

---

## Endpoints principais

| Método | Caminho | Auth | Descrição |
|--------|---------|------|-----------|
| `POST` | `/auth/register`         | público | Cria conta CLIENT ou PROVIDER |
| `POST` | `/auth/login`            | público | Retorna access + refresh token |
| `POST` | `/auth/refresh`          | público | Rotaciona o refresh token |
| `POST` | `/auth/logout`           | público | Revoga refresh token |
| `GET`  | `/auth/me`               | bearer  | Dados do usuário logado |
| `GET`  | `/providers`             | público | Lista profissionais (filtros + paginação) |
| `GET`  | `/providers/categories`  | público | Lista categorias |
| `GET`  | `/providers/:id`         | público | Perfil completo |
| `POST` | `/bookings`              | client  | Cria agendamento |
| `GET`  | `/bookings/mine`         | bearer  | Lista agendamentos do usuário |
| `PATCH`| `/bookings/:id/status`   | bearer  | Mudar status (RBAC por papel) |
| `POST` | `/reviews`               | client  | Avaliar após COMPLETED |
| `GET`  | `/reviews/provider/:id`  | público | Reviews de um profissional |
| `GET`  | `/messages`              | bearer  | Conversas agrupadas |
| `GET`  | `/messages/:userId`      | bearer  | Thread + marcar como lido |
| `POST` | `/messages`              | bearer  | Enviar mensagem |
| `POST` | `/budget/estimate`       | opcional| Estima preço para uma categoria |
| `GET`  | `/notifications`         | bearer  | Notificações do usuário |
| `POST` | `/notifications/read-all`| bearer  | Marcar todas como lidas |

---

## Estrutura do repositório

```
PI/
├── backend/
│   ├── prisma/         schema + seed
│   ├── src/            config, middleware, validators, services, controllers, routes
│   ├── tests/
│   │   ├── unit/       (sem banco — validações, hashing, tokens, budget)
│   │   └── integration/(com banco — auth, providers, bookings, security, budget)
│   └── README.md
├── mobile/
│   ├── src/
│   │   ├── api/        clients axios
│   │   ├── components/ átomos (Avatar, Badge, Button, Input, ProCard...)
│   │   ├── contexts/   AuthContext, ThemeContext
│   │   ├── navigation/ stacks + tabs
│   │   ├── screens/    17 telas
│   │   ├── theme/      paletas claro/escuro + tokens
│   │   └── types/      tipos compartilhados
│   └── README.md
├── docs/
│   ├── SETUP.md        instalação detalhada (incluindo Postgres nativo)
│   └── SECURITY.md     checklist + boas práticas
└── README.md           este arquivo
```

---

## Próximos passos sugeridos

- Geolocalização real (PostGIS + `earth_distance`) para "Próximos a você"
- WebSocket / Server-Sent Events para chat e notificações em tempo real
- Integração de pagamento real (gateway PIX, Stripe, Mercado Pago)
- Upload de imagens (S3, Vercel Blob, Cloudflare R2) para portfolio e KYC
- Workflow de KYC com prova de identidade (Stripe Identity, Idwall)
- Testes E2E no app (Maestro ou Detox)
>>>>>>> 71f541d (Initial commit: PI ZELO Project structure and documentation)
