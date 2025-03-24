import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpotifyCallback } from '@/ui/components/SpotifyCallback';
import { MusicProvider } from '@/ui/contexts/MusicContext';
import { MainLayout } from '@/ui/layouts/MainLayout';
import { PlaylistView } from '@/ui/views/PlaylistView';

export function AppRouter() {
  return (
    <BrowserRouter>
      <MusicProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<PlaylistView />} />
          </Route>
          <Route path="/callback" element={<SpotifyCallback />} />
        </Routes>
      </MusicProvider>
    </BrowserRouter>
  );
}