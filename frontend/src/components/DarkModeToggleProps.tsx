type DarkModeToggleProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export default function DarkModeToggle({ darkMode, setDarkMode }: DarkModeToggleProps) {
  return (
    <div className="absolute top-5 right-10 flex gap-4">
      <button
        onClick={() => setDarkMode(false)}
        className={`text-2xl ${!darkMode ? "opacity-100" : "opacity-60"}`}
        title="Mode jour"
      >
        {/* Les fichiers du dossier public/ ne s’importent pas via le chemin relatif (./public/...),
            ils sont servis à la racine du site.*/}
        <img src="/light_mode.webp" alt="emote light mode" />
      </button>
      <button
        onClick={() => setDarkMode(true)}
        className={`text-2xl ${darkMode ? "opacity-100" : "opacity-60"}`}
        title="Mode nuit"
      >
        <img src="/dark_mode.webp" alt="emote dark mode" />
      </button>
    </div>
  );
}
