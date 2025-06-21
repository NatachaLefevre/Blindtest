// /src/components/YoutubePlayer.tsx
import YouTube from 'react-youtube';


export default function YoutubePlayer() {
  const opts = {
    height: '200',
    width: '300',
    playerVars: {
      autoplay: 0,
      start: 30, // Commence à 30s par exemple
      end: 45,   // Finit à 45s
    },
  };

  return (
    <div>
      <h2>Blindtest 🎵</h2>
      <YouTube videoId="7wtfhZwyrcc" opts={opts} />
    </div>
  );
}
