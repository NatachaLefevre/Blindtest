import YouTube from 'react-youtube';

interface YoutubePlayerProps {
  videoId: string;
  start: number;
  end: number;
  showVideo: boolean;
}

export default function YoutubePlayer({ videoId, start, showVideo }: YoutubePlayerProps) {
  const opts = {
    height: showVideo ? '200' : '0',
    width: showVideo ? '320' : '0',
    playerVars: {
      autoplay: 1,
      start,
      end: start + 50, // On joue 50 secondes à partir du début (30s pour deviner + 20s pour kiffer)
    },
  };

  return <YouTube videoId={videoId} opts={opts} />;
}
