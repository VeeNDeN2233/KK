# CK Web (Next.js)

## Local development

### Prerequisites
- Node.js 18.18+
- Docker Desktop (for local Postgres)

### Setup
1) Install deps (monorepo root):

```bash
npm install
```

2) Create env file:
- Copy [`apps/web/.env.example`](./.env.example) → `apps/web/.env.local`
- Ensure `NEXTAUTH_SECRET` is not the placeholder value

3) Start Postgres (monorepo root):

```bash
npm run db:up
```

If this fails on Windows, make sure Docker Desktop is running.

4) Apply Prisma migrations:

```bash
npm run db:migrate
```

5) Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Notes:
- We map Docker Postgres to host port `5433` to avoid conflicts with an existing local Postgres on `5432`.

### Useful commands
- `npm run db:logs` — tail Postgres logs
- `npm run db:reset` — drop DB volume and re-create (dev only)
- `npm run db:studio` — Prisma Studio

### Messages (MVP)
- UI: `/messages` (список + создание диалога), `/messages/[conversationId]` (тред)
- `POST /api/chat/create` — body `{ "usernameOrEmail": "@user" | "email@..." }` → `{ conversationId }`
- `GET|POST /api/chat/[conversationId]/messages` — получить сообщения / отправить `{ "text": "..." }`

### Публичные профили и поиск
- Профиль: `/u/[username]` — только поля `@username`, имя, город/страна, флаги обмена; **email не показывается**.
- Если у пользователя **нет** `username`, публичный URL `/u/...` для него недоступен (поиск таких записей не отдаёт).
- Поиск: `/users` (только для залогиненных), API `GET /api/users/search?q=` (минимум 2 символа, rate limit).
