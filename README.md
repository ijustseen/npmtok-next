# NPMTok NPM<span style="color: #EC4899;">Tok</span>

> TikTok, but for npm packages

NPMTok is a web application built with Next.js that allows users to discover, browse, and bookmark npm packages in a TikTok-style feed.

## ✨ Features

- **Endless Package Feed**: Scroll through npm packages just like on TikTok.
- **Search**: Find specific packages.
- **Bookmarking**: Save interesting packages for later.
- **Authentication**: Secure sign-in with GitHub.
- **README Viewer**: View rendered README.md files for packages directly within the app.
- **🤖 AI Generation**: AI-powered package explanations and project idea generation.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Supabase Auth](https://supabase.io/docs/guides/auth)
- **GitHub API Interaction**: [@octokit/rest](https://github.com/octokit/rest.js)

## 📜 Available Scripts

- `npm run dev`: Starts the application in development mode with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production build.
- `npm run lint`: Runs the linter to check the code.

## 🗂️ Database Schema

The project uses a single table `bookmarked_packages` to store user bookmarks.

- **id**: `uuid` - Primary key.
- **user_id**: `uuid` - Foreign key referencing `auth.users(id)`.
- **package**: `jsonb` - Stores the npm package JSON object.
- **created_at**: `timestamp` - Timestamp of when the bookmark was created.

Row Level Security is enabled for the table, ensuring that users can only access their own bookmarks.

## 🤖 AI Features

NPMTok включает AI-powered функции для улучшения пользовательского опыта:

- **Explain Package**: ИИ объясняет простым языком что делает npm пакет
- **Generate Ideas**: ИИ предлагает идеи проектов с использованием выбранного пакета

### Usage:

1. Click the ✨ (Sparkles) button on any package card
2. Choose "Explain Package" or "Generate Ideas"
3. Get personalized AI-powered responses

### Setup Real AI (FREE!):

1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
3. Restart the dev server: `npm run dev`

> **Note**: Without an API key, demo responses are used. Gemini is FREE with generous quotas! See `AI_SETUP.md` for detailed setup instructions.
