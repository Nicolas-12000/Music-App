/**
 * Representa un nodo en la lista doblemente enlazada que contiene
 * información de una canción.
 */
export interface SongData {
    id?: string;
    title: string;
    artist: string;
    duration: number; // en segundos
    coverURL?: string;
  }
  
  export class SongNode {
    public id: string;
    public title: string;
    public artist: string;
    public duration: number;
    public coverURL?: string;
    public next: SongNode | null = null;
    public prev: SongNode | null = null;
  
    constructor(data: SongData) {
      this.id = data.id || crypto.randomUUID();
      this.title = data.title;
      this.artist = data.artist;
      this.duration = data.duration;
      this.coverURL = data.coverURL;
    }
  
    // Método para obtener la duración formateada en minutos y segundos
    getFormattedDuration(): string {
      const minutes = Math.floor(this.duration / 60);
      const seconds = this.duration % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  }
  