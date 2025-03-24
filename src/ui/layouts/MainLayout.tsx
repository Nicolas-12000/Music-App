import { useMusicContext } from "@/ui/contexts/MusicContext";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export function MainLayout() {
  const { isLoading, playlist, isAuthenticated, spotifyLogin } = useMusicContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
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
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] via-[#121212] to-[#0a0a0a]">
      <main className="container mx-auto px-4 py-8 flex flex-col items-center ">
        {playlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center"
          >
            <div className="space-y-4">
              <p className="text-xl text-gray-300 font-medium">
                {isAuthenticated 
                  ? "¡Tu playlist está vacía!" 
                  : "Conecta con Spotify para empezar"}
              </p>
              
              {!isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={spotifyLogin}
                  className="bg-spotify-green hover:bg-[#1db954]/90 px-8 py-3 rounded-full text-white font-medium flex items-center gap-2 mx-auto transition-all"
                >
                  <img 
                    src="/spotify-icon.png" 
                    alt="Spotify" 
                    className="w-6 h-6"
                  />
                  Continuar con Spotify
                </motion.button>
              )}

              {isAuthenticated && (
                <p className="text-sm text-gray-400 max-w-md">
                  Usa la barra de búsqueda arriba para añadir canciones a tu lista.
                  <br />
                  Puedes organizarlas con las estrategias de inserción.
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}