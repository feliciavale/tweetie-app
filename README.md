# Tweetie

Tweetie is a full-stack Twitter/X clone built with Next.js (App Router), TypeScript, and PostgreSQL via Prisma. It supports posts, likes, reposts, quote posts, threaded comments, follows (including private accounts with follow requests), direct messages, and real-time notifications.

## Features

- **Auth** — Email/password registration and login with JWT stored in an httpOnly cookie; protected routes enforced via middleware.
- **Posts** — Create, delete, like, repost, and quote-post, with threaded comment replies.
- **Profiles** — Editable bio, avatar, and banner image (resized client-side before upload); public and private account modes.
- **Follows** — Follow/unfollow, with pending follow requests for private accounts.
- **Direct messages** — One-on-one conversations between users.
- **Notifications** — Live updates via Server-Sent Events, with polling fallback for reliability across serverless instances; per-type notification preferences (likes, reposts, replies, follows, messages).
- **Search** — Find other users by name or handle.

## Tech stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Framework  | Next.js (App Router), TypeScript         |
| Styling    | Tailwind CSS                             |
| Database   | PostgreSQL via Prisma ORM                |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`         |
| Realtime   | Server-Sent Events with polling fallback |
| Validation | Zod                                      |

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or Prisma Postgres)

### Setup

1. Clone the repo and install dependencies:
```bash
   git clone https://github.com/feliciavale/tweetie-app.git
   cd tweetie-app
   npm install
```

2. Create a `.env` file in the project root:
```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="a-long-random-secret"
```

3. Run migrations and generate the Prisma client:
```bash
   npx prisma migrate dev
```

4. Start the dev server:
```bash
   npm run dev
```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

