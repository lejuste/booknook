# Booknook

Your personal reading companion. Next.js app with Supabase auth and user profiles.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for local Supabase only)

## Local development (against local database)

Run the full stack locally: Next.js + local Supabase (PostgreSQL, Auth, Storage, etc.) in Docker.

1. **Start local Supabase** (requires Docker Desktop running):

   ```bash
   npm run supabase:start
   ```

   This spins up local Postgres, Auth, Storage, Realtime, Inbucket, and Supabase Studio at `http://127.0.0.1:54323`.

2. **Point the app at local Supabase** – create or update `.env.local` with local credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<local_anon_key>
   ```

   The local anon key is printed when you run `supabase start`, or view it in [Supabase Studio](http://127.0.0.1:54323). Add `SUPABASE_SERVICE_ROLE_KEY` for seed scripts.

   After adding new migrations, run `supabase db reset` to apply them to the local database.

3. **Run the Next.js dev server**:

   ```bash
   npm run dev
   ```

4. **Stop local Supabase** when done:

   ```bash
   npm run supabase:stop
   ```

## Remote development (against hosted Supabase)

Run the app against your hosted Supabase project.

1. **Set environment variables** in `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

   Copy from the Supabase dashboard → Project Settings → API.

2. **Apply migrations to the remote database** (first time or after schema changes):

   ```bash
   npx supabase link   # link to your remote project (one-time)
   npm run supabase:db:push
   ```

3. **Run the Next.js dev server**:

   ```bash
   npm run dev
   ```

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run supabase:start` | Start local Supabase (Docker) |
| `npm run supabase:stop` | Stop local Supabase |
| `npm run supabase:db:diff` | Generate migration from schema diff |
| `npm run supabase:db:push` | Push migrations to remote |
| `npm run seed:test-users` | Create test user for integration tests |
| `npm run seed:library` | Seed sample library books (current reads) |
| `npm run seed:past-reads` | Seed Scythe & Bible as completed books + profile demo data |
| `npm run test` | Run auth integration tests (Playwright) |
| `npm run test:ui` | Run tests with Playwright UI |

## Testing

Integration tests cover login, sign out, and invalid credentials. They use a seeded test user (no email required).

1. **Seed the test user** (one-time, requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`):

   ```bash
   npm run seed:test-users
   ```

   This creates `a@test.com` and `b@test.com` (password: `Welcome1!`) via the Admin API. Tests run the seed automatically via globalSetup.

2. **Install Playwright browsers** (one-time):

   ```bash
   npx playwright install
   ```

3. Ensure the dev server is running (`npm run dev`) or tests will start it.

4. Run tests:

   ```bash
   npm run test
   ```

## Seeding data

1. **Test users** (required for tests and seed scripts):

   ```bash
   npm run seed:test-users
   ```

2. **Library books** (sample current reads):

   ```bash
   npm run seed:library
   ```

3. **Past read books** (Scythe, The Holy Bible) + profile demo:

   ```bash
   npm run seed:past-reads
   ```

   Requires the `status` column on `library_entries` and `tagline` on `profiles`. If using **local** Supabase, run `supabase db reset` after adding new migrations. If using **remote**, run `npm run supabase:db:push`.
