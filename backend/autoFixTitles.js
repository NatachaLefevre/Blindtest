// Script pour corriger automatiquement les titres des pistes dans la base de données
// Utilise l'API YouTube pour obtenir les titres corrects
// Lancer avec : node autoFixTitles.js

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Authentification
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔤 Nettoyage basique d’un titre YouTube
function extractCleanTitle(youtubeTitle) {
  if (!youtubeTitle) return '';

  return youtubeTitle
    .replace(/(official|video|hd|soundtrack|ost|lyrics|version|audio|theme|score|from .*)/gi, '')
    .replace(/[\[\(].*?[\]\)]/g, '') // supprime (truc) ou [truc]
    .replace(/[-–_]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// 🔍 Récupère le vrai titre YouTube via son videoId
async function getYoutubeTitle(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return null;
  return data.items[0].snippet.title;
}

// 🚀 Fonction principale
async function autoFixTitles() {
  console.log('🔍 Correction automatique des titres via YouTube API\n');

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, artist, videoId, manual_override')
    .eq('manual_override', false)
    .not('videoId', 'is', null)
    .neq('videoId', '');

  if (error) {
    console.error('❌ Erreur chargement Supabase :', error.message);
    return;
  }

  let updated = 0;

  for (const track of tracks) {
    const youtubeTitle = await getYoutubeTitle(track.videoId);
    if (!youtubeTitle) {
      console.log(`⚠️ Impossible de récupérer le titre de ${track.videoId}`);
      continue;
    }

    const cleaned = extractCleanTitle(youtubeTitle);

    // Si le titre est vide ou déjà propre, on ignore
    if (!cleaned || cleaned.toLowerCase() === track.title.toLowerCase()) continue;

    // On met à jour uniquement si c’est un vrai changement
    await supabase
      .from('tracks')
      .update({ title: cleaned })
      .eq('id', track.id);

    console.log(`✅ "${track.title}" → "${cleaned}"`);
    updated++;
  }

  console.log(`\n🎉 ${updated} titres corrigés via YouTube.`);
}

autoFixTitles();