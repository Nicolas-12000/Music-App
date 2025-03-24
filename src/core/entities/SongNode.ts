/**
 * Representa los datos necesarios para crear un nodo de canción
 */
export interface SongData {
    id?: string;
    spotifyId: string;
    title: string;
    artist: string;
    duration: number;
    coverURL: string;
}

/**
 * Representa un nodo en la lista doblemente enlazada que contiene
 * información de una canción.
 */
export class SongNode {
    public readonly id: string;
    public readonly spotifyId: string;
    public readonly title: string;
    public readonly artist: string;
    public readonly duration: number;
    public readonly coverURL: string;
    public next: SongNode | null = null;
    public prev: SongNode | null = null;

    constructor(data: SongData) {
        this.id = data.id || crypto.randomUUID();
        this.spotifyId = data.spotifyId;
        this.title = data.title;
        this.artist = data.artist;
        this.duration = data.duration;
        this.coverURL = data.coverURL;
    }

    getFormattedDuration(): string {
        const minutes = Math.floor(this.duration / 60);
        const seconds = this.duration % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
