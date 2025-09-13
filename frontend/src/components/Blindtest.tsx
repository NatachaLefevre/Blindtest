import { useReducer, useState, useEffect, useMemo, useRef } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { isCloseEnough } from '../utils/validation';
import { categoriesWithTypeTitle, shuffleArray } from '../utils/gameHelpers';
import YoutubePlayer from './YoutubePlayer';
import CategorySelector from './CategorySelector';
import '../styles/Blindtest.css'


// 📝 Queue de l'index
// (déplacé dans le composant Blindtest)

// 🎵 Définition du type de morceau utilisé
type Track = {
  title: string;
  artist: string;
  artist_type?: string; // Type d'artiste (interprète ou compositeur)
  videoId: string;
  start: number;
  category: string;
};



export default function Blindtest() {

  // 📝 États pour gérer les différentes fonctions du jeu.
  // Ils sont regroupés pour simplifier la gestion de l'état du jeu

  // 🧠 États du jeu centralisés via useReducer. GameState se trouve dans GameReducer.ts
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // ⚙️ Deviner Titre, ou Titre + Artiste
  const [answerMode, setAnswerMode] = useState<'title' | 'title+artist'>('title');

  // 📝 Queue de l'index
  const [shuffledQueue, setShuffledQueue] = useState<number[]>([]);

  // ✅ Catégories cochées par l'utilisateur
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 📦 Liste complète des morceaux récupérés depuis le backend
  const [trackList, setTrackList] = useState<Track[]>([]);

  // ✅ États (regroupés) pour valider ou invalider les réponses Titre et Artiste
  const [validationState, setValidationState] = useState({
    titleCorrect: false,
    artistCorrect: false,
    inputErrorTitle: false,
    inputErrorArtist: false,
  });

  // ⚙️ Forcer l'autofocus sur le champ Titre à chaque lancement de morceau
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (titleInputRef.current && (gameState.isPlaying || gameState.revealAnswer)) {
      titleInputRef.current.focus();
    }
  }, [gameState.currentTrackIndex, gameState.isPlaying, gameState.revealAnswer]);


  // 🔁 Appel API pour récupérer les morceaux depuis Supabase
  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tracks?select=*&verified=is.true`, {

      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      }
    })
      .then((res) => res.json())
      .then((data: Track[]) => {
        setTrackList(data);

        // 🔹 On sélectionne toutes les catégories uniques par défaut
        const allCategories = Array.from(new Set(data.map(track => track.category)));
        setSelectedCategories(allCategories);
      })

      .catch((error) => console.error('Erreur chargement Supabase :', error));
  }, []);


  // 🔎 Les morceaux sont filtrés selon les catégories sélectionnées par les joueurs
  const filteredTracks = useMemo(() => {
    return trackList.filter((track) => {

      // Si aucune catégorie n'est sélectionnée, on affiche tous les morceaux
      const inSelectedCategories =
        selectedCategories.length === 0 ||
        selectedCategories.includes(track.category);

      // Mode "Titre + Artiste" → exclure les morceaux sans artiste
      if (answerMode === 'title+artist' && track.artist.trim() === '') {
        return false;
      }

      return inSelectedCategories;
    });

  }, [trackList, selectedCategories, answerMode]);


  // 🃏 On mélange les morceaux filtrés pour qu'ils se lancent de manière aléatoire
  useEffect(() => {
    if (filteredTracks.length > 0) {

      // On crée une liste d'indices pour les morceaux filtrés pour pouvoir les mélanger facilement
      const indices = filteredTracks.map((_, index) => index);

      // On utilise le premier morceau mélangé pour démarrer le jeu
      const shuffled = shuffleArray(indices);
      const [first, ...rest] = shuffled;
      dispatch({ type: 'SET_INDEX', index: first });
      setShuffledQueue(rest);
    }

  }, [filteredTracks]);

  // Réinitialiser la validation quand on change de mode
  useEffect(() => {
    setValidationState({
      titleCorrect: false,
      artistCorrect: false,
      inputErrorTitle: false,
      inputErrorArtist: false,
    });
  }, [answerMode]);


  // 📝 Les guesses du joueur pour le titre et l'artiste
  const { titleGuess, artistGuess } = gameState;

  // 🎯 Le morceau en cours depuis la liste filtrée
  const currentTrack = filteredTracks[gameState.currentTrackIndex];

  // Type de contenu à afficher dans le champ titre (film, série, etc.)
  // Préciser à TypeScript que currentTrack.category est une clé de categoriesWithTypeTitle
  // On s'assure que currentTrack est défini avant d'accéder à categoriesWithTypeTitle
  const typeTitle = currentTrack
    ? categoriesWithTypeTitle[currentTrack.category as keyof typeof categoriesWithTypeTitle] || ''
    : '';

  // ⏱ Timer déclenché uniquement si un extrait est en cours
  useEffect(() => {
    if (gameState.isPlaying && gameState.timer > 0 && !gameState.revealAnswer) {
      const countdown = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
      return () => clearTimeout(countdown);
    }

    if (gameState.timer === 0 && !gameState.revealAnswer) {
      dispatch({ type: 'REVEAL_ANSWER' });
    }

    // Sinon, pas de countdown = pas de nettoyage à faire
    return () => { };
  }, [gameState]);



  // ▶️ Pour lancer l'extrait.
  const handlePlay = () => {
    dispatch({ type: 'START_GAME' });
  };


  // ✅ Conditions des validation des réponses
  const handleCheck = () => {
    const userTitle = titleGuess.trim();
    const userArtist = artistGuess.trim();
    const correctTitle = currentTrack.title.trim();
    const correctArtist = currentTrack.artist.trim();

    // On vérifie si au moins un champ est rempli
    const wantsTitle = true;
    const wantsArtist = answerMode === 'title+artist' && currentTrack.artist.trim() !== '';

    // On vérifie si les réponses du joueur sont correctes
    const isTitleCorrect = !wantsTitle || isCloseEnough(userTitle, correctTitle);
    const isArtistCorrect = !wantsArtist || isCloseEnough(userArtist, correctArtist);
    const allCorrect = isTitleCorrect && isArtistCorrect;

    setValidationState({
      titleCorrect: wantsTitle && isTitleCorrect,
      artistCorrect: wantsArtist && isArtistCorrect,
      inputErrorTitle: wantsTitle && !isTitleCorrect,
      inputErrorArtist: wantsArtist && !isArtistCorrect,
    });

    // Si les deux réponses sont correctes, on révèle la réponse
    if (allCorrect) {
      dispatch({ type: 'REVEAL_ANSWER' });

    }
  };


  // 🎵 Passer au morceau suivant
  const handleNext = () => {
    setValidationState({
      titleCorrect: false,
      artistCorrect: false,
      inputErrorTitle: false,
      inputErrorArtist: false,
    });

    let nextIndex: number;
    let newQueue: number[];

    if (shuffledQueue.length === 0) {
      // Rebooter la queue quand on a joué tous les morceaux
      const indices = filteredTracks.map((_, index) => index);
      const reshuffled = shuffleArray(indices);
      nextIndex = reshuffled[0];
      newQueue = reshuffled.slice(1);
    }

    else {
      [nextIndex, ...newQueue] = shuffledQueue;
    }

    // 🔹 Met à jour l'index et la file
    dispatch({ type: 'SET_INDEX', index: nextIndex });
    setShuffledQueue(newQueue);

    // 🔹 Relance directement le morceau suivant
    dispatch({ type: 'START_GAME' });

  };


  // ⏳ Si le site rame, ça affiche un chargement pour faire patienter
  if (!currentTrack) {
    return <p className="text-center mt-8">Veuillez patienter...</p>;
  }

  return (
    <div className="flex flex-col items-center p-8 space-y-10 bg-white rounded-lg shadow w-full max-w-2xl mx-auto mt-0">

      {/* Mode Titre, ou Titre + Artiste */}
      <div className="flex gap-4 items-center">
        <span className="text-lg font-semibold">Mode :</span>
        <button
          onClick={() => {
            setAnswerMode('title')
          }
          }
          className={`cursor-pointer text-lg px-4 py-2 rounded border ${answerMode === 'title'
            ? 'bg-purple-500 text-white border-purple-500'
            : 'bg-white text-purple-600 hover:bg-purple-200 hover:shadow border-purple-500'
            }`}
        >
          Titre
        </button>

        <button
          onClick={() => setAnswerMode('title+artist')

          }
          className={`cursor-pointer text-lg px-4 py-2 rounded border ${answerMode === 'title+artist'
            ? 'bg-purple-500 text-white border-purple-500'
            : 'bg-white text-purple-600 hover:bg-purple-200 hover:shadow border-purple-500'
            }`}
        >
          Titre + Artiste
        </button>
      </div>


      {/* ✅ Sélection des catégories */}
      <div className="text-center mb-4">
        <span className="text-lg font-semibold">Catégories :</span>
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
            className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white text-3xl font-bold py-2 px-10 rounded transition mb-0"
          >
            ▶ Démarrer
          </button>
        </>
      )}

      {/* ⏱ Affichage du timer */}
      {!gameState.revealAnswer && gameState.isPlaying && (
        <p className="text-2xl text-gray-600 font-bold mb-5">
          ⏳ {gameState.timer}
        </p>
      )}

      {/* Valider la réponse en cliquant sur le bouton ou en appuyant sur Entrée*/}
      <form onSubmit={(e) => {
        e.preventDefault(); // 🔒 Empêche le rechargement de la page
        handleCheck();      // ✅ Déclenche la vérif de la réponse
      }}
        className="w-full text-center space-y-4 mb-3">

        {/* 📝 Champ pour le Titre. S'affiche toujours */}
        {(gameState.isPlaying || gameState.revealAnswer) && (
          <div className="relative w-full">
            <input
              ref={titleInputRef} // Pour forcer l'autofocus
              type="text"
              placeholder={typeTitle || 'Chanson'}

              className="border border-orange-500 text-center rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={titleGuess}
              onChange={(e) =>
                dispatch({ type: 'SET_GUESS', payload: { title: e.target.value } })
              }

              readOnly={gameState.revealAnswer}
            />
            {validationState.titleCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {validationState.inputErrorTitle && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}


        {/* 📝 Champ pour l'Artiste. Ne s'affiche que quand "Titre + Artiste" est affiché */}
        {(gameState.isPlaying || gameState.revealAnswer) && answerMode === 'title+artist' && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder={
                // On affiche "Compositeur" si l'artiste est un compositeur, sinon "Interprète"
                currentTrack.artist_type === 'compositeur'
                  ? 'Compositeur'
                  : 'Interprète'
              }

              className="border border-purple-500 text-center rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={artistGuess}
              onChange={(e) =>
                dispatch({ type: 'SET_GUESS', payload: { artist: e.target.value } })
              }

              readOnly={gameState.revealAnswer}
            />
            {validationState.artistCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {validationState.inputErrorArtist && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {/* ✅ Bouton pour valider la réponse */}
          {gameState.isPlaying && !gameState.revealAnswer && (
            <button
              type="submit" // 🆗 Ou on peut ne rien mettre : par défaut c’est "submit"
              className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-10 rounded shadow transition mt-2"
            >
              Valider la réponse
            </button>
          )}

          {/* ✅ Bouton pour passer à la réponse, si les joueurs ne savent pas */}
          {gameState.isPlaying && !gameState.revealAnswer && (
            <button
              type="button" // Pour éviter le rechargement de la page
              onClick={() => dispatch({ type: 'REVEAL_ANSWER' })}
              className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-10 rounded shadow transition"
            >
              Passer
            </button>
          )}
        </div>

      </form>


      {/* 🎥 Lecteur Youtube visible uniquement à la fin du timer, ou quand la bonne réponse a été trouvée */}
      <div className='mb-5'>{gameState.showPlayer && (
        <YoutubePlayer
          videoId={currentTrack.videoId}
          start={currentTrack.start}
          end={currentTrack.start + 50} // On joue 50 secondes à partir du début
          showVideo={gameState.revealAnswer}
        />
      )}
      </div>

      {/* 🎉 Affichage de la bonne réponse */}
      {gameState.revealAnswer && (
        <div className="text-center">
          <p className="text-lg text-gray-700">

            {/* Si pas d'artiste, pas de tiret devant le titre */}
            <p>🎵 <strong>{currentTrack.title}</strong></p>
            <p>{currentTrack.artist}</p>

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