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
        <img src="./public/light_mode.webp" alt="emote light mode" />
      </button>
      <button
        onClick={() => setDarkMode(true)}
        className={`text-2xl ${darkMode ? "opacity-100" : "opacity-60"}`}
        title="Mode nuit"
      >
        <img src="./public/dark_mode.webp" alt="emote dark mode" />
      </button>
    </div>
  );
}
