import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default sql;

export async function initSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS movie_dates (
      id              SERIAL PRIMARY KEY,
      movie_id        TEXT        NOT NULL,
      movie_title     TEXT        NOT NULL,
      movie_year      TEXT,
      movie_poster    TEXT,
      content_type    TEXT        NOT NULL DEFAULT 'movie',
      date_watched    TIMESTAMPTZ NOT NULL,
      location        TEXT        NOT NULL DEFAULT '',
      user1_id        TEXT        NOT NULL DEFAULT 'user1',
      user2_id        TEXT        NOT NULL DEFAULT 'user2',
      user1_rating    NUMERIC(4,1),
      user2_rating    NUMERIC(4,1),
      user1_review    TEXT        NOT NULL DEFAULT '',
      user2_review    TEXT        NOT NULL DEFAULT '',
      photos          JSONB       NOT NULL DEFAULT '[]',
      watch_status    TEXT        NOT NULL DEFAULT 'completed',
      watch_progress  INTEGER     NOT NULL DEFAULT 100,
      parent_date_id  INTEGER     REFERENCES movie_dates(id) ON DELETE SET NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id           SERIAL PRIMARY KEY,
      movie_id     TEXT NOT NULL,
      movie_title  TEXT NOT NULL,
      movie_year   TEXT,
      movie_poster TEXT,
      movie_genre  TEXT,
      priority     TEXT NOT NULL DEFAULT 'interested',
      is_shared    BOOLEAN NOT NULL DEFAULT false,
      user_id      TEXT NOT NULL DEFAULT 'user1',
      added_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
