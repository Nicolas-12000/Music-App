import React from 'react';
import styled from 'styled-components';
import { useMusicContext } from '@/ui/contexts/MusicContext';
import { SongCard } from '@/ui/components/songs/SongCards';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const LoginButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(63, 169, 245, 0.3);
  }
`;

export const LoginView: React.FC = () => {
  const handleLogin = () => {
    // Add your Spotify login logic here
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URI)}&scope=playlist-modify-public playlist-modify-private user-read-private user-read-email&response_type=code`;
  };

  return (
    <LoginContainer>
      <h2>Connect with Spotify to start</h2>
      <LoginButton onClick={handleLogin}>
        Login with Spotify
      </LoginButton>
    </LoginContainer>
  );
};

export function PlaylistView() {
  const { playlist, currentSong, spotifyLogin, isAuthenticated } = useMusicContext();
  const songs = playlist.getAll();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-text mb-4">Your Playlist</h1>
        {!isAuthenticated && (
          <LoginView />
        )}
      </header>

      <div className="space-y-4">
        {songs.length === 0 ? (
          <p className="text-center text-textSecondary">
            Your playlist is empty. Add some songs!
          </p>
        ) : (
          songs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              isPlaying={currentSong?.id === song.id}
            />
          ))
        )}
      </div>
    </div>
  );
}