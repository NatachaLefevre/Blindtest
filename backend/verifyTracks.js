// Pour vérifier la disponibilité des vidéos YouTube et mettre à jour la base de données Supabase
// Pour lancer le script : node verifyTracks.js

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// 🔐 Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ⚙️ Fonction de test d’un videoId
async function isVideoAvailable(videoId) {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${videoId}&key=${YOUTUBE_API_KEY}`);
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    return false; // vidéo supprimée ou inexistante
  }

  const status = data.items[0].status;
  return status.embeddable && status.privacyStatus === 'public';
}

// 🔁 Vérification de tous les morceaux
async function verifyAllTracks() {
  const { data: tracks, error } = await supabase.from('tracks').select('id, title, videoId, verified');

  if (error) {
    console.error('❌ Erreur Supabase :', error.message);
    return;
  }

  let checked = 0;
  let broken = 0;

  for (const track of tracks) {
    const valid = await isVideoAvailable(track.videoId);

    if (!valid && track.verified !== false) {
      broken++;
      console.log(`❌ Vidéo cassée : "${track.title}" (${track.videoId})`);

      // Optionnel : met à jour Supabase
      await supabase
        .from('tracks')
        .update({ verified: false })
        .eq('id', track.id);
    } else if (valid && track.verified !== true) {
      console.log(`✅ Vidéo OK : ${track.title}`);
      await supabase
        .from('tracks')
        .update({ verified: true })
        .eq('id', track.id);
    }

    checked++;
  }

  console.log(`\n✅ Vérification terminée : ${checked} morceaux scannés, ${broken} vidéos cassées.`);
}

verifyAllTracks();
