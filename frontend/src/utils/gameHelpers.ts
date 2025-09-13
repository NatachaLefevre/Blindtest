// Pour préciser le type de musiques dans le champ "Titre"
export const categoriesWithTypeTitle = {
  'films': 'Film',
  'films d\'animation': 'Film d’animation',
  'séries': 'Série',
  'jeux vidéo': 'Jeu vidéo',
  'séries animées': 'Série animée'
};

// 🔀 Fonction pour mélanger un tableau
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}