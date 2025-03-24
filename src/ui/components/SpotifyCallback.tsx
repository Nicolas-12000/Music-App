import { useEffect } from 'react';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SpotifyCallback = () => {
    const { handleSpotifyCallback } = useMusicContext();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (code) {
            handleSpotifyCallback(code)
                .then(() => {
                    window.location.href = '/';
                })
                .catch((error) => {
                    console.error('Autenticacion fallida:', error);
                });
        }
    }, [handleSpotifyCallback, location]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-screen bg-background"
        >
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text mb-4">
                    Conectando a Spotify...
                </h2>
                <p className="text-textSecondary">
                    Porfavor espere el procesor de autenticacion
                </p>
            </div>
        </motion.div>
    );
};