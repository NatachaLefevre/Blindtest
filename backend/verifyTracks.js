// Pour vérifier la disponibilité des vidéos YouTube et mettre à jour la base de données Supabase
// Pour lancer le script : node verifyTracks.js

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔍 Vérifie si une vidéo YouTube est publique et intégrable
async function isVideoAvailable(videoId) {

  // 1. Vérifie statut via l’API YouTube
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    return false; // vidéo supprimée ou inexistante
  }

// Vérifie si la vidéo est embed (disponible pour intégration) et publique
  const status = data.items[0].status;
  const embeddable = status.embeddable && status.privacyStatus === 'public';

  if (!embeddable) return false;

  // Test réel de l'embed avec oEmbed pour s'assurer que la vidéo est intégrable sur n'importe quel site
  // Cela permet de vérifier si la vidéo est bloquée dans certains pays ou si elle a des restrictions
  // Note : oEmbed est une API standard pour récupérer des informations sur les contenus intégrables
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}`);

    return oembedRes.ok;
  } catch (err) {
    console.warn(`⚠️ Erreur oEmbed : ${err.message}`);
    return false;
  }
}

// 🔁 Parcourt des morceaux et supprime ceux qui sont invalides
async function cleanBrokenTracks() {
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, videoId');

  if (error) {
    console.error('❌ Erreur Supabase :', error.message);
    return;
  }

  let checked = 0;
  let deleted = 0;

  for (const track of tracks) {
    const valid = await isVideoAvailable(track.videoId);

    if (!valid) {
      deleted++;
      console.log(`🗑️ Suppression de "${track.title}" (${track.videoId})`);

      // Suppression dans Supabase
      await supabase.from('tracks').delete().eq('id', track.id);
    } else {
      console.log(`✅ OK : ${track.title}`);
    }

    checked++;
  }

  console.log(`\n🔍 ${checked} morceaux vérifiés`);
  console.log(`🧹 ${deleted} morceaux supprimés (vidéos non valides)`);
}

cleanBrokenTracks();
