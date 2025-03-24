export interface SearchResultTrack {
    id: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ 
            url: string;
            height?: number;
            width?: number;
        }>;
    };
}

export interface SongMetadata {
    album: string;
    year: string;
    duration: number;
    spotifyId: string;
    coverURL: string;
}

export interface SongData {
    id: string;
    title: string;
    artist: string;
    duration: number;
    coverURL: string;
    albumName: string;
    spotifyId: string;  // Añadido para mantener compatibilidad
}

export interface IMetadataFetcher {
    fetchSongInfo(title: string, artist: string): Promise<SongMetadata>;
    fetchCover(title: string, artist: string): Promise<string>;
    searchTracks(query: string): Promise<SearchResultTrack[]>;
}