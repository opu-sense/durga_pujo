export type PlaylistKey = "durga_puja" | "mahalaya" | "mahalaya_songs";

export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string | null;
  youtubeUrl: string | null;
  coverUrl: string | null;
  playlist: PlaylistKey;
  position: number;
}

export interface Settings {
  id: number;
  bengaliTitle: string;
  onlineCount: number;
  pujoDate: string;
  heroImage: string;
  contactEmail: string;
  youtubeUrl: string;
  spotifyUrl: string;
  coffeeUrl: string;
  dhakLabel: string;
}

export interface Creator {
  id: number;
  name: string;
  photoUrl: string | null;
  linkedin: string;
  instagram: string;
  position: number;
}

export const PLAYLISTS: { key: PlaylistKey; label: string; desc: string }[] = [
  { key: "durga_puja", label: "Durga Puja", desc: "The main curated Durga Puja playlist." },
  { key: "mahalaya", label: "Mahalaya", desc: "Mahalaya progoan, chants and ragas." },
  { key: "mahalaya_songs", label: "Mahalaya Songs", desc: "Songs to mark Mahalaya day." },
];

export function playlistInfo(key: string) {
  return PLAYLISTS.find((p) => p.key === key) ?? PLAYLISTS[0];
}

export function isPlaylistKey(v: string): v is PlaylistKey {
  return v === "durga_puja" || v === "mahalaya" || v === "mahalaya_songs";
}
