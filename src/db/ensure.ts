import { pool } from "@/db";

let ready: Promise<void> | null = null;

/** Creates the tables if they don't exist yet, so a fresh database works without a manual migration. */
export function ensureSchema() {
  if (!ready) {
    ready = pool
      .query(
        `
      CREATE TABLE IF NOT EXISTS songs (
        id serial PRIMARY KEY,
        title text NOT NULL,
        artist text NOT NULL DEFAULT '',
        duration text NOT NULL DEFAULT '0:00',
        audio_url text,
        youtube_url text,
        cover_url text,
        playlist text NOT NULL DEFAULT 'durga_puja',
        position integer NOT NULL DEFAULT 0,
        created_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS site_settings (
        id serial PRIMARY KEY,
        bengali_title text NOT NULL DEFAULT 'পুজো আসছে',
        online_count integer NOT NULL DEFAULT 125,
        pujo_date text NOT NULL DEFAULT '',
        hero_image text NOT NULL DEFAULT '/images/hero-pandal.jpg',
        contact_email text NOT NULL DEFAULT 'devipakshaa@gmail.com',
        youtube_url text NOT NULL DEFAULT '',
        spotify_url text NOT NULL DEFAULT '',
        coffee_url text NOT NULL DEFAULT '',
        dhak_label text NOT NULL DEFAULT 'Dhak'
      );
      CREATE TABLE IF NOT EXISTS creators (
        id serial PRIMARY KEY,
        name text NOT NULL,
        photo_url text,
        linkedin text NOT NULL DEFAULT '',
        instagram text NOT NULL DEFAULT '',
        position integer NOT NULL DEFAULT 0
      );
    `,
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}
