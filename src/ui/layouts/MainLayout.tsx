import { Outlet } from 'react-router-dom';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { theme } from '@/ui/themes/theme';

export function MainLayout() {
  const { isLoading } = useMusicContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-text">Loading...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background }}
    >
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}