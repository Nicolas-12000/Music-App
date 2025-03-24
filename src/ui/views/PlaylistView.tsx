import { useMusicContext } from '@/ui/contexts/MusicContext';
import { SongCard } from '@/ui/components/songs/SongCarts';

export function PlaylistView() {
  const { playlist, currentSong, spotifyLogin, isAuthenticated } = useMusicContext();
  const songs = playlist.getAll();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-text mb-4">Your Playlist</h1>
        {!isAuthenticated && (
          <button
            onClick={spotifyLogin}
            className="bg-[#1DB954] text-white px-6 py-2 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            Connect with Spotify
          </button>
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