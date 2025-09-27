import { useState, useEffect } from "react";
import Blindtest from './components/Blindtest';
import './styles/App.css'
import './styles/index.css'


export default function App() {

const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 ">
      <h1 className="text-5xl text-purple-500 font-bold text-center font-outline-2 pt-5">
        BLINDTEST
      </h1>

      <Blindtest darkMode={darkMode} setDarkMode={setDarkMode} />
      <footer className="text-1xl text-white bg-orange-500/80 text-center py-5 px-10">Créé par Natacha Lefèvre.<br/>
      Ce blindtest est en développement. De nouvelles fonctionnalités sont prévues.<br />
        N'hésitez pas à me signaler le moindre bug que vous pourriez rencontrer, en envoyant un mail à: <br />
        <a
          href="mailto:contact@axaba.fr"
          className="text-2xl text-purple-600 font-bold underline hover:text-purple-700">
          contact@axaba.fr
        </a>
      </footer>

    </div>
  );
}