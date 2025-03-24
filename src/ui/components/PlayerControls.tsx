import { useMusicContext } from '@/ui/contexts/MusicContext';

export const PlayerControls = () => {
  const { next, previous, currentSong } = useMusicContext();

  return (
    <div className="flex justify-center items-center space-x-4 mt-6">
      <button
        onClick={previous}
        className="p-3 rounded-full bg-buttons hover:bg-[#2d8fd6] transition-colors"
        aria-label="Canción anterior"
      >
        ⏮
      </button>
      <button
        onClick={next}
        className="p-3 rounded-full bg-buttons hover:bg-[#2d8fd6] transition-colors"
        aria-label="Siguiente canción"
      >
        ⏭
      </button>
      <p className="text-text">
        {currentSong ? currentSong.title : "Ninguna canción en reproducción"}
      </p>
    </div>
  );
};