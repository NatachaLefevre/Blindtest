export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl text-green-500 font-bold underline text-center">
        ✅ Tailwind fonctionne 🎉
      </h1>
      <p className="text-xl text-gray-700">
        Test de taille et couleur
      </p>
      <div className="hidden text-pink-600 text-4xl">force inclusion</div>
    </div>
  );
}
