# CineDate

A movie date tracking app for couples to log their cinema outings, rate films, write reviews, and build a shared movie memory library.

## Features

- **Movie Date Logging** — Record every cinema outing with movie, date, location, ratings, and reviews
- **Dual Ratings & Reviews** — Both partners independently rate (0–10) and review every film
- **Watch Progress Tracking** — Mark movies as completed, partially watched, or continued from a previous date
- **Linked Dates** — Chain continuation sessions to the original partial watch for a clean timeline
- **Real-Time Movie/TV Search** — Search across OMDb (movies) and TMDb (TV series) simultaneously
- **Photo Memories** — Drag-and-drop upload of date photos (base64 encoded)
- **Dates Timeline** — Visual timeline view with linked-date connections and progress bars
- **Wishlist** — Save movies to watch on future dates
- **User Profile** — Stats summary (total dates, average rating, favorite genre/theater)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 6 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3, Radix UI, Shadcn UI components |
| Icons | Lucide React |
| Calendar | react-day-picker 9 |
| Backend | Vercel Serverless Functions (Node.js) |
| Movie Data | OMDb API |
| TV Data | TMDb API |

---

## Project Structure

```
MovieDate/
├── src/
│   ├── screens/
│   │   ├── Home/               # Landing page
│   │   ├── Dates/              # Timeline of all movie dates
│   │   ├── Wishlist/           # Movies saved for future
│   │   ├── Profile/            # User stats
│   │   └── StitchDesign/       # Add Date form (main feature)
│   │       └── sections/       # Form sub-sections
│   ├── components/ui/          # Shadcn UI component wrappers
│   ├── lib/utils.ts            # cn() utility
│   └── App.tsx                 # Route definitions
├── api/                        # Vercel serverless functions
│   ├── movie-dates.ts          # CRUD for movie dates
│   ├── content-search.ts       # Unified movie + TV search
│   ├── movie-details.ts        # OMDb movie details
│   ├── tv-details.ts           # TMDb TV series details
│   ├── incomplete-dates.ts     # Fetch partial-watch dates
│   ├── wishlist.ts             # Wishlist CRUD
│   ├── photos.ts               # Photo storage
│   ├── movies-search.ts        # OMDb movie search
│   └── popular-content.ts      # TMDb trending content
├── public/
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Routes

| Path | Screen | Description |
|------|--------|-------------|
| `/` | Home | Welcome page with CTAs |
| `/add-date` | StitchDesign | Create a new movie date |
| `/dates` | Dates | Timeline view of all dates |
| `/wishlist` | Wishlist | Saved movies list |
| `/profile` | Profile | User statistics |

---

## API Endpoints

All endpoints live in `api/` and deploy as Vercel serverless functions.

### `POST /api/movie-dates`
Create a new movie date entry.

**Body fields:** `movie_id`, `movie_title`, `movie_year`, `movie_poster`, `content_type` (`movie` | `tv_series`), `date_watched`, `location`, `user1_rating`, `user2_rating`, `user1_review`, `user2_review`, `photos[]`, `watch_status` (`completed` | `partial` | `continued`), `watch_progress` (0–100), `parent_date_id`

### `GET /api/movie-dates`
Fetch all dates. Optional query params: `user1_id`, `user2_id`, `movie_id`, `watch_status`, `linked=true` (include linked continuation dates).

### `PUT /api/movie-dates?id=X`
Update an existing date.

### `DELETE /api/movie-dates?id=X`
Delete a date and all its linked continuation dates.

### `GET /api/content-search?q=X&type=all|movie|tv_series`
Unified search across OMDb and TMDb.

### `GET /api/movie-details?id=X`
Full movie details from OMDb (title, runtime, genre, director, plot, ratings, poster).

### `GET /api/tv-details?id=X`
Full TV series details from TMDb (name, seasons, episodes, networks, creator, overview, poster).

### `GET /api/incomplete-dates`
Fetch dates with `watch_status=partial` for linking when continuing a series.

### `GET|POST|PUT|DELETE /api/wishlist`
CRUD for wishlist items. Currently in-memory (not persisted across deploys).

### `GET|POST|DELETE /api/photos`
Photo storage by `date_id`. In-memory — replace with S3/Cloudinary for production.

### `GET /api/popular-content?type=all|movie|tv_series&limit=20`
TMDb trending/popular content.

---

## Data Model

### MovieDate
```typescript
{
  id: number;
  movie_id: string;
  movie_title: string;
  movie_year?: string;
  movie_poster?: string;
  content_type: 'movie' | 'tv_series';
  date_watched: string;          // ISO datetime
  location: string;
  user1_id: string;
  user2_id: string;
  user1_rating?: number;         // 0–10
  user2_rating?: number;         // 0–10
  user1_review: string;
  user2_review: string;
  photos: any[];
  watch_status: 'completed' | 'partial' | 'continued';
  watch_progress: number;        // 0–100 percentage
  parent_date_id?: number;       // Link to prior partial watch
  linked_dates?: MovieDate[];    // Child continuation dates
  parent_date?: MovieDate;
  created_at: string;
  updated_at: string;
}
```f

---

## Getting Started

**Prerequisites:** Node.js installed.

```bash
npm install
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
```

For Vercel deployment, set environment variables for API keys (see note below).

---

## API Keys

The project uses two external APIs:
- **OMDb API** — for movie search and details
- **TMDb API** — for TV series search, details, and popular content

> **Security Note:** API keys are currently hardcoded in the `api/` files. Before deploying to production, move them to Vercel environment variables.

---

## Theme

Dark cinema-inspired color palette:
- Background: `#211111` (deep dark brown)
- Card: `#472326`
- Primary/Accent: `#e82833` (cinema red)
- Text muted: `#c69193` (dusty rose)
- Font: Plus Jakarta Sans
