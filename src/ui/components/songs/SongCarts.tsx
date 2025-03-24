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
  const { playById, removeSong } = useMusicContext();
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

  return (
    <motion.div 
      className={`w-full max-w-md rounded-lg overflow-hidden bg-background mb-4 cursor-pointer ${isHovered ? 'hovered' : ''}`}
      style={{ 
        border: isPlaying ? `1px solid ${theme.colors.buttons}` : '1px solid transparent',
        boxShadow: theme.shadows.card 
      }}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={isPlaying ? "playing" : "initial"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center p-3">
        {/* Cover */}
        <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden mr-4">
          <img 
            src={song.coverURL} 
            alt={`Cover of ${song.title}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Song Info */}
        <div className="flex-grow">
          <h3 className="text-text font-semibold truncate">{song.title}</h3>
          <p className="text-textSecondary text-sm truncate">{song.artist}</p>
          <p className="text-buttons text-xs mt-1">
            {formatDuration(song.duration)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-accents hover:text-[#d8a742] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Favorite logic (pending)
            }}
            aria-label="Add to favorites"
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
            aria-label="Delete song"
          >
            <FaTrash aria-hidden="true" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-buttons hover:bg-[#2d8fd6] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              playById(song.id);
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
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