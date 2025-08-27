import Blindtest from './components/Blindtest';
import './styles/App.css'


export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl text-purple-500 font-bold text-center">
        BLINDTEST
      </h1>

      <Blindtest />
      <p className="text-1xl text-purple-900 text-center">Créé par Natacha Lefèvre.<br/>
      Ce blindtest est en développement. De nouvelles fonctionnalités sont prévues.<br />
        N'hésitez pas à me signaler le moindre bug que vous pourriez rencontrer, en envoyant un mail à: <br />
        <a
          href="mailto:contact@axaba.fr"
          className="text-2xl text-purple-500 font-bold underline hover:text-purple-700">
          contact@axaba.fr
        </a>
      </p>

    </div>
  );
}