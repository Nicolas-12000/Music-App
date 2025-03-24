import { useMusicContext } from '@/ui/contexts/MusicContext';

export const PlayerControls = () => {
  const { 
    next, 
    previous, 
    currentSong, 
    isPlaying, 
    togglePlayback,
    currentPosition 
  } = useMusicContext();

  // Calcular el porcentaje de progreso
  const progressPercentage = currentSong 
    ? (currentPosition / currentSong.duration) * 100 
    : 0;

  // Formatear tiempo en MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Barra de Progreso */}
      <div className="relative pt-2">
        <div className="h-1.5 bg-gray-700 rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/* Marcadores de Tiempo */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentPosition)}</span>
          <span>{currentSong ? formatTime(currentSong.duration) : '0:00'}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex justify-center items-center space-x-6">
        <button
          onClick={previous}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          aria-label="Canción anterior"
        >
          ⏮
        </button>

        <button
          onClick={togglePlayback}
          className="p-4 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={next}
          className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          aria-label="Siguiente canción"
        >
          ⏭
        </button>
      </div>

      {/* Información de la Canción */}
      {currentSong && (
        <p className="text-center text-text font-medium truncate">
          {currentSong.title} - {currentSong.artist}
        </p>
      )}
    </div>
  );
};