type DarkModeToggleProps = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

export default function DarkModeToggle({ darkMode, setDarkMode }: DarkModeToggleProps) {
  return (
    <div className="absolute top-4 right-4 flex gap-3">
      <button
        onClick={() => setDarkMode(false)}
        className={`text-2xl ${!darkMode ? "opacity-100" : "opacity-50"}`}
        title="Mode jour"
      >
        🌞
      </button>
      <button
        onClick={() => setDarkMode(true)}
        className={`text-2xl ${darkMode ? "opacity-100" : "opacity-50"}`}
        title="Mode nuit"
      >
        🌙
      </button>
    </div>
  );
}
