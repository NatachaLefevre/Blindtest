// Liste de mots à ignorer dans la comparaison
const stopWords = ['de', 'à', 'the', 'les', 'le', 'la', 'du', 'd\'', 'des', 'and', 'of', '&', 'ft', 'feat', 'et']

// 🔣 Fonction de nettoyage des textes (supprime les accents, ponctuations, etc.)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")                                    // décompose les accents
    .replace(/[\u0300-\u036f]/g, '')                     // supprime les accents
    .replace(/[^\w\s]|_/g, '')                           // supprime ponctuation
    .split(/\s+/)                                        // coupe en mots
    .filter(word => word && !stopWords.includes(word))   // enlève stopwords
    .join('')                                            // <-- colle tout, plus d'espaces
    .trim();                                             // enlève les espaces en trop                   
}

// 🔍 Fonction pour comparer la réponse du joueur et la réponse de la base de données
// Préciser "export" car la fonction sera appelée ailleurs (dans Blindtest)
export function isCloseEnough(a: string, b: string): boolean {
  const normA = normalize(a);
  const normB = normalize(b);

  // Si une des deux chaînes est vide après nettoyage, on considère que ce n'est pas correct
  if (!normA || !normB) return false;

  // 1. On cherche une égalité stricte après nettoyage
  if (normA === normB) return true;

 // 2) Si la réponse du joueur contient la bonne réponse (ex : "Legend of Zelda Ocarina of Time")
  //    on l'accepte — mais seulement si la bonne réponse fait au moins 3 caractères
  if (normB.length >= 3 && normA.includes(normB)) return true;
  
  // 3. On applique la distance de Levenshtein pour la tolérance aux fautes de frappe
  const distance = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  return distance / maxLen < 0.20; // 20% de différence max
}

// 🔠 Fonction de distance de Levenshtein
// Permet d'autoriser des erreurs de frappe
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}
