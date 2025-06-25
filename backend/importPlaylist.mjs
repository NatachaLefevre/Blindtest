import 'dotenv/config';
import fetch from 'node-fetch';

// Récupération des variables d'environnement
const API_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Erreur : clé API YouTube ou Supabase manquante dans .env');
  process.exit(1);
}

// Fonction pour extraire l'ID de la playlist
function extractPlaylistId(url) {
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : null;
}

const playlistUrl = process.argv[2];
const playlistId = extractPlaylistId(playlistUrl);

if (!playlistId) {
  console.error('❌ Veuillez fournir une URL de playlist YouTube valide.');
  process.exit(1);
}

console.log(`🔎 Lecture de la playlist ${playlistId}...`);

const allVideos = [];

let nextPageToken = '';
while (true) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) {
    console.error('❌ Erreur YouTube API :', data.error?.message || data);
    break;
  }

  for (const item of data.items) {
    const snippet = item.snippet;
    const title = snippet.title;
    const videoId = snippet.resourceId.videoId;

    // Tentative de découpage simple du titre pour trouver artist / title
    let parsedTitle = title;
    let artist = 'Inconnu';
    if (title.includes('-')) {
      const parts = title.split('-');
      artist = parts[0].trim();
      parsedTitle = parts.slice(1).join('-').trim();
    }

    allVideos.push({
      title: parsedTitle,
      artist,
      videoId,
      category: 'à trier',
      start: 30,
      verified: false
    });
  }

  if (!data.nextPageToken) break;
  nextPageToken = data.nextPageToken;
}

console.log(`🎵 ${allVideos.length} morceaux trouvés. Envoi vers Supabase...`);

for (const track of allVideos) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/tracks`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(track)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erreur pour "${track.title}":`, errorText);
  } else {
    console.log(`✅ Ajouté : ${track.title}`);
  }
}

console.log('✅ Importation terminée.');
