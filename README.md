# CineFree

CineFree is a React/Vite movie and TV-series discovery application backed by
an Express, MongoDB, and TMDB API. Users can browse titles, search metadata,
save a local watchlist, and watch authorized video sources configured by an
administrator.

> **Content and rights notice:** Only add video sources that you own, have
> licensed, or are explicitly authorized to distribute. TMDB metadata does not
> grant streaming or download rights.

## Features

- Trending movies, popular movies, and popular TV series from TMDB
- Search, browse, pagination, ratings, posters, backdrops, genres, cast,
  seasons, episodes, runtime, and official trailer metadata
- Responsive title details and watch pages
- Authorized provider embeds and direct video URLs
- Optional download links for authorized content
- Browser-local watchlist stored in `localStorage`
- User registration and login with bcrypt password hashing and JWT sessions
- Admin-only media source management and user role management
- Helmet, CORS, request logging, rate limiting, validation, and authorization
- Vercel-compatible Express entry point

## Project structure

```text
cinefree/
├─ client/                 # React + Vite frontend
│  ├─ public/               # Static assets
│  └─ src/
│     ├─ components/        # Navbar, cards, hero banner
│     ├─ data/              # Local fallback/sample data
│     ├─ hooks/             # Media loading hooks
│     ├─ layouts/           # Main and admin layouts
│     ├─ pages/             # Home, browse, details, watch, login, admin
│     ├─ services/api.js    # Frontend API client
│     ├─ App.jsx            # Routes and watchlist state
│     └─ main.jsx           # React entry point
├─ server/                 # Express API
│  ├─ config/               # MongoDB and TMDB configuration
│  ├─ controllers/          # Media controller logic
│  ├─ middleware/           # JWT authentication middleware
│  ├─ models/               # User and Media Mongoose models
│  ├─ routes/               # Auth, media, and video routes
│  ├─ scripts/              # Administrative scripts
│  ├─ services/             # External video-provider integration
│  └─ server.js             # API entry point
└─ README.md
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB, local or MongoDB Atlas
- TMDB bearer token
- Authorized video hosting or streaming sources

## Installation

```bash
cd server
npm install

cd ../client
npm install
```

## Environment configuration

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/cinefree
# Or: mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
TMDB_BEARER_TOKEN=your-tmdb-bearer-token

# Optional integration used by /api/video routes
VIDEO_PROVIDER_BASE_URL=https://your-video-provider.example/api
VIDEO_PROVIDER_API_KEY=your-provider-api-key
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real MongoDB credentials, JWT secrets, TMDB tokens, or provider
API keys. `VITE_*` values are embedded in the browser and must not contain
private credentials.

### Mobile testing over Wi-Fi

On a phone, `localhost` means the phone itself. Find the computer's LAN IP
using `ipconfig`, then configure:

```env
# client/.env
VITE_API_URL=http://192.168.1.10:5000/api
```

```env
# server/.env
CLIENT_URL=http://192.168.1.10:5173
```

Start Vite on the network interface:

```bash
cd client
npm run dev -- --host 0.0.0.0
```

Open `http://192.168.1.10:5173` on the phone. Both devices must use the same
network, and Windows Firewall must allow ports 5173 and 5000.

## Running locally

In one terminal:

```bash
cd server
npm run dev
```

In a second terminal:

```bash
cd client
npm run dev
```

Default URLs:

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

Production frontend build:

```bash
cd client
npm run build
npm run preview
```

## Frontend routes

| Route | Purpose |
| --- | --- |
| `/` | Home with featured, trending, and popular titles |
| `/browse` | Browse all media |
| `/movies` | Browse movies |
| `/series` | Browse TV series |
| `/title/:slug` | TMDB title details |
| `/watch/:id` | Watch an authorized source |
| `/watchlist` | Locally saved titles |
| `/login` | Register and sign in |
| `/admin` | Administrator dashboard |

Title IDs use `movie-<tmdbId>` or `series-<tmdbId>`, for example
`/watch/movie-550`.

## API reference

All API paths are prefixed with `/api`.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | API status |

### Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create an account |
| POST | `/auth/login` | No | Sign in and receive a JWT |
| GET | `/auth/me` | Bearer JWT | Get the current user |
| GET | `/auth/admin/users` | Admin | List users and statistics |
| PATCH | `/auth/admin/users/:id/role` | Admin | Change a user's role |

Registration requires a name of 2–80 characters, a valid email, and a
10–72-character password. Login and registration are rate-limited.

### Media

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/media` | No | List TMDB movies or series |
| GET | `/media/:type/:id` | No | Details plus published source |
| GET | `/media/admin/list` | Admin | List media mappings |
| POST | `/media/admin/source` | Admin | Create or update a mapping |
| DELETE | `/media/admin/source/:id` | Admin | Delete a mapping |

List query parameters:

```text
type=movie|series|all
category=popular|trending
search=<query>
page=<number>
```

The details endpoint only returns `embedUrl`, `videoUrl`, and `downloadUrl`
from a matching Media record where `published` is `true`.

### Video provider

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/video/:tmdbId/playback` | Bearer JWT | Resolve authorized playback |
| GET | `/video/:tmdbId/download` | Bearer JWT | Resolve authorized download |

The current `resolveAuthorizedAsset` implementation intentionally fails closed
until a database-backed licensed asset mapping is implemented. The public
watch page currently reads published Media mappings directly.

## MongoDB models

### User

```text
name         String, required, 2–80 characters
email        String, required, unique, lowercase
passwordHash String, required, hidden by default
role         "user" | "admin", default "user"
timestamps   createdAt, updatedAt
```

### Media

```text
title         String, required
slug          String, unique
type          "movie" | "series"
description   String, required
posterUrl     String, required
backdropUrl   String
releaseYear   Number
genres        String[]
rating        Number
tmdbId        Number, indexed
embedUrl      String
videoUrl      String
downloadUrl   String
videoProvider String
rights.status "public-domain" | "licensed" | "permission"
featured      Boolean
published     Boolean
timestamps    createdAt, updatedAt
```

Example published mapping:

```json
{
  "tmdbId": 550,
  "type": "movie",
  "embedUrl": "https://authorized-provider.example/embed/video-id",
  "videoUrl": "",
  "downloadUrl": "",
  "published": true,
  "rights": {
    "status": "licensed"
  }
}
```

Use an official provider embed URL, not a normal watch-page URL. Provider
ads, anti-bot checks, `403` responses, and redirects cannot reliably be fixed
by the CineFree frontend. Use a provider that supports iframe playback and
mobile browsers.

## Admin workflow

1. Register a normal account.
2. Promote it:

   ```bash
   cd server
   npm run promote-admin -- user@example.com
   ```

3. Sign in at `/login`.
4. Open `/admin`.
5. Search for the exact TMDB title and select it.
6. Add an authorized embed URL or direct video URL.
7. Select the rights status and enable publishing.
8. Save the mapping.
9. Open the title details page and select **Watch**.

## Deployment

### Frontend

Set the production API URL before building:

```env
VITE_API_URL=https://api.example.com/api
```

Then:

```bash
cd client
npm run build
```

For Vercel, set the project **Root Directory** to `client`. The
`client/vercel.json` file contains the SPA rewrite required for direct routes
such as `/admin`, `/watch/:id`, and `/title/:slug`. Without this rewrite,
opening those routes directly can return a Vercel `404` even though client-side
navigation works.

### Express API

The server exports the Express app and detects `VERCEL` for serverless
deployment. Configure all backend environment variables in the deployment
platform. Set `CLIENT_URL` to the exact deployed frontend origin.

For a normal Node server:

```bash
cd server
npm start
```

The API currently allows the single origin configured by `CLIENT_URL`. Do not
use a wildcard origin for authenticated or private admin requests.

## Security checklist

- Rotate credentials exposed in screenshots, chat, commits, or public
  repositories.
- Keep `.env` files out of Git.
- Use a random `JWT_SECRET` of at least 32 characters.
- Restrict MongoDB Atlas network access.
- Use HTTPS in production.
- Set `CLIENT_URL` to the exact frontend origin.
- Publish only authorized video and download URLs.
- Do not treat TMDB metadata as proof of distribution rights.
- Review provider iframe, mobile, CORS, and anti-bot policies.

## Available scripts

### Client

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

### Server

| Command | Description |
| --- | --- |
| `npm run dev` | Start API with Nodemon |
| `npm start` | Start API with Node |
| `npm run promote-admin -- <email>` | Promote a user to administrator |

## Troubleshooting

### Mobile cannot load movies

Replace `localhost` in both environment files with the computer LAN IP, run
Vite with `--host 0.0.0.0`, and check the firewall.

### Watch page says the source is unavailable

Check that the MongoDB record has the correct numeric `tmdbId`, `type` equal to
`movie` or `series`, `published: true`, and a valid HTTP(S) `embedUrl` or
`videoUrl`.

### `_challenge`, `tag.min.js`, ads, or redirects repeat

That is a provider-side Cloudflare, anti-bot, or advertising response, not a
MongoDB connection loop. Replace the source with an authorized provider that
supports embedding and mobile playback.

### Authentication fails

Check `JWT_SECRET`, `VITE_API_URL`, API availability, and the Bearer token
stored by the browser.

### TMDB requests fail

Check `TMDB_BEARER_TOKEN`, server logs, and TMDB API limits.

## License

No project license has been declared yet. Add an explicit license before
distributing the source code or accepting external contributions.
