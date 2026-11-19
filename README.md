# Tweetie

Tweetie is a full-stack Twitter/X clone built with **Next.js (App Router)**, **TypeScript** and **PostgreSQL via Prisma**. It covers the core of a social network: posts, likes, reposts, quote posts, threaded comments, follows (including private accounts with follow requests), profile stats, direct messages and real-time notifications.

**Live demo:** [tweetie-app.vercel.app](https://tweetie-app.vercel.app)

**Status:** ✅ Complete. The project is finished and no longer under active development.

## About the project

Tweetie was built as a hands-on project for learning how to build a modern full-stack web app from start to finish. It covers:

- Designing a relational schema for a social network (follows, likes, reposts, nested comments, notifications) and evolving it through migrations.
- Building an authenticated REST-style API with Next.js route handlers, validating every input with Zod.
- Handling privacy rules on the server (private accounts, follow requests).
- Delivering real-time updates with Server-Sent Events.
- Deploying to Vercel with a managed Postgres database.

---

## Table of contents

- [About the project](#about-the-project)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone and install](#1-clone-and-install)
  - [2. Set up a database](#2-set-up-a-database)
  - [3. Environment variables](#3-environment-variables)
  - [4. Run migrations](#4-run-migrations)
  - [5. Start the dev server](#5-start-the-dev-server)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API reference](#api-reference)
- [How it works](#how-it-works)
- [Deployment (Vercel)](#deployment-vercel)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)
- [What I learned](#what-i-learned)
- [License](#license)

---

## Features

### Accounts and auth
- Sign up and sign in with email and password. Passwords are hashed with `bcryptjs`.
- Sessions use a JWT stored in an **httpOnly cookie**, valid for 7 days.
- App pages (`/home`, `/profile`, `/search`, `/notifications`, `/messages`, `/settings`) are protected by middleware and redirect to the sign-in page when you're logged out.
- Change your password from **Settings → Account**.

### Posts
- Create posts of up to 500 characters and delete your own.
- **Like** and **repost**, with live counts and optimistic UI updates.
- **Quote posts**: repost with your own comment, and the original is embedded underneath.
- **Threaded comments**: reply to a post or to another comment.

### Profiles
- Editable username, bio (max 160 characters), **avatar** and **banner**. Images are resized in the browser before upload.
- **Profile stats**: post, follower and following counts. Only accepted follows are counted.
- Profile tabs for your own posts and posts you've liked.
- **Public or private** accounts. A private account's posts are visible only to approved followers.

### Social
- Follow and unfollow other users.
- Following a **private** account sends a **follow request**, which the owner can accept or decline.
- Search for users by username.

### Messages
- One-to-one direct messages, with a conversation list and unread tracking.

### Notifications
- Notifications for likes, reposts, replies, new followers, follow requests and messages.
- Delivered **in real time** via Server-Sent Events (SSE), with polling as a fallback.
- Per-type preferences under **Settings → Notifications**. Follow requests always notify, since they need a response.

### Settings
- Account (email, username, password), privacy (public or private), notification preferences, and lists of your **liked** and **reposted** posts.

---

## Tech stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19 with the React Compiler |
| Language    | TypeScript                                                    |
| Styling     | Tailwind CSS v4                                               |
| Database    | PostgreSQL                                                    |
| ORM         | [Prisma](https://www.prisma.io) 6                             |
| Auth        | JWT (`jsonwebtoken`) in an httpOnly cookie, plus `bcryptjs`   |
| Validation  | [Zod](https://zod.dev)                                        |
| Realtime    | Server-Sent Events, with polling as a fallback                |
| Icons       | `react-icons`                                                 |
| Hosting     | Vercel, with Prisma Postgres as the production database      |

---

## Getting started

### Prerequisites

- **Node.js 18+**. Check with `node -v`.
- **npm**, which comes with Node.
- **Git**.
- A **PostgreSQL** database. The simplest option for local development is Prisma's built-in local Postgres (see below). You don't need to install Postgres yourself.

### 1. Clone and install

```bash
git clone https://github.com/feliciavale/tweetie-app.git
cd tweetie-app
npm install
```

### 2. Set up a database

Pick **one** option.

**Option A: local Prisma Postgres (recommended for development)**

In a separate terminal, run:

```bash
npx prisma dev
```

This starts a Postgres server on your machine and prints a connection string like:

```
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&..."
```

Keep this terminal open while you work; press `q` to stop the database. Your data is kept between runs.

**Option B: a hosted database**

Create a free database on [Prisma Postgres](https://console.prisma.io), [Neon](https://neon.tech) or [Supabase](https://supabase.com), and copy its connection string.

> ⚠️ Avoid pointing your local `.env` at the **production** database. Anything you create or delete while testing would affect real users.

### 3. Environment variables

Create a file called `.env` in the project root. It's ignored by git.

```env
# PostgreSQL connection string (from step 2)
DATABASE_URL="postgres://..."

# Secret used to sign login tokens: any long random string
JWT_SECRET="replace-with-a-long-random-string"
```

| Variable       | Required | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string used by Prisma.             |
| `JWT_SECRET`   | Yes      | Secret for signing and verifying auth tokens. The app won't start without it. |

To generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run migrations

Create the tables and generate the Prisma client:

```bash
npx prisma migrate deploy   # apply all existing migrations
npx prisma generate         # generate the typed Prisma client
```

> When you **change** `prisma/schema.prisma`, use `npx prisma migrate dev --name your_change` to create a new migration.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account. A fresh database is empty. To test following and messaging, sign up a second account in a private/incognito window.

To browse the database, run `npx prisma studio`.

---

## Available scripts

| Command                       | What it does                                  |
| ----------------------------- | --------------------------------------------- |
| `npm run dev`                 | Start the dev server at `localhost:3000`      |
| `npm run build`               | Production build                              |
| `npm run start`               | Run the production build                      |
| `npm run lint`                | Run ESLint                                    |
| `npx prisma dev`              | Start a local Prisma Postgres database        |
| `npx prisma studio`           | Open a GUI to browse and edit the database    |
| `npx prisma migrate dev`      | Create and apply a new migration (development) |
| `npx prisma migrate deploy`   | Apply existing migrations (CI / production)   |
| `npx prisma generate`         | Regenerate the Prisma client                  |

---

## Project structure

```
tweetie-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # SQL migration history
├── src/
│   ├── middleware.ts          # Redirects logged-out users away from app pages
│   ├── app/
│   │   ├── page.tsx           # Landing page (sign in / sign up)
│   │   ├── auth/              # Sign-in and sign-up forms
│   │   ├── (app)/             # Authenticated pages (shared layout with sidebar)
│   │   │   ├── home/          # Main feed
│   │   │   ├── profile/       # Your profile, /profile/[username], /profile/edit
│   │   │   ├── search/        # User search
│   │   │   ├── notifications/
│   │   │   ├── messages/      # Inbox and /messages/[username] conversations
│   │   │   └── settings/      # account, privacy, notifications, liked, reposted
│   │   └── api/               # Route handlers (see API reference)
│   ├── components/            # PostCard, CommentThread, FollowButton, ProfileStats, ...
│   ├── context/               # CurrentUser, RealTime (SSE) and Comment contexts
│   └── lib/
│       ├── auth.ts            # JWT sign/verify
│       ├── session.ts         # getCurrentUserId() from the auth cookie
│       ├── prisma.ts          # Shared Prisma client
│       ├── validation.ts      # Zod schemas for every request body
│       ├── formatPost.ts      # Shapes DB posts into API responses
│       ├── notify.ts          # Creates notifications and pushes them live
│       ├── eventbus.ts        # In-memory registry of open SSE connections
│       └── resizeImage.ts     # Client-side avatar and banner resizing
└── package.json
```

---

## Data model

| Model          | Purpose |
| -------------- | ------- |
| `User`         | Account, profile (bio, avatar, banner), privacy flag and notification preferences |
| `Post`         | A post; may quote another post via `quotedPostId` |
| `Like`         | A user liking a post (unique per user and post) |
| `Repost`       | A user reposting a post (unique per user and post) |
| `Comment`      | A reply on a post; `parentId` allows nested threads |
| `Follow`       | Follower → following, with status `PENDING` or `ACCEPTED` |
| `Message`      | Direct message between two users, with `readAt` |
| `Notification` | Like, repost, reply, follow, follow request or message, sent to a recipient |

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full definitions.

---

## API reference

All routes live under `/api`. Every route except register and login requires the auth cookie and returns `401` without it.

### Auth and account
| Method | Route | Description |
| ------ | ----- | ----------- |
| `POST` | `/api/register` | Create an account |
| `POST` | `/api/login` | Sign in and set the auth cookie |
| `POST` | `/api/logout` | Clear the auth cookie |
| `GET` | `/api/me` | Current user's profile and counts (`postCount`, `followerCount`, `followingCount`) |
| `PATCH` | `/api/me` | Update username, email, bio, privacy, avatar or banner |
| `PATCH` | `/api/account/password` | Change password |

### Posts
| Method | Route | Description |
| ------ | ----- | ----------- |
| `GET` | `/api/posts` | Home feed |
| `POST` | `/api/posts` | Create a post (optionally with `quotedPostId`) |
| `DELETE` | `/api/posts/[id]` | Delete your own post |
| `POST` | `/api/posts/[id]/like` | Toggle like |
| `POST` | `/api/posts/[id]/repost` | Toggle repost |
| `GET` / `POST` | `/api/posts/[id]/comments` | List or add comments |
| `GET` | `/api/posts/mine` | Your posts |
| `GET` | `/api/posts/liked` | Posts you've liked |
| `GET` | `/api/posts/reposted` | Posts you've reposted |

### Users and follows
| Method | Route | Description |
| ------ | ----- | ----------- |
| `GET` | `/api/users/[username]` | Public profile, follow status and counts |
| `GET` | `/api/users/[username]/posts` | A user's posts (empty if private and you don't follow them) |
| `GET` / `POST` / `DELETE` | `/api/users/[username]/follow` | Check, follow (or request) and unfollow |
| `PATCH` / `DELETE` | `/api/follow-requests/[followId]` | Accept or decline a follow request |
| `GET` | `/api/search/users?q=` | Search users by username (up to 20 results) |

### Messages and notifications
| Method | Route | Description |
| ------ | ----- | ----------- |
| `GET` | `/api/messages` | Conversation list |
| `GET` / `POST` | `/api/messages/[username]` | Read or send messages in a conversation |
| `GET` | `/api/notifications` | Notification list |
| `GET` | `/api/notifications/unread-count` | Unread badge count |
| `GET` / `PATCH` | `/api/settings/notifications` | Read or update notification preferences |
| `GET` | `/api/events` | Server-Sent Events stream for live updates |

---

## How it works

**Authentication.** On login the server signs a JWT (`{ sub: userId }`, 7-day expiry) and sets it as an httpOnly, `SameSite=Lax` cookie, marked `Secure` in production. `middleware.ts` checks the token before rendering protected pages, and each API route calls `getCurrentUserId()` to identify the user.

**Validation.** Every request body is checked with a Zod schema from `src/lib/validation.ts` before it touches the database. The API returns `400` with a readable message when a check fails.

**Private accounts.** Following a private account creates a `Follow` with status `PENDING` and sends a follow request notification. Until the owner accepts it, `/api/users/[username]/posts` returns `{ posts: [], private: true }`.

**Profile counts.** `postCount`, `followerCount` and `followingCount` come from Prisma's `_count`, with follows filtered to `status: "ACCEPTED"`, so pending requests aren't counted. The UI updates the follower count right away when you follow or unfollow, and the post count when you delete a post.

**Real-time notifications.** The client opens an `EventSource` to `/api/events`. When `notify.ts` creates a notification, it pushes the new unread count to that user's open connections through `eventbus.ts`. A keep-alive ping is sent every 25 seconds, and polling covers any events SSE misses.

---

## Deployment (Vercel)

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com).
2. Create a production database (for example, Prisma Postgres from Vercel → **Storage**) and connect it to the project.
3. Under **Settings → Environment Variables**, set `DATABASE_URL` and `JWT_SECRET` for Production and Preview.
4. Apply migrations to the production database, either from your machine with the production `DATABASE_URL` or as part of the build:
   ```bash
   npx prisma migrate deploy
   ```
5. Every push to `main` triggers a new production deployment.

> **If a new deployment doesn't go live:** after an **Instant Rollback**, Vercel stops auto-promoting new builds. Open **Deployments**, click **⋯** on the latest one and choose **Promote**.

> **Note on real-time:** `eventbus.ts` keeps SSE connections in memory, which works on a single server. On Vercel, requests can be handled by different serverless instances, so live pushes may be missed and the polling fallback takes over. For fully reliable real-time delivery in production, replace the event bus with a shared pub/sub service (Postgres `LISTEN/NOTIFY`, Redis, Pusher or Ably).

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `JWT_SECRET is not set` on startup | Add `JWT_SECRET` to `.env` and restart `npm run dev`. |
| `Can't reach database server` | Start the local database (`npx prisma dev`) or check `DATABASE_URL`. |
| `The table ... does not exist` | Run `npx prisma migrate deploy`. |
| Type errors after changing the schema | Run `npx prisma generate`. |
| Logged out after changing `JWT_SECRET` | Expected: old tokens are no longer valid. Sign in again. |
| Warning about a `package-lock.json` outside the repo | Delete the stray lock file in your home folder, or set `turbopack.root` in `next.config.ts`. |
| Very slow first page load in dev | Normal: Next.js compiles each route the first time you visit it. |

---

## Known limitations

Tweetie is complete as a project, but it isn't hardened for large-scale production use. Known trade-offs:

- **Home feed privacy:** the home feed lists all posts, including posts from private accounts. Private posts are hidden on profile pages but not filtered from the feed.
- **No pagination:** feeds and post lists load every result at once.
- **Images in the database:** avatars and banners are stored as base64 strings in Postgres rather than in object storage.
- **Username format:** usernames are checked for length only, not for allowed characters.
- **Real-time on serverless:** the SSE event bus is in memory, so on Vercel live pushes can be missed and polling takes over.
- **No rate limiting** on login or registration.
- **Account deletion:** relations don't cascade, so deleting a user requires removing their related records first.

Anyone extending the project would naturally tackle these next. Clickable follower and following lists would be a good addition too.

---

## What I learned

- Modelling many-to-many relationships (follows, likes, reposts) and self-relations (quote posts, comment threads) in Prisma.
- Using Prisma's filtered `_count` to compute stats such as follower counts without extra queries.
- Keeping auth secure with httpOnly cookies and server-side checks rather than relying on the client.
- Optimistic UI updates that roll back cleanly when a request fails.
- The trade-offs of real-time features on serverless platforms.
- A full workflow with local databases (`prisma dev`), migrations and continuous deployment on Vercel.

---

## License

This project was built for learning and portfolio purposes. Feel free to explore the code and use it as a reference.
