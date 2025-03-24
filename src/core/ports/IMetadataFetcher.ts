export interface SongMetadata {
    duration: number;
    coverURL: string;
    spotifyId: string;
    album?: string;
    year?: string;
}

export interface IMetadataFetcher {
    fetchCover(title: string, artist: string): Promise<string>;
    fetchSongInfo(title: string, artist: string): Promise<SongMetadata>;
}