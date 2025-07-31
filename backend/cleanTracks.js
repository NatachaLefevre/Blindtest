// Script pour nettoyer les titres et artistes des morceaux
// Lancer avec : node cleanTracks.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Connexion à Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🧼 Fonction de nettoyage texte
function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/(official|video|hd|version|main title|soundtr|sountrck|soundtrack|ost|full album|audio)/gi, '')
    .replace(/(lyrics|original|score|theme|from\s+"[^"]+"|from\s+[^-–]+[-–]?)/gi, '')
    .replace(/[\[\(].*?[\]\)]/g, '') // Supprime contenu entre () ou []
    .replace(/[-–_]/g, ' ') // remplace les tirets et underscores par des espaces
    .replace(/\s{2,}/g, ' ') // remplace les doubles espaces par un seul
    .trim();
}

// Fonction principale
async function cleanTracks() {
  console.log('🚿 Nettoyage des morceaux en cours...\n');

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, artist, manual_override, videoId')
    .eq('manual_override', false)
    .not('videoId', 'is', null)
    .neq('videoId', '');

  if (error) {
    console.error('❌ Erreur lors de la récupération des morceaux :', error.message);
    return;
  }

  let cleaned = 0;

for (const track of tracks) {
  let { title: originalTitle, artist: originalArtist } = track;

  // 🧠 Tentative d'extraction automatique si artist est vide
  if (!originalArtist && originalTitle.includes('-')) {
    const parts = originalTitle.split('-');
    if (parts.length >= 2) {
      const possibleArtist = parts[0].trim();
      const possibleTitle = parts.slice(1).join('-').trim();
      originalArtist = possibleArtist;
      originalTitle = possibleTitle;
    }
  }

  // 🧼 Nettoyage des chaînes
  const cleanedTitle = cleanString(originalTitle);
  const cleanedArtist = cleanString(originalArtist);

  // 🎬 Déduction du type d'artiste (compositeur ou interprète)
  let artistType = track.artist_type || 'interprète'; // Valeur par défaut
  const category = track.category?.toLowerCase();
  if (['film', 'série', 'films d\'animation', 'animation'].includes(category)) {
    artistType = 'compositeur';
  }

  // ✅ Mise à jour si au moins un champ a changé
  if (
    cleanedTitle !== track.title ||
    cleanedArtist !== track.artist ||
    artistType !== track.artist_type
  ) {
    await supabase
      .from('tracks')
      .update({
        title: cleanedTitle,
        artist: cleanedArtist,
        artist_type: artistType,
      })
      .eq('id', track.id);

    cleaned++;
    console.log(`✅ Nettoyé : "${track.title}" → "${cleanedTitle}"`);
  }
}

  console.log(`\n✨ Nettoyage terminé : ${cleaned} morceaux mis à jour.`);
}

cleanTracks();
