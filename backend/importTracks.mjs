import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import tracks from './tracks.json' with { type: 'json' }; 
//  On peut mettre "with" au lieu de "assert", mais c'est expérimental et pas encore standardisé.
//  On utilise "assert" pour s'assurer que le fichier est bien un JSON (mais pas accepté sur ce projet).

dotenv.config();

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

async function importTracks() {
  for (const track of tracks) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tracks`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(track),
    });

    if (!response.ok) {
      console.error(`❌ Erreur pour le morceau "${track.title}"`);
      const errorData = await response.json();
      console.error(`Détails de l'erreur : ${errorData.message}`);
    } else {
      console.log(`✅ Importé : ${track.title}`);
    }
  }
}

importTracks();