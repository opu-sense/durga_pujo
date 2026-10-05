import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull().default(""),
  duration: text("duration").notNull().default("0:00"),
  audioUrl: text("audio_url"),
  youtubeUrl: text("youtube_url"),
  coverUrl: text("cover_url"),
  playlist: text("playlist").notNull().default("durga_puja"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  bengaliTitle: text("bengali_title").notNull().default("পুজো আসছে"),
  onlineCount: integer("online_count").notNull().default(125),
  pujoDate: text("pujo_date").notNull().default(""),
  heroImage: text("hero_image").notNull().default("/images/hero-pandal.jpg"),
  contactEmail: text("contact_email").notNull().default("devipakshaa@gmail.com"),
  youtubeUrl: text("youtube_url").notNull().default(""),
  spotifyUrl: text("spotify_url").notNull().default(""),
  coffeeUrl: text("coffee_url").notNull().default(""),
  dhakLabel: text("dhak_label").notNull().default("Dhak"),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  linkedin: text("linkedin").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  position: integer("position").notNull().default(0),
});
