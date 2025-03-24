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
  handleSpotifyCallback: (code: string) => Promise<void>;
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
  player: any | null;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

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

  const spotifyLogin = () => {
    window.location.href = SpotifyAuthService.getAuthUrl();
  };

  const handleSpotifyCallback = async (code: string) => {
    setIsAuthenticating(true);
    try {
      const adapter = await SpotifyAdapter.initialize(code);
      setSpotifyAdapter(adapter);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error de autenticación:", error);
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const loadPlaylistUseCase = new LoadPlaylistUseCase(persistenceAdapter);
        const savedPlaylist = await loadPlaylistUseCase.execute();
        
        playlist.head = savedPlaylist.head;
        playlist.tail = savedPlaylist.tail;
        playlist.current = savedPlaylist.current;
        playlist.length = savedPlaylist.length;
        
        setCurrentSong(savedPlaylist.current);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [playlist]);

  // Initialize Spotify player
  useEffect(() => {
    if (!isAuthenticated || !spotifyAdapter || !window.Spotify || !window.spotifySDKReady) {
      return;
    }

    let isMounted = true;

    const newPlayer = new window.Spotify.Player({
      name: 'Music App Player',
      getOAuthToken: callback => {
        callback(spotifyAdapter.getAccessToken());
      },
      volume: 0.5
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
          const newCurrentSong = songs.find(song => song.uri === track.uri);
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
    });
    newPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Failed to authenticate:', message);
      setIsAuthenticated(false);
    });

    newPlayer.connect();

    return () => {
      isMounted = false;
      newPlayer.disconnect();
    };
  }, [isAuthenticated, spotifyAdapter]);

  const addSong = async (data: SongData, strategy: AddStrategyType = 'end') => {
    if (strategy === 'afterCurrent' && !playlist.current) {
      alert('Selecciona una canción primero para usar esta opción');
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
        spotifyAdapter || new SpotifyAdapter('', '') // Provide both required tokens
      );

      await addSongUseCase.execute(data.title, data.artist);
      
      if (playlist.length === 1) {
        setCurrentSong(playlist.head);
      }
      
      await persistenceAdapter.savePlaylist(playlist);
    } catch (error) {
      console.error("Error adding song:", error);
      throw error;
    }
  };

  const removeSong = async (id: string) => {
    try {
      const removed = playlist.removeById(id);
      
      if (removed) {
        setCurrentSong(playlist.current);
        await persistenceAdapter.savePlaylist(playlist);
      }
    } catch (error) {
      console.error("Error al eliminar canción:", error);
      throw error;
    }
  };

  const next = async () => {
    const nextSong = playlist.next();
    setCurrentSong(nextSong);
    if (nextSong && player && spotifyAdapter) {
      try {
        await player.play({
          uris: [nextSong.uri]
        });
      } catch (error) {
        console.error('Error playing next song:', error);
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
          uris: [previousSong.uri]
        });
      } catch (error) {
        console.error('Error playing previous song:', error);
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
              uris: [song.uri]
            });
          } catch (error) {
            console.error('Error playing song:', error);
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
    player
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