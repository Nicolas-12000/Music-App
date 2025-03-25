import React from 'react';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { SongCard } from '@/ui/components/songs/SongCards';
import { PlayerControls } from '@/ui/components/PlayerControls';
import { motion } from 'framer-motion';
import { SearchBar } from '@/ui/components/SearchBar';

export function PlaylistView() {
  const { playlist, currentSong, isAuthenticated } = useMusicContext();
  const songs = playlist.getAll();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 space-y-8"
    >
      {/* En lugar del header, ponemos la barra de búsqueda si es necesaria */}
      <div className="max-w-2xl mx-auto">
        <SearchBar />
      </div>

      {/* Contenido principal */}
      <div className="space-y-6 pb-12">
        {currentSong && (
          <div className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-sm">
            <PlayerControls />
          </div>
        )}

        {songs.length > 0 ? (
          <motion.div 
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {songs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={currentSong?.id === song.id}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 min-h-[50vh] flex items-center justify-center">
            {!isAuthenticated ? (
              <motion.div 
                className="flex flex-col items-center gap-6"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div className="space-y-2">
                  <p className="text-xl text-gray-300">
                    Conecta con Spotify para comenzar
                  </p>
                  <p className="text-sm text-gray-500 max-w-md">
                    Accede a millones de canciones y gestiona tu playlist personalizada
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-lg">
                  🎉 ¡Comienza a agregar música!
                </p>
                <p className="text-sm text-gray-500">
                  Usa la barra de búsqueda para encontrar tus canciones favoritas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
