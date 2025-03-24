import React from 'react';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { SongCard } from '@/ui/components/songs/SongCards';
import { PlayerControls } from '@/ui/components/PlayerControls';
import { motion } from 'framer-motion';
import { SearchBar } from '@/ui/components/SearchBar';

export function PlaylistView() {
  const { 
    playlist, 
    currentSong, 
    isAuthenticated, 
    spotifyLogin,
    searchResults,
    setSearchResults
  } = useMusicContext();

  const songs = playlist.getAll();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 space-y-8"
    >
      {/* Encabezado */}
      <header className="space-y-4 pt-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            🎵 Music App
          </h1>
          <p className="text-gray-400 text-lg">Tu centro de control musical</p>
        </div>

        {/* Barra de búsqueda */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </header>

      {/* Contenido principal */}
      <div className="space-y-6 pb-12">
        {/* Controles de reproducción */}
        {currentSong && (
          <div className="sticky top-0 z-10 bg-[#121212]/80 backdrop-blur-sm">
            <PlayerControls />
          </div>
        )}

        {/* Lista de canciones */}
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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={spotifyLogin}
                  className="bg-[#1DB954] hover:bg-[#1ed760] px-8 py-3 rounded-full text-white font-medium flex items-center gap-3 transition-all"
                >
                  <svg 
                    className="w-6 h-6 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.56 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.601-1.559.3z"/>
                  </svg>
                  <span>Conectar con Spotify</span>
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-lg">
                  🎉 ¡Comienza a agregar música!
                </p>
                <p className="text-sm text-gray-500">
                  Busca tus canciones favoritas usando la barra superior
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}