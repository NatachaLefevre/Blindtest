type Props = {
  selectedCategories: string[];
  onChange: (updated: string[]) => void;
};

// Les différentes catégories disponibles pour le blindtest
const categories = [
  'chansons internationales',
  'chansons francophones',
  'jeux vidéo',
  'films',
  'films d\'animation',
  'séries',
  'séries animées'
];

export default function CategorySelector({ selectedCategories, onChange }: Props) {

  // Cette fonction gère le changement de sélection des catégories
  // Elle est appelée au clic sur un bouton
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onChange(selectedCategories.filter((c) => c !== cat)); // 🔄 On retire la catégorie
    } else {
      onChange([...selectedCategories, cat]); // ➕ On ajoute la catégorie
    }
  };


  return (
    <div className="flex flex-wrap gap-4 justify-center mt-2 mb-4">
      {categories.map((cat) => {
      const isSelected = selectedCategories.includes(cat);

      return (
      <button
        key={cat}
        onClick={() => toggleCategory(cat)}
        className={`cursor-pointer text-sm px-4 py-2 rounded border transition duration-200 ${isSelected
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white text-gray-600 border-gray-400'
          } hover:shadow`}
      >
        {cat}
      </button>
      );
      
      })}
    </div>
  );
}
