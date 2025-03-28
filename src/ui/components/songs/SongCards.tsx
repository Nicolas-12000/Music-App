import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { theme } from '@/ui/themes/theme';
import { SongNode } from '@/core/entities/SongNode';
import { FaHeart, FaTrash, FaPlay, FaPause } from 'react-icons/fa';

interface SongCardProps {
  song: SongNode;
  isPlaying?: boolean;
}

export function SongCard({ song, isPlaying = false }: SongCardProps) {
  const { playById, removeSong, togglePlayback, currentSong } = useMusicContext();
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    playing: { 
      boxShadow: [
        `0 0 0 rgba(63, 169, 245, 0)`,
        `0 0 8px rgba(63, 169, 245, 0.5)`,
        `0 0 0 rgba(63, 169, 245, 0)`
      ],
      transition: {
        boxShadow: {
          repeat: Infinity,
          duration: 2
        }
      }
    }
  };

  const handlePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      togglePlayback();
    } else {
      playById(song.id);
    }
  };

  const isCurrentlyPlaying = isPlaying && currentSong?.id === song.id;

  return (
    <motion.div 
      className={`w-full max-w-md rounded-lg overflow-hidden bg-background mb-4 cursor-pointer ${
        isHovered ? 'hovered' : ''
      }`}
      style={{ 
        border: isCurrentlyPlaying ? `1px solid ${theme.colors.primary}` : '1px solid transparent',
        boxShadow: theme.shadows.card 
      }}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isCurrentlyPlaying ? "playing" : "initial"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center p-3">
        {/* Imagen de portada */}
        <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden mr-4">
          <img 
            src={song.coverURL} 
            alt={`Portada de ${song.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Información de la canción */}
        <div className="flex-grow">
          <h3 className="text-text font-semibold truncate">{song.title}</h3>
          <p className="text-textSecondary text-sm truncate">{song.artist}</p>
          <p className="text-primary text-xs mt-1">
            {formatDuration(song.duration)}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-3 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-accent hover:text-[#d8a742] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Lógica para agregar a favoritos
            }}
            aria-label="Agregar a favoritos"
          >
            <FaHeart aria-hidden="true" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-error hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              removeSong(song.id);
            }}
            aria-label="Eliminar canción"
          >
            <FaTrash aria-hidden="true" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-primary hover:bg-[#2d8fd6] transition-colors"
            onClick={handlePlayback}
            aria-label={isCurrentlyPlaying ? "Pausar" : "Reproducir"}
          >
            {isCurrentlyPlaying ? (
              <FaPause aria-hidden="true" />
            ) : (
              <FaPlay aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}