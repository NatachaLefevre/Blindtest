import YouTube from 'react-youtube';

interface YoutubePlayerProps {
  videoId: string;
  start: number;
  end: number;
  showVideo: boolean;
}

export default function YoutubePlayer({ videoId, start, end, showVideo }: YoutubePlayerProps) {
  const opts = {
    height: showVideo ? '200' : '0',
    width: showVideo ? '320' : '0',
    playerVars: {
      autoplay: 1,
      start,
      end,
    },
  };

  return <YouTube videoId={videoId} opts={opts} />;
}
