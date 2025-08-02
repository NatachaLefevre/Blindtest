// Script de nettoyage et correction intelligent des morceaux
// Lancer avec : node cleanTracks.js

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Connexion à Supabase + API YouTube
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🧼 Fonction de nettoyage des titres ou artistes
function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/(official|video|hd|version|main title|soundtr|sountrck|soundtrack|ost|full album|audio)/gi, '')
    .replace(/(lyrics|original|score|theme|from\s+"[^"]+"|from\s+[^-–]+[-–]?)/gi, '')
    .replace(/[\[\(].*?[\]\)]/g, '') // contenu entre () ou []
    .replace(/[-–_]/g, ' ') // tirets → espaces
    .replace(/\s{2,}/g, ' ') // double espace → simple
    .trim();
}

// 🔤 Nettoyage spécifique depuis un titre YouTube brut
function extractCleanTitle(youtubeTitle) {
  if (!youtubeTitle) return '';
  return youtubeTitle
    .replace(/(official|video|hd|soundtrack|ost|lyrics|version|audio|theme|score|from .*)/gi, '')
    .replace(/[\[\(].*?[\]\)]/g, '')
    .replace(/[-–_]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// 🔍 Récupération du vrai titre YouTube
async function getYoutubeTitle(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;
  return data.items[0].snippet.title;
}

// 🚿 Nettoyage intelligent
async function cleanTracks() {
  console.log('🧠 Nettoyage intelligent des morceaux...\n');

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, artist, artist_type, category, manual_override, videoId')
    .eq('manual_override', false)
    .not('videoId', 'is', null)
    .neq('videoId', '');

  if (error) {
    console.error('❌ Erreur Supabase :', error.message);
    return;
  }

  let updated = 0;

  for (const track of tracks) {
    let { title: originalTitle, artist: originalArtist } = track;

    // 1. Récupérer le vrai titre YouTube
    const youtubeTitle = await getYoutubeTitle(track.videoId);
    if (youtubeTitle) {
      originalTitle = extractCleanTitle(youtubeTitle);
    }

    // 2. Si artist est vide, tenter une extraction depuis le titre
    if (!originalArtist && originalTitle.includes('-')) {
      const parts = originalTitle.split('-');
      if (parts.length >= 2) {
        originalArtist = parts[0].trim();
        originalTitle = parts.slice(1).join('-').trim();
      }
    }

    // 3. Nettoyage
    const cleanedTitle = cleanString(originalTitle);
    const cleanedArtist = cleanString(originalArtist);

    // 4. Déduction du type d’artiste
    let artistType = track.artist_type || 'interprète';
    const cat = track.category?.toLowerCase();
    if (['films', 'séries', 'films d’animation', 'films d animation', 'séries animées'].includes(cat)) {
      artistType = 'compositeur';
    }

    // 5. Mise à jour uniquement si changement
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

      console.log(`✅ "${track.title}" → "${cleanedTitle}"`);
      updated++;
    }
  }

  console.log(`\n🎉 Nettoyage terminé : ${updated} morceaux mis à jour.`);
}

cleanTracks();
