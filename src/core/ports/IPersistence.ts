import { Playlist } from "../entities/Playlist";

/**
 * Puerto para gestionar la persistencia de la lista de reporducción
 */
export interface IPersistence {
    savePlaylist(playlist: Playlist): Promise<void>;
    loadPlaylist(): Promise<Playlist>;
}