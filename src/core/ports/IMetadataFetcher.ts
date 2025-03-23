export interface IMetadataFetcher {
    fetchCover(title: string, artist: string): Promise<string>;
    fetchSongInfo(title: string, artist: string): Promise<any>;
}