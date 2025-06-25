import { useState, useEffect } from 'react';
import YoutubePlayer from './YoutubePlayer';
import CategorySelector from './CategorySelector';

// 🎵 Définition du type de morceau utilisé
type Track = {
  title: string;
  artist: string;
  videoId: string;
  start: number;
  category: string;
};

export default function Blindtest() {
  // 📝 États pour gérer la réponse de l'utilisateur, le morceau en cours, le timer, etc.
  // Possibilité de réduire le nombre de useState ? 
  // On pourrait regrouper guess et revealAnswer dans un seul objet d'état, mais pour la clarté, 
  // on les garde séparés pour l'instant.
  const [guess, setGuess] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Catégories cochées par l'utilisateur
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 📦 Liste complète des morceaux récupérés depuis le backend
  const [trackList, setTrackList] = useState<Track[]>([]);

  // 🔁 Appel API pour récupérer les morceaux depuis Supabase
useEffect(() => {
  fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tracks?select=*`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    }
  })
    .then((res) => res.json())
    .then((data) => setTrackList(data))
    .catch((error) => console.error('Erreur chargement Supabase :', error));
}, []);


  // 🔎 Les morceaux sont filtrés selon les catégories sélectionnées par les joueurs
  const filteredTracks = trackList.filter(
    (track) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(track.category)
  );

  // 🎯 Le morceau en cours depuis la liste filtrée
  const currentTrack = filteredTracks[currentTrackIndex];

  // ⏱ Timer déclenché uniquement si un extrait est en cours
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isPlaying && timer > 0 && !revealAnswer) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }

    // 🚨 Si le temps est écoulé : on montre la réponse
    if (timer === 0 && !revealAnswer) {
      setRevealAnswer(true);
      setShowPlayer(true);
    }

    return () => clearTimeout(countdown);
  }, [isPlaying, timer, revealAnswer]);

  // ▶️ Pour lancer l'extrait (prévoir aléatoire))
  const handlePlay = () => {
    setIsPlaying(true);
    setShowPlayer(true);
  };

  // ✅ Validation de la réponse
  const handleCheck = () => {
    const userAnswer = guess.trim().toLowerCase();
    const correctAnswer = currentTrack.title.trim().toLowerCase();

    // Une alerte s'affiche suivant si la réponse est bonne ou mauvaise (à remplacer)
    if (userAnswer === correctAnswer) {
      setRevealAnswer(true);
      setShowPlayer(true);
      setIsPlaying(false);
      alert('✅ Bonne réponse, bravo !');
    } else {
      alert('❌ Ah, c\'est dommage...');
    }
  };

  // 🎵 Passer au morceau suivant (prévoir de l'aléatoire)
  const handleNext = () => {
    setGuess('');
    setTimer(30);
    setRevealAnswer(false);
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => (prev + 1) % filteredTracks.length);
  };

  // ⏳ Si le site rame, ça affiche un chargement pour faire patienter
  if (!currentTrack) {
    return <p className="text-center mt-8">Chargement du blindtest...<br/>Mais en vrai si vous voyez ça c'est probablement que ça bugue...</p>;
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-6 bg-white rounded-lg shadow w-full max-w-xl mx-auto mt-8">

      {/* ✅ Sélection des catégories */}
      <CategorySelector
        selectedCategories={selectedCategories}
        onChange={setSelectedCategories}
      />

      {/* ▶️ Bouton pour lancer la musique */}
      {!revealAnswer && !isPlaying && (
        <button
          onClick={handlePlay}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-10 rounded shadow transition"
        >
          ▶️ Lancer l'extrait
        </button>
      )}

      {/* ⏱ Affichage du timer */}
      {!revealAnswer && isPlaying && (
        <p className="text-sm text-gray-600">
          ⏳ Temps restant : {timer}s
        </p>
      )}

      {/* 📝 Champ de réponse */}
      <input
        type="text"
        placeholder="Devine le titre du morceau"
        className="border border-gray-300 rounded px-4 text-center py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={revealAnswer}
      />

      {/* ✅ Bouton pour valider la réponse */}
      <button
        onClick={handleCheck}
        disabled={revealAnswer || !isPlaying}
        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-10 rounded transition"
      >
        ✅ Valider la réponse
      </button>

      {/* 🎥 Lecteur Youtube visible uniquement à la fin du timer, ou quand la bonne réponse a été trouvée */}
      {showPlayer && (
        <YoutubePlayer
          videoId={currentTrack.videoId}
          start={currentTrack.start}
          end={currentTrack.start + 50} // On joue 50 secondes à partir du début
          showVideo={revealAnswer}
        />
      )}

      {/* 🎉 Affichage de la bonne réponse */}
      {revealAnswer && (
        <div className="text-center">
          <p className="text-lg text-gray-700">
            🎵 C'était : <strong>{currentTrack.artist} - {currentTrack.title}</strong>
          </p>
          <button
            onClick={handleNext}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded"
          >
            ▶️ Morceau suivant
          </button>
        </div>
      )}
    </div>
  );
}
