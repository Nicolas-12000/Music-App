import { IPersistence } from "../../core/ports/IPersistence";
import { Playlist } from "../../core/entities/Playlist";

/**
 * Implementación del adaptador para localStorage
 */
export class LocalStorageAdapter implements IPersistence {
  private readonly STORAGE_KEY = "musicapp_playlist";

  async savePlaylist(playlist: Playlist): Promise<void> {
    try {
      const jsonData = JSON.stringify(playlist.toJson());
      localStorage.setItem(this.STORAGE_KEY, jsonData);
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
      throw new Error("No se pudo guardar la lista de reproducción");
    }
  }

  async loadPlaylist(): Promise<Playlist> {
    try {
      const jsonData = localStorage.getItem(this.STORAGE_KEY);
      
      if (!jsonData) {
        return new Playlist();
      }
      
      const data = JSON.parse(jsonData);
      return Playlist.fromJson(data);
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error);
      return new Playlist();
    }
  }
}
