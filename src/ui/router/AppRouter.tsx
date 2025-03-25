import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/ui/layouts/MainLayout';
import { PlaylistView } from '@/ui/views/PlaylistView';
import { CallbackView } from '@/ui/views/CallbackView';
import { ErrorView } from '@/ui/views/ErrorView';
import { useMusicContext } from '@/ui/contexts/MusicContext';

export function AppRouter() {
  const { isAuthenticated } = useMusicContext();

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta para el callback de autenticación */}
        <Route path="/callback" element={<CallbackView />} />

        {/* Rutas protegidas */}
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={
              isAuthenticated ? <PlaylistView /> : <Navigate to="/" replace />
            }
          />
        </Route>

        {/* Ruta para manejar errores o páginas no encontradas */}
        <Route path="*" element={<ErrorView />} />
      </Routes>
    </BrowserRouter>
  );
}