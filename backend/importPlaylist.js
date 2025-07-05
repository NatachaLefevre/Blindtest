// Pour lancer le script : node importPlaylist.js

// Pour importer une nouvelle playlist Youtube, modifier :
// const PLAYLIST_ID = 'id_de_la_playlist';
// const CATEGORY = 'nom_de_la_catégorie'; 


import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PLAYLIST_ID = 'PLvbYDaefm3SOSCLDV5QoRLxk54SH3V_vU'; // à personnaliser
const CATEGORY = 'séries animées'; // à personnaliser
const START_TIME = 30; // 30s par défaut. À modifier dans Supabase si besoin

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Fonction pour récupérer les éléments d'une playlist YouTube
// Gère la pagination pour récupérer tous les éléments
async function fetchPlaylistItems(playlistId) {
  // items contient tous les éléments de la playlist
  // nextPageToken permet de gérer la pagination (par défaut, l'API Youtube limite à 50 vidéos par appel)
  let items = [];
  let nextPageToken = '';

  // Boucle pour récupérer tous les éléments de la playlist
  // continue tant qu'il y a un nextPageToken pour récupérer toute la playlist, même si elle fait + de 50 vidéos
  // On utilise fetch pour appeler l'API YouTube
  do {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${nextPageToken}&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
    );

    // Transforme la réponse en objet json
    const data = await res.json();

    // Gestion d'erreur
    if (data.error) {
      console.error('❌ Erreur API YouTube :', data.error.message);
      return [];
    }

    // Ajoute les éléments récupérés à la liste des items
    // nextPageToken est mis à jour pour la prochaine itération
    items = [...items, ...data.items];
    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return items;
}

// Fonction principale pour importer les éléments de la playlist dans Supabase
// Pour chaque élément, on insère un enregistrement dans la table 'tracks'
async function importPlaylist() {
  const items = await fetchPlaylistItems(PLAYLIST_ID);

  for (const item of items) {
    const title = item.snippet.title;
    const videoId = item.snippet.resourceId.videoId;

    // Vérification si la vidéo est déjà importée
    const { error } = await supabase.from('tracks').insert([
      {
        title,
        artist: '', // à remplir manuellement ou à déduire plus tard
        videoId,
        start: START_TIME,
        category: CATEGORY
      }
    ]);

    if (error) {
      console.error(`❌ Erreur import : ${title}`, error.message);
    } else {
      console.log(`✅ Importé : ${title}`);
    }
  }
}

importPlaylist();
