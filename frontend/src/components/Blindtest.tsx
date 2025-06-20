// src/components/Blindtest.tsx
import { useState } from 'react';

export default function Blindtest() {
  const [guess, setGuess] = useState('');
  const correctAnswer = 'imagine dragons - believer';

  const handlePlay = () => {
    const audio = new Audio('/musique1.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const handleCheck = () => {
    if (guess.trim().toLowerCase() === correctAnswer) {
      alert('✅ Bonne réponse !');
    } else {
      alert('❌ Mauvaise réponse');
    }
  };

  return (

    <div className="flex flex-col items-center p-6 space-y-6 bg-white rounded-lg shadow max-w-lg mx-auto mt-8">
      
      <h1 className="text-4xl text-pink-500 font-bold underline text-center">🎵 Blindtest d'une parfaite laideur mais ce n'est que le début</h1>

      <button onClick={handlePlay} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow transition">▶️ Lancer l'extrait</button>

      <input
        type="text"
        placeholder="Titre du morceau"
        className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />

      <button onClick={handleCheck} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition">✅ Valider la réponse</button>
    </div>
  );

  //   return (
  //   <div className="blindtest-container">
  //     <h1>Blindtest 🎵</h1>
  //     <button onClick={handlePlay}>Jouer un extrait</button>
  //     <input
  //       type="text"
  //       placeholder="Devine la chanson..."
  //       value={guess}
  //       onChange={(e) => setGuess(e.target.value)}
  //     />
  //     <button onClick={handleCheck}>Valider</button>
  //   </div>
  // );
}
