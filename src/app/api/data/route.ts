import { db } from "@/db";
import { songs, siteSettings, creators } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { ensureSchema } from "@/db/ensure";

export const dynamic = "force-dynamic";

function isoDatePlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const seedSongs: {
  title: string;
  artist: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  playlist: string;
  position: number;
}[] = [
  { title: "Dugga Elo", artist: "Monali Thakur", duration: "2:27", coverUrl: "/images/covers/monali.jpg", audioUrl: "/audio/demo-1.wav", playlist: "durga_puja", position: 1 },
  { title: "Dugga Ma (Original Motion Picture Soundtrack)", artist: "Arijit Singh", duration: "4:31", coverUrl: "/images/covers/dugga-ma.jpg", audioUrl: "/audio/demo-2.wav", playlist: "durga_puja", position: 2 },
  { title: "Ebar Jeno Onno Rokom Pujo", artist: "Nakash Aziz Official", duration: "3:33", coverUrl: "/images/covers/pujo.jpg", audioUrl: "/audio/demo-3.wav", playlist: "durga_puja", position: 3 },
  { title: "Dhak Baja Kashor Baja", artist: "Shreya Ghoshal Official", duration: "4:26", coverUrl: "/images/covers/dhak.jpg", audioUrl: "/audio/demo-4.wav", playlist: "durga_puja", position: 4 },
  { title: "Bolo Dugga Elo", artist: "Kaushik-Guddu", duration: "3:20", coverUrl: "/images/covers/bolo.jpg", audioUrl: "/audio/demo-1.wav", playlist: "durga_puja", position: 5 },
  { title: "Aamaar Dugga", artist: "Monali Thakur", duration: "3:20", coverUrl: "/images/covers/aamaar.jpg", audioUrl: "/audio/demo-2.wav", playlist: "durga_puja", position: 6 },
  { title: "Dhaker Taley (Original Motion Picture Soundtrack)", artist: "Release", duration: "4:43", coverUrl: "/images/covers/duo.jpg", audioUrl: "/audio/demo-3.wav", playlist: "durga_puja", position: 7 },
  { title: "Dugga Elo", artist: "Akriti Kakar", duration: "3:58", coverUrl: "/images/covers/monali.jpg", audioUrl: "/audio/demo-4.wav", playlist: "durga_puja", position: 8 },
  { title: "Shundori Komola", artist: "Release", duration: "3:14", coverUrl: "/images/covers/group.jpg", audioUrl: "/audio/demo-1.wav", playlist: "durga_puja", position: 9 },
  { title: "Elo Je Maa", artist: "Abhijjeet Unplugged", duration: "5:08", coverUrl: "/images/covers/group.jpg", audioUrl: "/audio/demo-2.wav", playlist: "durga_puja", position: 10 },
  { title: "O Momo O Momo", artist: "Release", duration: "3:41", coverUrl: "/images/covers/duo.jpg", audioUrl: "/audio/demo-3.wav", playlist: "durga_puja", position: 11 },
  { title: "Progoan — Mahalaya Raga", artist: "Sri Aurobindo", duration: "5:56", coverUrl: "/images/covers/mahalaya.jpg", audioUrl: "/audio/demo-2.wav", playlist: "mahalaya", position: 1 },
  { title: "Ma Tumi Jaai", artist: "Kishore Kumar", duration: "3:12", coverUrl: "/images/covers/dugga-ma.jpg", audioUrl: "/audio/demo-4.wav", playlist: "mahalaya", position: 2 },
  { title: "Mahalaya Progoan (Live)", artist: "Ravi Shankar", duration: "6:04", coverUrl: "/images/covers/mahalaya.jpg", audioUrl: "/audio/demo-1.wav", playlist: "mahalaya_songs", position: 1 },
  { title: "Ma Amar Ma", artist: "Kishore Kumar", duration: "3:52", coverUrl: "/images/covers/pujo.jpg", audioUrl: "/audio/demo-3.wav", playlist: "mahalaya_songs", position: 2 },
];

async function ensureSeed() {
  await ensureSchema();
  const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(songs);
  if (c > 0) return;

  await db.insert(siteSettings).values({
    bengaliTitle: "পুজো আসছে",
    onlineCount: 125,
    pujoDate: isoDatePlusDays(11),
    heroImage: "/images/hero-pandal.jpg",
    contactEmail: "devipakshaa@gmail.com",
    youtubeUrl: "",
    spotifyUrl: "",
    coffeeUrl: "",
    dhakLabel: "Dhak",
  });

  await db.insert(creators).values([
    { name: "Ritam Biswas", photoUrl: "", linkedin: "", instagram: "", position: 1 },
    { name: "Arup Matubber", photoUrl: "", linkedin: "", instagram: "", position: 2 },
  ]);

  await db.insert(songs).values(
    seedSongs.map((s) => ({ ...s, audioUrl: s.audioUrl, youtubeUrl: null, coverUrl: s.coverUrl })),
  );
}

export async function GET() {
  await ensureSeed();
  const [settings] = await db.select().from(siteSettings);
  const creatorsList = await db.select().from(creators).orderBy(asc(creators.position));
  const songsList = await db.select().from(songs).orderBy(asc(songs.playlist), asc(songs.position));
  return Response.json({ settings, creators: creatorsList, songs: songsList });
}
