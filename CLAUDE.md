# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application deployed to Cloudflare Workers using the OpenNext Cloudflare adapter, implementing `better-auth-cloudflare` for authentication. The project uses PostgreSQL via Cloudflare's Hyperdrive with Drizzle ORM for database management.

## Common Development Commands

### Development

- `pnpm dev` - Start Next.js development server
- `pnpm lint` - Run Next.js ESLint checks
- `pnpm format` - Format all files with Prettier

### Build & Deploy

- `pnpm build:cf` - Build for Cloudflare Workers using OpenNext
- `pnpm deploy` - Build and deploy to Cloudflare Workers
- `pnpm preview` - Build and preview locally before deploying

### Authentication Schema Management

- `pnpm auth:update` - Generate and format Better Auth Drizzle schema (runs both auth:generate and auth:format)
- `pnpm auth:generate` - Generate Drizzle schema from Better Auth config at `src/auth/index.ts`
- `pnpm auth:format` - Format the generated auth schema

### Database Management

- `pnpm db:generate` - Generate SQL migration files from Drizzle schema changes
- `pnpm db:migrate:dev` - Apply migrations to local database
- `pnpm db:migrate:prod` - Apply migrations to production database
- `pnpm db:studio:dev` - Open Drizzle Studio GUI for local database
- `pnpm db:studio:prod` - Open Drizzle Studio GUI for production database

## Architecture

### Authentication Setup

The authentication system uses a dual configuration pattern required by OpenNext.js:

1. **Runtime Configuration** (`authBuilder` function in `src/auth/index.ts`):
    - Async function that initializes Better Auth with Cloudflare context
    - Uses singleton pattern via `initAuth()` to ensure single instance
    - Accesses Cloudflare context and PostgreSQL via Hyperdrive

2. **CLI Configuration** (static `auth` export in `src/auth/index.ts`):
    - Simplified config for Better Auth CLI schema generation
    - Excludes async operations unavailable during CLI execution
    - Includes only schema-affecting configurations

### Database Architecture

- **Hyperdrive PostgreSQL**: Production database accessed via Cloudflare Hyperdrive binding
- **Drizzle ORM**: Type-safe database operations
- **Schema Files**:
    - `src/db/schema.ts` - Application-specific schema
    - `src/db/auth.schema.ts` - Generated Better Auth schema (do not edit manually)
    - `src/db/index.ts` - Database connection and exports

### Key Project Structure

- `src/app/` - Next.js App Router pages and API routes
    - `api/auth/[...all]/route.ts` - Better Auth API endpoint
    - `dashboard/` - Protected dashboard page
- `src/auth/` - Authentication configuration
    - `index.ts` - Main auth config with dual setup pattern
    - `authClient.ts` - Client-side auth utilities
- `src/db/` - Database configuration and schemas
- `src/components/` - React components including UI library
- `drizzle.config.ts` - Drizzle configuration for PostgreSQL
- `wrangler.toml` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext adapter configuration

### Environment Dependencies

- Cloudflare Workers runtime environment
- Hyperdrive binding named `HYPERDRIVE` for PostgreSQL access
- Environment variable `DATABASE_URL` for database connection
- OpenNext.js context for accessing Cloudflare bindings

## Important Patterns

### Async Database Access

Always use `await getDb()` to get database instance, which retrieves the Cloudflare context asynchronously:

```typescript
const dbInstance = await getDb();
```

### Authentication Instance

Use `initAuth()` to get the singleton auth instance in API routes:

```typescript
const auth = await initAuth();
```

### Schema Generation Workflow

1. Modify auth configuration in `src/auth/index.ts`
2. Run `pnpm auth:update` to regenerate schema
3. Run `pnpm db:generate` to create migrations
4. Apply migrations with `pnpm db:migrate:dev` or `pnpm db:migrate:prod`
