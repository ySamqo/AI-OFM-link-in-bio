# Obsidian Links

A small, original smart-link dashboard built with Express, SQLite, and plain HTML/CSS/JavaScript. Version 1 intentionally uses standard redirects only; the resolver is isolated so deeplinks and browser-opening rules can be added later.

## Try the preview

After installing Node.js, run:

```bash
npm install
npm run preview
```

Open `http://localhost:3000` and sign in with `preview@example.com` / `preview123`. The preview command creates a separate `data/preview.db` with sample links and analytics, so you can immediately test the dashboard, edit links, and inspect reports. Stop it with `Ctrl+C`. Preview credentials and secrets are intentionally insecure and must never be used in production.

## Beginner setup

1. **Install Node.js:** Download the current LTS installer from [nodejs.org](https://nodejs.org), run it, then reopen your terminal. Check it with `node --version`.
2. **Install packages:** In this project folder, run `npm install`.
3. **Create your environment file:** Copy `.env.example` to `.env` (`cp .env.example .env` on macOS/Linux). Replace both secrets with long random values.
4. **Initialize SQLite:** Run `npm run init-db`. This creates `data/smart-links.db`; no separate database server is needed.
5. **Create the first admin:** Run `npm run create-admin` and enter an email and password when prompted.
6. **Start locally:** Run `npm start`, then open `http://localhost:3000`.
7. **Create your first link:** Log in, click **New smart link**, use title `Instagram`, slug `instagram`, and an `https://` destination, then save.
8. **Test the redirect:** Open `http://localhost:3000/go/instagram`. You should be redirected, and the visit will appear under **Analytics**.

## Useful commands

- `npm run dev` — restart automatically while editing
- `npm test` — run automated tests
- `npm run init-db` — safely create missing database tables

## Privacy and production notes

Raw IP addresses are never stored; the app saves an HMAC hash made with `IP_HASH_SALT`. Change that salt to reset visitor identity. Use strong secrets and HTTPS in production. The default session store is suitable for local development only; use a persistent session store before deploying multiple app instances.
