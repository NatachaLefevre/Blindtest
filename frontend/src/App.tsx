import { useState, useEffect } from "react";
import Blindtest from './components/Blindtest';
import Footer from './components/footer';
import './styles/App.css'
import './styles/index.css'


export default function App() {

const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      
      <h1 className="py-5 px-10 ">
        <img src="./public/logo_axaba_blindtest.webp" alt="titre axaba's blindtest" />
      </h1>

      <Blindtest darkMode={darkMode} setDarkMode={setDarkMode} />

      <Footer />

    </div>
  );
}