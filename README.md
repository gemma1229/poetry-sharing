# Poetry

A simple poetry sharing website built with Next.js, Tailwind CSS, and InstantDB.

## Features

- **Magic code authentication** — Sign up or log in with your email; InstantDB sends a one-time code.
- **Post poems** — Logged-in users can post poems with a title and body.
- **Home feed** — All poems from all users, newest first.

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **InstantDB**

   - Create an app at [InstantDB Dashboard](https://instantdb.com/dash) and copy your App ID.
   - Create `.env.local` in the project root with:

     ```
     NEXT_PUBLIC_INSTANT_APP_ID=your_actual_app_id
     ```

   Replace `your_actual_app_id` with your App ID (the project template uses `YOUR_APP_ID_HERE` as a placeholder).

3. **Push schema and permissions (one-time)**

   ```bash
   npx instant-cli init   # if you haven’t linked this repo to an Instant app yet
   npx instant-cli push  # push schema (poems entity and poemAuthor link)
   npx instant-cli push perms   # push permissions (optional but recommended)
   ```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Connect this repository to Vercel (e.g. [vercel.com/new](https://vercel.com/new)).
2. **Required:** In the project **Settings → Environment Variables**, add:
   - **Name:** `NEXT_PUBLIC_INSTANT_APP_ID`
   - **Value:** your InstantDB App ID (same as in `.env.local`, from [instantdb.com/dash](https://instantdb.com/dash)).
3. Deploy (or redeploy after adding the variable).

**If the site is blank or shows an error on Vercel:** ensure `NEXT_PUBLIC_INSTANT_APP_ID` is set for the correct environment (Production/Preview/Development) and trigger a new deployment after saving the variable.
