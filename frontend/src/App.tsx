import Blindtest from './components/Blindtest';


export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl text-purple-500 font-bold text-center">
        Blindtest d'une parfaite laideur <br></br>mais ce n'est que le début
      </h1>
      {/* <p className="text-2xl text-gray-800">
        Test de taille et couleur
      </p> */}
      <Blindtest />

    </div>
  );
}