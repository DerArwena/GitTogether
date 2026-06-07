# Self-hosting GitTogether

## Prerequisites

- Docker and Docker Compose
- A domain name (optional for local testing)
- GitHub OAuth credentials (register at https://github.com/settings/developers)

## Quick start

Clone the repo and configure environment:

```bash
git clone https://github.com/YOUR_ORG/gittogether
cd gittogether
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://gittogether:gittogether@db:5432/gittogether?schema=public"
AUTH_SECRET="generate-a-random-secret"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

Start the stack:

```bash
docker compose up -d
```

Visit `http://localhost:3000`.

## Production deployment

For production:

1. Set `NEXT_PUBLIC_APP_URL` to your domain
2. Use a reverse proxy (nginx/Caddy) for SSL termination
3. Set strong `AUTH_SECRET`
4. Configure persistent volume for Postgres data
5. Enable health checks

### Recommended docker-compose override for production

```yaml
services:
  app:
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_APP_URL: https://gittogether.example.com
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## Configuration

All configuration is via environment variables. See [.env.example](../.env.example) for the full list.
