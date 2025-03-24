import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from '@/ui/contexts/MusicContext';
import { MainLayout } from '@/ui/layouts/MainLayout';
import { PlaylistView } from '@/ui/views/PlaylistView';
import { CallbackView } from '@/ui/views/CallbackView';
import { ErrorView } from '@/ui/views/ErrorView';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <MusicProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<PlaylistView />} />
            <Route path="/error" element={<ErrorView />} />
            <Route path="callback" element={<CallbackView />} />
          </Route>
          
          {/* Ruta de error opcional */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <h1 className="text-2xl text-primary">404 - Página no encontrada</h1>
            </div>
          }/>
        </Routes>
      </MusicProvider>
    </BrowserRouter>
  );
};