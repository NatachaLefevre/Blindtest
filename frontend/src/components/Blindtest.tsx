import { useReducer, useState, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
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

// 🔣 Fonction de nettoyage des textes (supprime les accents, ponctuations, etc.)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // décompose les accents
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^\w\s]|_/g, '') // enlève la ponctuation
    .replace(/\s+/g, ' ') // espace simple
    .trim();
}

// 🔍 Fonction pour comparer la réponse du joueur et la réponse de la base de données
function isCloseEnough(a: string, b: string): boolean {
  const normA = normalize(a);
  const normB = normalize(b);
  const distance = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return distance / maxLen < 0.20; // 20% de différence max
}

// 🔠 Fonction de distance de Levenshtein
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}


export default function Blindtest() {

  // 📝 États pour gérer les différentes fonctions du jeu.
  // Ils sont regroupés pour simplifier la gestion de l'état du jeu

  // ⚙️ Deviner le titre, l'artiste ou les deux
  const [answerParts, setAnswerParts] = useState<string[]>(['title']);

  // 🧠 États du jeu centralisés via useReducer. GameState se trouve dans GameReducer.ts
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // ✅ Catégories cochées par l'utilisateur
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 📦 Liste complète des morceaux récupérés depuis le backend
  const [trackList, setTrackList] = useState<Track[]>([]);

  // 🆕 Message d'erreur affiché si aucun champ "Titre" ou "Artiste" n'est sélectionné
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ États (regroupés) pour valider ou invalider les réponses Titre et Artiste
  const [validationState, setValidationState] = useState({
    titleCorrect: false,
    artistCorrect: false,
    inputErrorTitle: false,
    inputErrorArtist: false,
  });


  // 🔁 Appel API pour récupérer les morceaux depuis Supabase
  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tracks?select=*&verified=is.true`, {

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

  // 📝 Les guesses du joueur pour le titre et l'artiste
  const { titleGuess, artistGuess } = gameState;

  // 🎯 Le morceau en cours depuis la liste filtrée
  const currentTrack = filteredTracks[gameState.currentTrackIndex];

  // ⏱ Timer déclenché uniquement si un extrait est en cours
  useEffect(() => {
    let countdown: NodeJS.Timeout;

    if (gameState.isPlaying && gameState.timer > 0 && !gameState.revealAnswer) {
      countdown = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
    }

    if (gameState.timer === 0 && !gameState.revealAnswer) {
      dispatch({ type: 'REVEAL_ANSWER' });
    }

    return () => clearTimeout(countdown);
  }, [gameState]);


  // ▶️ Pour lancer l'extrait (prévoir aléatoire). Message d'erreur si aucun champ n'est sélectionné.
  // Il faut retirer le message quand un champ est sélectionné.
  const handlePlay = () => {
    if (answerParts.length === 0) {
      setErrorMessage('❌ Il faut sélectionner au moins "Titre" ou "Artiste" pour commencer, mon petit lapin.');
      return;
    }
    setErrorMessage('');
    dispatch({ type: 'START_GAME' });
  };



  // ✅ Conditions des validation des réponses
  // Vérifie si le titre et/ou l'artiste sont corrects
  // Si les deux sont corrects, on affiche la réponse et on arrête le lecteur
  // On utilise la fonction normalize pour comparer les réponses de l'utilisateur avec celles du morceau

  const handleCheck = () => {
    const userTitle = titleGuess.trim();
    const userArtist = artistGuess.trim();
    const correctTitle = currentTrack.title.trim();
    const correctArtist = currentTrack.artist.trim();

    const wantsTitle = answerParts.includes('title');
    const wantsArtist = answerParts.includes('artist') && currentTrack.artist.trim() !== '';
    // Si l’artiste est vide dans la BDD, on ne cherche pas à valider la réponse

    const isTitleCorrect = !wantsTitle || isCloseEnough(userTitle, correctTitle);
    const isArtistCorrect = !wantsArtist || isCloseEnough(userArtist, correctArtist);
    const allCorrect = isTitleCorrect && isArtistCorrect;

    setValidationState({
      titleCorrect: wantsTitle && isTitleCorrect,
      artistCorrect: wantsArtist && isArtistCorrect,
      inputErrorTitle: wantsTitle && !isTitleCorrect,
      inputErrorArtist: wantsArtist && !isArtistCorrect,
    });


    if (allCorrect) {
      dispatch({ type: 'REVEAL_ANSWER' });

    }
  };


  // 🎵 Passer au morceau suivant (prévoir de l'aléatoire)
  const handleNext = () => {
    setValidationState({
      titleCorrect: false,
      artistCorrect: false,
      inputErrorTitle: false,
      inputErrorArtist: false,
    });

    dispatch({
      type: 'NEXT_TRACK',
      totalTracks: filteredTracks.length,
    });
  };


  // ⏳ Si le site rame, ça affiche un chargement pour faire patienter
  if (!currentTrack) {
    return <p className="text-center mt-8">Veuillez patienter...</p>;
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-6 bg-white rounded-lg shadow w-full max-w-xl mx-auto mt-8">

      {/* Choisir de deviner Titre, Artiste ou les deux */}
      <div className="flex gap-4 items-center">
        <span className="text-sm font-semibold">Deviner :</span>
        {['title', 'artist'].map((part) => (
          <button
            key={part}
            onClick={() => {
              if (answerParts.includes(part)) {
                setAnswerParts(answerParts.filter((p) => p !== part));
              } else {
                setAnswerParts([...answerParts, part]);
              }
            }}
            className={`cursor-pointer text-sm px-4 py-1 rounded border ${answerParts.includes(part)
              ? 'bg-purple-500 text-white border-purple-500'
              : 'bg-white text-purple-600 hover:bg-purple-200 hover:shadow border-purple-500'
              }`}
          >
            {part === 'title' ? 'Titre' : 'Artiste'}
          </button>
        ))}
      </div>

      {/* ✅ Sélection des catégories */}
      <div className="text-center mb-4">
        <span className="text-sm font-semibold">Catégories</span>
        <CategorySelector
          selectedCategories={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {/* ▶️ Bouton pour lancer la musique */}
      {!gameState.revealAnswer && !gameState.isPlaying && (
        <>
          <button
            onClick={handlePlay}
            className="cursor-pointer bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-10 rounded transition"
          >
            ▶ Lancer l'extrait
          </button>

          {/* ❌ Message d'erreur si aucun champ n'est sélectionné */}
          {errorMessage && (
            <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
          )}
        </>
      )}

      {/* ⏱ Affichage du timer */}
      {!gameState.revealAnswer && gameState.isPlaying && (
        <p className="text-sm text-gray-600">
          ⏳ Temps restant : {gameState.timer}s
        </p>
      )}

      {/* Valider la réponse en cliquant sur le bouton ou en appuyant sur Entrée*/}
      <form onSubmit={(e) => {
        e.preventDefault(); // 🔒 Empêche le rechargement de la page
        handleCheck();      // ✅ Déclenche la vérif de la réponse
      }}
        className="w-full text-center space-y-4">

        {/* 📝 Champ pour le titre. Ne s'affiche que quand "Titre" est affiché */}
        {answerParts.includes('title') && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Quoi que c'est ? (Titre)"
              className="border border-orange-500 text-center rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={titleGuess}
              onChange={(e) =>
                dispatch({ type: 'SET_GUESS', payload: { title: e.target.value } })
              }

              disabled={gameState.revealAnswer}
            />
            {validationState.titleCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {validationState.inputErrorTitle && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}

        {/* 📝 Champ pour l’artiste. Ne s'affiche que quand "Artiste" est affiché */}
        {answerParts.includes('artist') && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder={
                // Si l'artiste est vide dans la BDD, on affiche un message différent
                currentTrack.artist.trim() === ''
                  ? 'Artiste non connu.e (ne rien écrire)'
                  : "Qui qui c'est ? (Artiste)"
              }
              className="border border-purple-500 text-center rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={artistGuess}
              onChange={(e) =>
                dispatch({ type: 'SET_GUESS', payload: { artist: e.target.value } })
              }

              disabled={gameState.revealAnswer}
            />
            {validationState.artistCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {validationState.inputErrorArtist && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}

        {/* ✅ Bouton pour valider la réponse */}
        <button
          type="submit" // 🆗 Ou on peut ne rien mettre : par défaut c’est "submit"
          disabled={gameState.revealAnswer || !gameState.isPlaying}
          className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-10 rounded shadow transition"
        >
          Valider la réponse
        </button>

      </form>


      {/* 🎥 Lecteur Youtube visible uniquement à la fin du timer, ou quand la bonne réponse a été trouvée */}
      {gameState.showPlayer && (
        <YoutubePlayer
          videoId={currentTrack.videoId}
          start={currentTrack.start}
          end={currentTrack.start + 50} // On joue 50 secondes à partir du début
          showVideo={gameState.revealAnswer}
        />
      )}

      {/* 🎉 Affichage de la bonne réponse */}
      {gameState.revealAnswer && (
        <div className="text-center">
          <p className="text-lg text-gray-700">

            {/* Si pas d'artiste, pas de tiret devant le titre */}
            🎵 <strong>{currentTrack.artist ? `${currentTrack.artist} - ` : ''}  {currentTrack.title}</strong>

          </p>
          <button
            onClick={handleNext}
            className="cursor-pointer mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded"
          >
            ▶ Morceau suivant
          </button>
        </div>
      )}
    </div >
  );
}