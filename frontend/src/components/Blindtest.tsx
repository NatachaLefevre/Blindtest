import { useState, useEffect } from 'react';
import YoutubePlayer from './YoutubePlayer';
import tracks from '../data/tracks.json';

export default function Blindtest() {
  const [guess, setGuess] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  // ⏳ Timer lancé uniquement si l'extrait est en cours
  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isPlaying && timer > 0 && !revealAnswer) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    }

    // Fin du timer = échec → on montre la réponse et lance le player
    if (timer === 0 && !revealAnswer) {
      setRevealAnswer(true);
      setShowPlayer(true);
    }

    return () => clearTimeout(countdown);
  }, [isPlaying, timer, revealAnswer]);

  const handlePlay = () => {
    setIsPlaying(true); // déclenche le timer
    setIsPlaying(true);
    setShowPlayer(true); // on montre le lecteur dès le début

  };

  const handleCheck = () => {
    const userAnswer = guess.trim().toLowerCase();
    const correct = currentTrack.title.trim().toLowerCase();

    if (userAnswer === correct) {
      setRevealAnswer(true); // on révèle la réponse
      setShowPlayer(true); // on montre le lecteur
      setIsPlaying(false); // on arrête le timer
      alert('✅ Bonne réponse, bravo !');

    } else {
      alert('❌ Mauvaise réponse, essaie encore !');
      // timer continue car mauvaise réponse
    }
  };

  const handleNext = () => {
    setGuess('');
    setTimer(30);
    setRevealAnswer(false);
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-6 bg-white rounded-lg shadow w-full max-w-xl mx-auto mt-8">
      {!revealAnswer && !isPlaying && (
        <button onClick={handlePlay} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-10 rounded shadow transition">
          ▶️ Lancer l'extrait
        </button>
      )}

      {!revealAnswer && isPlaying && (
        <p className="text-sm text-gray-600">⏳ Temps restant : {timer}s</p>
      )}

      <input
        type="text"
        placeholder="Devine le titre du morceau"
        className="border border-gray-300 rounded px-4 text-center py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        disabled={revealAnswer}
      />

      <button
        onClick={handleCheck}
        disabled={revealAnswer || !isPlaying}
        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-10 rounded transition"
      >
        ✅ Valider la réponse
      </button>

      {showPlayer && (
        <YoutubePlayer
          videoId={currentTrack.videoId}
          start={currentTrack.start}
          end={currentTrack.end}
          showVideo={revealAnswer} // vidéo visible seulement après succès ou fin du timer
        />
      )}


      {revealAnswer && (
        <div className="text-center">
          <p className="text-lg text-gray-700">
            🎵 C'était : <strong>{currentTrack.artist} - {currentTrack.title}</strong>
          </p>
          <button onClick={handleNext} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded">
            ▶️ Morceau suivant
          </button>
        </div>
      )}
    </div>
  );
}
