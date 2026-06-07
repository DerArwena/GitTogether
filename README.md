# GitTogether

**Project HQ for your GitHub repositories.**

GitTogether gives every GitHub project a dedicated hub — manage your team, see your issues across repos, and control who has access.

## Features

- **Project profiles** — A home page for each project with description, links, repos, and team
- **Member management** — Five roles (owner → viewer) with clear permissions
- **Issue aggregation** — See open issues from all linked repos in one feed
- **Invite system** — Share invite links with role assignment and expiration
- **Join requests** — Let people request access to your projects
- **Self-hostable** — One `docker compose up` to run your own instance
- **Invite-only mode** — Control who can register on hosted or self-hosted versions

## Quick start

```bash
git clone https://github.com/YOUR_ORG/gittogether
cd gittogether
npm install
npx prisma generate
npx prisma db push
npm run dev
```

See [docs/self-hosting.md](docs/self-hosting.md) for production deployment.

## Tech stack

Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · PostgreSQL · Prisma · Auth.js · Docker

## License

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.
