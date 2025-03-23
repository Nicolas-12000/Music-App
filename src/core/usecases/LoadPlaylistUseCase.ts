import { Playlist } from "../entities/Playlist";
import { IPersistence } from "../ports/IPersistence";

/**
 * Caso de uso para cargar la lista de repodrucción desde el almacenamiento
 */
export class LoadPlaylistUseCase {
    constructor(private persistence: IPersistence) {}

    /**
     * Ejecuta el caso de uso
     */
    async execute(): Promise<Playlist>{
        try {
            return await this.persistence.loadPlaylist();
        } catch (error) {
            console.error("Error al cargar la lista:", error);
            return new Playlist();
        }
    }
}
