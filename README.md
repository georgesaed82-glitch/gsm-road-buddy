# GSM Driving School / Road Buddy

A UK driving theory and learner portal built with TanStack Start, React 19, Tailwind CSS v4, and Lovable Cloud (Supabase).

## Features

- **Learner portal** with theory topics, road signs, road markings, and police signals
- **Interactive quizzes** and progress tracking
- **Highway Code-aligned content** audited against UK DVSA standards
- **Responsive design** for desktop and mobile
- **PWA support** with offline page and web manifest

## Tech Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — backend/auth/database (via Lovable Cloud)
- [Capacitor](https://capacitorjs.com) — mobile app build support
- [Vite](https://vitejs.dev)
- [Bun](https://bun.sh)

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your Supabase project credentials:

   ```bash
   cp .env.example .env
   ```

   If you are using Lovable Cloud, the credentials are available in the project settings.

3. **Run the dev server**

   ```bash
   bun dev
   ```

   The app will be available at `http://localhost:8080`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start the development server |
| `bun build` | Build for production |
| `bun build:dev` | Build in development mode |
| `bun preview` | Preview the production build locally |
| `bun lint` | Run ESLint |
| `bun format` | Format code with Prettier |

## Project Structure

```
.
├── public/                 # Static assets, PWA files
├── src/
│   ├── assets/             # Images and fonts
│   ├── components/         # Reusable UI components
│   ├── data/               # Theory content, signs, quizzes
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Supabase and Lovable connectors
│   ├── lib/                # Utility functions and server functions
│   ├── routes/             # TanStack Start routes
│   ├── router.tsx          # Router configuration
│   ├── server.ts           # Server function entry
│   ├── start.ts            # TanStack Start instance
│   └── styles.css          # Global styles and Tailwind theme
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── tests/                  # Test files
├── .env.example            # Example environment variables
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Environment Variables

See `.env.example` for the full list of required variables.

## Deployment

This project is deployed via Lovable. Backend changes (database migrations, server functions) deploy automatically. Frontend changes require publishing through the Lovable editor.

## License

This project is private and proprietary to GSM Driving School.
