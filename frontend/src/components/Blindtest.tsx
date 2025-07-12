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

  // 📝 États pour gérer les différentes fonctions du jeu.
  // (Possibilité de réduire le nombre de useState par la suite en les regroupant. 

  // ⚙️ Deviner le titre, l'artiste ou les deux
  const [answerParts, setAnswerParts] = useState<string[]>(['title']);

  // Réponses séparées pour le titre et l'artiste
  const [titleGuess, setTitleGuess] = useState('');
  const [artistGuess, setArtistGuess] = useState('');

  // 📍 Index du morceau actuel dans la liste filtrée
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // 🕵️‍♂️ État pour savoir si la réponse doit être révélée
  const [revealAnswer, setRevealAnswer] = useState(false);

  // 🎥 État pour afficher le lecteur Youtube
  const [showPlayer, setShowPlayer] = useState(false);

  // ⏱ Timer pour le jeu, initialisé à 30 secondes
  const [timer, setTimer] = useState(30);

  // 🔊 État pour savoir si un extrait est en cours de lecture
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Catégories cochées par l'utilisateur
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 📦 Liste complète des morceaux récupérés depuis le backend
  const [trackList, setTrackList] = useState<Track[]>([]);

  // 🆕 Message d'erreur affiché si aucun champ "Titre" ou "Artiste" n'est sélectionné
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ États pour valider ou invalider les réponses Titre et Artiste
  const [titleCorrect, setTitleCorrect] = useState(false);
  const [artistCorrect, setArtistCorrect] = useState(false);
  const [inputErrorTitle, setInputErrorTitle] = useState(false);
  const [inputErrorArtist, setInputErrorArtist] = useState(false);



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

  // ▶️ Pour lancer l'extrait (prévoir aléatoire). Message d'erreur si aucun champ n'est sélectionné
  const handlePlay = () => {
    if (answerParts.length === 0) {
      setErrorMessage('❌ Sélectionne au moins "Titre" ou "Artiste" pour commencer.');
      return;
    }
    setErrorMessage('');
    setIsPlaying(true);
    setShowPlayer(true);
  };


  // ✅ Conditions des validation des réponses
  // Vérifie si le titre et/ou l'artiste sont corrects
  // Si les deux sont corrects, on affiche la réponse et on arrête le lecteur

  const handleCheck = () => {
    const userTitle = titleGuess.trim().toLowerCase();
    const userArtist = artistGuess.trim().toLowerCase();
    const correctTitle = currentTrack.title.trim().toLowerCase();
    const correctArtist = currentTrack.artist.trim().toLowerCase();

    const wantsTitle = answerParts.includes('title');
    const wantsArtist = answerParts.includes('artist');

    const isTitleCorrect = !wantsTitle || userTitle === correctTitle;
    const isArtistCorrect = !wantsArtist || userArtist === correctArtist;

    setTitleCorrect(wantsTitle && userTitle === correctTitle);
    setArtistCorrect(wantsArtist && userArtist === correctArtist);

    const allCorrect = isTitleCorrect && isArtistCorrect;
    setInputErrorTitle(!isTitleCorrect);
    setInputErrorArtist(!isArtistCorrect);

    if (allCorrect) {
      setRevealAnswer(true);
      setShowPlayer(true);
      setIsPlaying(false);
    }
  };


  // 🎵 Passer au morceau suivant (prévoir de l'aléatoire)
  const handleNext = () => {
    setTitleCorrect(false);
    setArtistCorrect(false);
    setInputErrorTitle(false);
    setInputErrorArtist(false);

    setTitleGuess('');
    setArtistGuess('');
    setTimer(30);
    setRevealAnswer(false);
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => (prev + 1) % filteredTracks.length);
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
      {!revealAnswer && !isPlaying && (
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
      {!revealAnswer && isPlaying && (
        <p className="text-sm text-gray-600">
          ⏳ Temps restant : {timer}s
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
              onChange={(e) => setTitleGuess(e.target.value)}
              disabled={revealAnswer}
            />
            {titleCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {inputErrorTitle && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}

        {/* 📝 Champ pour l’artiste. Ne s'affiche que quand "Artiste" est affiché */}
        {answerParts.includes('artist') && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Qui qui c'est ? (Artiste)"
              className="border border-purple-500 text-center rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={artistGuess}
              onChange={(e) => setArtistGuess(e.target.value)}
              disabled={revealAnswer}
            />
            {artistCorrect && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">✅</span>
            )}

            {inputErrorArtist && (
              <span className="absolute right-3 top-1/4 -translate-y-1/2 text-red-600 text-sm text-center mt-2">❌</span>
            )}
          </div>
        )}

        {/* ✅ Bouton pour valider la réponse */}
        <button
          type="submit" // 🆗 Ou on peut ne rien mettre : par défaut c’est "submit"
          disabled={revealAnswer || !isPlaying}
          className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-10 rounded shadow transition"
        >
          Valider la réponse
        </button>

      </form>


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