import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { motion } from 'framer-motion';

export const CallbackView = () => {
  const { handleSpotifyCallback } = useMusicContext();
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const state = params.get('state');

        console.log('URL de callback:', window.location.href);
        console.log('PARAMS code:', code);
        console.log('PARAMS state:', state);
        console.log('PARAMS error:', error);

        if (error) {
          throw new Error(`Error de Spotify: ${error}`);
        }
        if (!code || !state) {
          throw new Error('Parámetros de autenticación incompletos');
        }

        // Recuperar y validar el estado almacenado
        const storedStateData = localStorage.getItem('spotify_auth_state');
        if (!storedStateData) {
          throw new Error('Sesión no iniciada correctamente');
        }

        const { value: savedState, timestamp } = JSON.parse(storedStateData);

        // Comparar estados y verificar expiración
        if (state !== savedState) {
          throw new Error('Error de seguridad: State no coincide');
        }
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          throw new Error('Sesión expirada');
        }

        // Limpiar el estado almacenado
        localStorage.removeItem('spotify_auth_state');

        // Continuar con la autenticación
        await handleSpotifyCallback(code);

        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/'); // Redirigir a la página principal tras éxito
      } catch (error) {
        console.error('Error en autenticación:', error);
        localStorage.removeItem('spotify_auth_state');
        navigate('/error', {
          state: { message: error instanceof Error ? error.message : 'Error desconocido' },
        });
      }
    };

    processAuth();
  }, [handleSpotifyCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-lg"
        >
          Conectando con Spotify...
        </motion.p>
      </motion.div>
    </div>
  );
};