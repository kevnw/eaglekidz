# Eagle Kidz schedule

The monthly schedule, grouping and weekly reports for the Eagle Kidz children's ministry.

- **Everyone** can read the monthly schedule without signing in.
- **The ministry lead and SICs** sign in to edit the schedule and grouping and to write reports.
- **The lead** gives each SIC a password on the Access page. Anyone marked SIC in the grouping can be given one.

## Run it locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. With no `DATABASE_URL`, the API stores data in `.data/db.json`. It is seeded with the grouping and the October 2026 schedule. Sign in as **Local lead** with the password `eaglekidz` (local development only).

## Deploy on Railway

1. Push this repository to GitHub.
2. In Railway, create a project, choose **Deploy from GitHub repo**, and pick this repo.
3. In the service's **Settings → Source**, set **Root Directory** to `web`. The build and start commands come from `railway.json`.
4. Add a database: **+ New → Database → PostgreSQL**.
5. In the app service's **Variables**, add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `NODE_ENV` | `production` |
   | `SESSION_SECRET` | a long random string, e.g. from `openssl rand -base64 32` |
   | `LEAD_NAME` | your name, as it should appear when you sign in |
   | `LEAD_PASSWORD` | your password (at least 8 characters) |

6. Under **Settings → Networking**, choose **Generate Domain**.

On first start the server creates its tables and loads the grouping and the October schedule. After that, the database is the source of truth.

If `LEAD_NAME` matches a minister's name in the grouping, your name gets the ballpoint ring on the schedule too.

## Scripts

- `npm run dev`: app and API with hot reload
- `npm run build`: builds the app into `dist/` and the server into `dist-server/`
- `npm start`: runs the production server (`PORT`, default 3000)
