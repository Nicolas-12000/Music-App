import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Playlist } from '@/core/entities/Playlist';
import { SongNode, SongData } from '@/core/entities/SongNode';
import { LocalStorageAdapter } from '@/infrastructure/persistence/LocalStorageAdapter';
import { SpotifyAdapter } from '@/infrastructure/adapters/SpotifyAdapter';
import { SpotifyAuthService } from '@/infrastructure/auth/SpotifyAuthService';
import { AddSongUseCase } from '@/core/usecases/AddSongUseCase';
import { LoadPlaylistUseCase } from '@/core/usecases/LoadPlaylistUseCase';
import { AddToStart, AddToEnd, AddAfterCurrent } from '@/core/strategies/AddStrategies';
import { SearchResultTrack } from '@/core/ports/IMetadataFetcher';
import { toast } from 'react-toastify';

// Improved Spotify types
interface SpotifyPlayerConfig {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume: number;
}

interface SpotifyPlayerState {
  paused: boolean;
  position: number;
  track_window?: {
    current_track: {
      uri: string;
      id: string;
      name: string;
    };
  };
}

interface SpotifyPlayer {
  addListener: (eventName: string, callback: (data: any) => void) => void;
  removeListener: (eventName: string, callback: Function) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  getCurrentState: () => Promise<SpotifyPlayerState | null>;
  play: (options?: { uris: string[] }) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

declare global {
  interface Window {
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => SpotifyPlayer;
    };
    spotifySDKReady: boolean;
  }
}

export type AddStrategyType = 'start' | 'end' | 'afterCurrent';

interface MusicContextType {
  playlist: Playlist;
  currentSong: SongNode | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  spotifyLogin: () => void;
  handleSpotifyCallback: (code: string | undefined) => Promise<void>;
  addSong: (data: SongData, strategy?: AddStrategyType) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  playById: (id: string) => void;
  searchResults: SearchResultTrack[];
  handleSearch: (query: string) => Promise<void>;
  setSearchResults: (results: SearchResultTrack[]) => void;
  spotifyAdapter: SpotifyAdapter | null;
  isPlaying: boolean;
  togglePlayback: () => Promise<void>;
  currentPosition: number;
  player: SpotifyPlayer | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'spotify_tokens';

/**
 * Genera o reutiliza el state de autenticación con timestamp.
 * Solo genera uno nuevo si no existe o si ha expirado (más de 5 minutos).
 */
const generateState = () => {
  const existing = localStorage.getItem('spotify_auth_state');
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (Date.now() - parsed.timestamp < 300000) { // 5 minutos
        return parsed.value;
      }
    } catch (error) {
      // Si hay error al parsear, se genera uno nuevo
    }
  }
  const newState = crypto.randomUUID();
  localStorage.setItem('spotify_auth_state', JSON.stringify({
    value: newState,
    timestamp: Date.now()
  }));
  return newState;
};

export function MusicProvider({ children }: MusicProviderProps) {
  const [playlist] = useState<Playlist>(new Playlist());
  const [currentSong, setCurrentSong] = useState<SongNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [spotifyAdapter, setSpotifyAdapter] = useState<SpotifyAdapter | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultTrack[]>([]);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  const persistenceAdapter = new LocalStorageAdapter();

  function spotifyLogin() {
    const state = crypto.randomUUID();
    console.log("Generando state:", state);
    console.log("Guardado en localStorage:", localStorage.getItem("spotify_auth_state"));
  
    localStorage.setItem('spotify_auth_state', JSON.stringify({
      value: state,
      timestamp: Date.now()
    }));
  
    const authService = SpotifyAuthService.getInstance();
    const authUrl = authService.getAuthUrl(state);
  
    window.location.href = authUrl;
  }
  
  const handleSpotifyCallback = async (code: string | undefined) => {
    setIsAuthenticating(true);
    try {
      if (!code) {
        throw new Error('Código de autorización faltante');
      }
  
      const storedStateData = localStorage.getItem('spotify_auth_state');
      if (!storedStateData) {
        throw new Error('Estado de autenticación no encontrado');
      }
  
      const { value: savedState, timestamp } = JSON.parse(storedStateData);
  
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        throw new Error('El estado de autenticación ha expirado');
      }
  
      localStorage.removeItem('spotify_auth_state');
  
      const adapter = await SpotifyAdapter.initialize(code);
      setSpotifyAdapter(adapter);
      setIsAuthenticated(true);
  
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({
          accessToken: adapter.getAccessToken(),
          refreshToken: adapter.getRefreshToken(),
          timestamp: Date.now()
        })
      );
  
      toast.success('Conectado exitosamente a Spotify!');
    } catch (error) {
      console.error('Error de autenticación:', error);
      setIsAuthenticated(false);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      toast.error(
        error instanceof Error
          ? `Falló la conexión: ${error.message}`
          : 'No se pudo conectar con Spotify'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    async function initialize() {
      try {
        const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedTokens) {
          const { accessToken, refreshToken } = JSON.parse(storedTokens);
          const adapter = new SpotifyAdapter(accessToken, refreshToken);
          setSpotifyAdapter(adapter);
          setIsAuthenticated(true);

          try {
            await adapter.getCurrentPlayback();
          } catch (error) {
            setIsAuthenticated(false);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            toast.warn('Session expired. Please log in again.');
          }
        }

        const loadPlaylistUseCase = new LoadPlaylistUseCase(persistenceAdapter);
        const savedPlaylist = await loadPlaylistUseCase.execute();
        playlist.head = savedPlaylist.head;
        playlist.tail = savedPlaylist.tail;
        playlist.current = savedPlaylist.current;
        playlist.length = savedPlaylist.length;
        setCurrentSong(savedPlaylist.current);
      } catch (error) {
        console.error('Error al inicializar datos:', error);
        toast.error('Failed to load your data. Starting fresh.');
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, [playlist]);

  useEffect(() => {
    if (!isAuthenticated || !spotifyAdapter || !window.Spotify || !window.spotifySDKReady) {
      return;
    }

    let isMounted = true;

    const newPlayer = new window.Spotify.Player({
      name: 'Music App Player',
      getOAuthToken: (callback) => {
        callback(spotifyAdapter.getAccessToken());
      },
      volume: 0.5,
    });

    const handleReady = ({ device_id }: { device_id: string }) => {
      if (!isMounted) return;
      console.log('Ready with Device ID', device_id);
      setPlayer(newPlayer);
    };

    const handleStateChange = (state: SpotifyPlayerState | null) => {
      if (!isMounted || !state) return;

      setIsPlaying(!state.paused);
      setCurrentPosition(state.position);

      if (state.track_window?.current_track) {
        const track = state.track_window.current_track;
        if (currentSong?.uri !== track.uri) {
          const songs = playlist.getAll();
          const newCurrentSong = songs.find((song) => song.uri === track.uri);
          if (newCurrentSong) {
            playlist.current = newCurrentSong;
            setCurrentSong(newCurrentSong);
          }
        }
      }
    };

    newPlayer.addListener('ready', handleReady);
    newPlayer.addListener('player_state_changed', handleStateChange);
    newPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Failed to initialize:', message);
      toast.error('Player initialization failed.');
    });
    newPlayer.addListener('authentication_error', async ({ message }) => {
      console.error('Failed to authenticate:', message);
      try {
        await spotifyAdapter.refreshAccessToken();
        localStorage.setItem(
          TOKEN_STORAGE_KEY,
          JSON.stringify({
            accessToken: spotifyAdapter.getAccessToken(),
            refreshToken: spotifyAdapter.getRefreshToken(),
          })
        );
        await newPlayer.connect();
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        toast.error('Authentication failed. Please log in again.');
      }
    });

    newPlayer.connect();

    return () => {
      isMounted = false;
      newPlayer.disconnect();
    };
  }, [isAuthenticated, spotifyAdapter]);

  const addSong = async (data: SongData, strategy: AddStrategyType = 'end') => {
    if (!spotifyAdapter) {
      throw new Error("Se requiere autenticación con Spotify");
    }

    if (strategy === 'afterCurrent' && !playlist.current) {
      toast.warn('Select a song first to use this option.');
      return;
    }

    try {
      let strategyObj;
      switch (strategy) {
        case 'start':
          strategyObj = new AddToStart();
          break;
        case 'afterCurrent':
          strategyObj = new AddAfterCurrent();
          break;
        case 'end':
        default:
          strategyObj = new AddToEnd();
          break;
      }

      const addSongUseCase = new AddSongUseCase(
        playlist,
        strategyObj,
        spotifyAdapter
      );

      await addSongUseCase.execute(data.title, data.artist);

      if (playlist.length === 1) {
        setCurrentSong(playlist.head);
      }

      await persistenceAdapter.savePlaylist(playlist);
      toast.success(`Added "${data.title}" to playlist!`);
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song.');
      throw error;
    }
  };

  const removeSong = async (id: string) => {
    try {
      const songToRemove = playlist.getAll().find((song) => song.id === id);
      const removed = playlist.removeById(id);

      if (removed) {
        setCurrentSong(playlist.current);
        await persistenceAdapter.savePlaylist(playlist);
        toast.success(`Removed "${songToRemove?.title}" from playlist.`);
      }
    } catch (error) {
      console.error('Error al eliminar canción:', error);
      toast.error('Failed to remove song.');
      throw error;
    }
  };

  const next = async () => {
    const nextSong = playlist.next();
    setCurrentSong(nextSong);
    if (nextSong && player && spotifyAdapter) {
      try {
        await player.play({
          uris: [nextSong.uri],
        });
      } catch (error) {
        console.error('Error playing next song:', error);
        toast.error('Failed to play next song.');
      }
    }
    await persistenceAdapter.savePlaylist(playlist);
  };

  const previous = async () => {
    const previousSong = playlist.previous();
    setCurrentSong(previousSong);
    if (previousSong && player && spotifyAdapter) {
      try {
        await player.play({
          uris: [previousSong.uri],
        });
      } catch (error) {
        console.error('Error playing previous song:', error);
        toast.error('Failed to play previous song.');
      }
    }
    await persistenceAdapter.savePlaylist(playlist);
  };

  const playById = async (id: string) => {
    const songs = playlist.getAll();
    for (const song of songs) {
      if (song.id === id) {
        playlist.current = song;
        setCurrentSong(song);
        if (player && spotifyAdapter) {
          try {
            await player.play({
              uris: [song.uri],
            });
          } catch (error) {
            console.error('Error playing song:', error);
            toast.error('Failed to play song.');
          }
        }
        await persistenceAdapter.savePlaylist(playlist);
        break;
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (!spotifyAdapter || query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await spotifyAdapter.searchTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      toast.error('Search failed. Please try again.');
      setSearchResults([]);
    }
  };

  const togglePlayback = useCallback(async () => {
    if (!player || !currentSong) return;

    try {
      const state = await player.getCurrentState();
      if (!state) {
        await player.play({ uris: [currentSong.uri] });
      } else {
        if (state.paused) {
          await player.resume();
        } else {
          await player.pause();
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Playback error occurred.');
    }
  }, [player, currentSong]);

  const value: MusicContextType = {
    playlist,
    currentSong,
    isLoading,
    isAuthenticated,
    isAuthenticating,
    spotifyLogin,
    handleSpotifyCallback,
    addSong,
    removeSong,
    next,
    previous,
    playById,
    searchResults,
    handleSearch,
    setSearchResults,
    spotifyAdapter,
    isPlaying,
    togglePlayback,
    currentPosition,
    player,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicContext() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicContext debe ser usado dentro de un MusicProvider');
  }
  return context;
}