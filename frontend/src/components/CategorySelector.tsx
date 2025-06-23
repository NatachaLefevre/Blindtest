// src/components/CategorySelector.tsx
type Props = {
  selectedCategories: string[];
  onChange: (updated: string[]) => void;
};

export default function CategorySelector({ selectedCategories, onChange }: Props) {
  const categories = [
    'Chanson anglophone',
    'Chanson francophone',
    'Musiques Disney',
    'Musiques de jeux vidéo',
    'Musiques de films',
    'Musiques de séries'
  ];

  const handleToggle = (cat: string, checked: boolean) => {
    onChange(
      checked
        ? [...selectedCategories, cat]
        : selectedCategories.filter((c) => c !== cat)
    );
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center my-6">
      {categories.map((cat) => (
        <label key={cat} className="flex items-center gap-2">
          <input
            type="checkbox"
            value={cat}
            checked={selectedCategories.includes(cat)}
            onChange={(e) => handleToggle(cat, e.target.checked)}
          />
          <span className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-10 rounded transition">{cat}</span>
        </label>
      ))}
    </div>
  );
}
