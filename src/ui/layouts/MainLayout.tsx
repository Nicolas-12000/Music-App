import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { FaSpotify } from 'react-icons/fa';
import { FaHeadphones } from 'react-icons/fa'; // Importamos el icono de auriculares

export function MainLayout() {
  const { isLoading, isAuthenticated, spotifyLogin } = useMusicContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-text font-medium">Cargando tu música...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Encabezado centrado */}
      <header className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
  <h1 className="text-3xl font-bold text-center flex items-center gap-2">
    <FaHeadphones className="text-xl" />
    <AnimatePresence>
      {['M', 'u', 's', 'i', 'c', ' ', 'A', 'p', 'p'].map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          style={{
            background: "linear-gradient(to right, #6366F1, #8B5CF6)",
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {letter}
        </motion.span>
      ))}
    </AnimatePresence>
  </h1>

  {!isAuthenticated && (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={spotifyLogin}
      className="bg-gradient-to-r from-spotify-green to-[#1DB954] px-6 py-2 rounded-full text-white font-medium flex items-center gap-2 transition-transform"
    >
      <FaSpotify className="w-5 h-5" />
      Conectar con Spotify
    </motion.button>
  )}
</header>
      {/* Contenido principal centrado */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}