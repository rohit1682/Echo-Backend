# Echo Backend

Scalable NestJS + MongoDB API for **Echo**, a personal finance & life-management app.
This repo currently implements the **foundation + Finance vertical slice + Advisor v1**; every
other domain is fully modelled and stubbed behind clear extension points.

## Stack

- **NestJS 11** (modular, DI) + **TypeScript**
- **MongoDB** via **Mongoose**
- **Custom JWT auth** (access + rotating refresh), Google Sign-In, pluggable phone-OTP
- **Echo Advisor**: free deterministic rules engine + optional Claude LLM layer
- **Expo Push** + `@nestjs/schedule` for reminders (scaffolded)

## Getting started

```bash
npm install
cp .env.example .env      # then edit values
npm run seed              # optional: demo user + sample data
npm run start:dev
```

The API listens on `http://localhost:4000/api` by default. Health check: `GET /api/health`.

You need a MongoDB instance. Either:

- **Local:** install MongoDB and use `MONGODB_URI=mongodb://127.0.0.1:27017/echo`, or
- **Atlas (free M0):** create a free cluster and paste its `mongodb+srv://...` URI into `.env`.

### Demo login (after `npm run seed`)

```
email:    demo@echo.app
password: Password123
```

## Configuration

All config is environment-driven — see [.env.example](.env.example). Notable free-tier choices:

| Concern        | Free default                        | Production upgrade                          |
| -------------- | ----------------------------------- | ------------------------------------------- |
| Database       | Atlas M0 / local mongod             | Paid Atlas tier                             |
| Push           | Expo Push (free)                    | —                                           |
| Google sign-in | Free (needs OAuth client IDs)       | —                                           |
| Advisor LLM    | Off (rules engine only)             | Set `ANTHROPIC_API_KEY` (pay-per-use)       |
| Phone OTP      | `console` provider (logs the code)  | Twilio/MSG91 (paid) — add behind `SmsProvider` |
| Live prices    | `mock` provider (deterministic)     | Free-tier market API behind `PriceProvider` |

## Architecture

```
src/
  config/            typed env config + validation
  common/            guards, decorators, filters, enums, stub-controller factory
  database/          Mongoose connection + seed script
  modules/
    users/           profile + preferences (+ push tokens)
    auth/            JWT, Google, phone-OTP (pluggable SMS)
    tags/            user-defined tags                       [implemented]
    finance/
      investments/   full CRUD + filtering + pagination      [implemented]
      assets/        CRUD (feeds net worth)                  [implemented]
      loans/         CRUD (feeds net worth)                  [implemented]
      networth/      compute + snapshots                     [implemented]
      dashboard/     aggregated savings dashboard            [implemented]
      stubs/         sips, insurance, goals, budgets, ...    [modelled, stubbed]
    prices/          quote provider + cache                  [implemented, mock]
    advisor/         rules engine + optional Claude layer     [implemented]
    activity/        events, birthdays, tasks                [modelled, stubbed]
    notifications/   Expo push + reminder cron               [scaffolded]
    health/          liveness + DB check
```

**Per-user isolation:** every domain document carries an indexed `userId`; a global `JwtAuthGuard`
authenticates every route (opt out with `@Public()`) and `@CurrentUser()` scopes all queries.

### Adding a new module (e.g. real SIPs)

Mirror `modules/finance/assets`: create `schema` (already exists under `finance/stubs/schemas`),
`dto`, `service` (user-scoped CRUD), `controller`, `module`; register it in `app.module.ts`; remove
the corresponding stub route from `finance-stubs.module.ts`.

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run start:dev` | Watch-mode dev server                |
| `npm run build`     | Compile to `dist/`                   |
| `npm run seed`      | Seed demo user + sample finance data |
| `npm test`          | Unit tests (Jest)                    |
| `npm run lint`      | ESLint (with `--fix`)                |

## API quick reference

See [`requests.http`](requests.http) for a ready-to-run collection (VS Code REST Client / IntelliJ).
Base URL `http://localhost:4000/api`.

- `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me`
- `GET/POST /tags` · `PATCH/DELETE /tags/:id`
- `GET/POST /finance/investments` (+ `?type=&tag=&status=&page=&limit=`) · `GET/PATCH/DELETE /finance/investments/:id`
- `GET/POST /finance/assets` · `GET/POST /finance/loans`
- `GET /finance/dashboard` · `GET /finance/networth` · `GET /finance/networth/history`
- `GET /advisor/recommendations` · `GET /advisor/history`
- `GET /prices/:symbol`
- `POST /notifications/push-token` · `GET /notifications`
