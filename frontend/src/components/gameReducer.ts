// Ce fichier gère l'état du jeu pour le frontend de l'application.
// Il utilise un reducer pour gérer les actions liées au jeu

// Gère les actions nécessaires pour le jeu
export type GameState = {
  currentTrackIndex: number;
  revealAnswer: boolean;
  showPlayer: boolean;
  timer: number;
  isPlaying: boolean;
  titleGuess: string;
  artistGuess: string;
};


// Les actions possibles pour le reducer
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'NEXT_TRACK'; totalTracks: number }
  | { type: 'TICK' }
  | { type: 'RESET' }
  | { type: 'SET_GUESS'; payload: { title?: string; artist?: string } }
  | { type: 'SET_INDEX'; index: number }



// L'état initial du jeu
export const initialGameState: GameState = {
  currentTrackIndex: 0,
  revealAnswer: false,
  showPlayer: false,
  timer: 30,
  isPlaying: false,
  titleGuess: '',
  artistGuess: '',
};


//  Le reducer qui gère les actions et met à jour l'état du jeu
export function gameReducer(state: GameState, action: GameAction): GameState {

  // On gère chaque action possible
  // et on retourne le nouvel état du jeu en fonction de l'action reçue
  switch (action.type) {
    case 'START_GAME':
      return { ...state, isPlaying: true, showPlayer: true };

    // On révèle la réponse et on affiche le lecteur vidéo
    // On arrête la musique en cours
    case 'REVEAL_ANSWER':
      return { ...state, revealAnswer: true, showPlayer: true, isPlaying: false };

    // On décrémente le timer à chaque tick
    // Si le timer atteint 0, on ne fait rien (le jeu gère la fin de partie)
    case 'TICK':
      return state.timer > 0
        ? { ...state, timer: state.timer - 1 }
        : state;

    // On passe au morceau suivant
    // On remet le timer à 30 secondes
    // On cache le lecteur vidéo et on réinitialise les guesses
    case 'NEXT_TRACK':
      return {
        currentTrackIndex: (state.currentTrackIndex + 1) % action.totalTracks,
        revealAnswer: false,
        showPlayer: false,
        timer: 30,
        isPlaying: false,
        titleGuess: '',
        artistGuess: '',
      };

    // On met à jour les guesses du joueur
    // On peut mettre à jour le titre, l'artiste ou les deux
    case 'SET_GUESS':
      return {
        ...state,
        titleGuess: action.payload.title ?? state.titleGuess,
        artistGuess: action.payload.artist ?? state.artistGuess,
      };

    // On met à jour l'index du morceau actuel
    case 'SET_INDEX':
      return {
        ...state,
        currentTrackIndex: action.index,
        revealAnswer: false,
        showPlayer: false,
        timer: 30,
        isPlaying: false,
        titleGuess: '',
        artistGuess: '',
      };


    // On réinitialise l'état du jeu
    case 'RESET':
      return {
        ...state,
        revealAnswer: false,
        showPlayer: false,
        timer: 30,
        isPlaying: false,
      };

    default:
      return state;
  }
}
