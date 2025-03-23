import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Playlist } from '@/core/entities/Playlist';
import { SongNode, SongData } from '@/core/entities/SongNode';
import { LocalStorageAdapter } from '@/infrastructure/persistence/LocalStorageAdapter';
import { SpotifyAdapter } from '@/infrastructure/adapters/SpotifyAdapter';
import { AddSongUseCase } from '@/core/usecases/AddSongUseCase';
import { LoadPlaylistUseCase } from '@/core/usecases/LoadPlaylistUseCase';
import { AddToStart, AddToEnd, AddAfterCurrent } from '@/core/strategies/AddStrategies';

export type AddStrategyType = 'start' | 'end' | 'afterCurrent';

interface MusicContextType {
  playlist: Playlist;
  currentSong: SongNode | null;
  isLoading: boolean;
  addSong: (data: SongData, strategy?: AddStrategyType) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  next: () => Promise<void>;
  previus: () => Promise<void>;
  playById: (id: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

interface MusicProviderProps {
  children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const [playlist] = useState<Playlist>(new Playlist());
  const [currentSong, setCurrentSong] = useState<SongNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistenceAdapter = new LocalStorageAdapter();
  const metadataAdapter = new SpotifyAdapter();

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

  const addSong = async (data: SongData, strategy: AddStrategyType = 'end') => {
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
        metadataAdapter
      );

      await addSongUseCase.execute(data.title, data.artist, data.duration);
      
      if (playlist.length === 1) {
        setCurrentSong(playlist.head);
      }
      
      await persistenceAdapter.savePlaylist(playlist);
    } catch (error) {
      console.error("Error al agregar canción:", error);
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
    await persistenceAdapter.savePlaylist(playlist);
  };

  const previus = async () => {
    const previousSong = playlist.previus();
    setCurrentSong(previousSong);
    await persistenceAdapter.savePlaylist(playlist);
  };

  const playById = (id: string) => {
    const songs = playlist.getAll();
    for (const song of songs) {
      if (song.id === id) {
        playlist.current = song;
        setCurrentSong(song);
        persistenceAdapter.savePlaylist(playlist);
        break;
      }
    }
  };

  const value: MusicContextType = {
    playlist,
    currentSong,
    isLoading,
    addSong,
    removeSong,
    next,
    previus,
    playById
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
