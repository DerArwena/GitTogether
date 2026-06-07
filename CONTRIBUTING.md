# Contributing to GitTogether

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Run `npx prisma generate` and `npx prisma db push`
5. Run `npm run dev`

## Development

- The app uses Next.js 16 App Router with TypeScript
- Styling uses Tailwind CSS
- Database queries use Prisma
- Auth uses NextAuth v5 (Auth.js)
- Server actions are in `src/server/actions/`

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — tooling, config
- `refactor:` — code restructuring
- `style:` — formatting (no logic change)

## PR process

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run build` to check for errors
4. Open a pull request with a clear description
5. Wait for review

## Code style

- TypeScript strict mode
- Prettier for formatting
- No semicolons
- Single quotes
- Trailing commas
