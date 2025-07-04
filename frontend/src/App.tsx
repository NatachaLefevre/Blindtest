import Blindtest from './components/Blindtest';


export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl text-purple-500 font-bold text-center">
        Blindtest qui ressemble presque à quelque chose
      </h1>
      
      <Blindtest />

    </div>
  );
}