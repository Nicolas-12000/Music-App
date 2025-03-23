import { SongNode, SongData } from "@/core/entities/SongNode";

/**
 * Factoría para crear nodos de canciones con validaciones
 */
export class SongFactory {
    /**
     * Crea un node de canción con validaciones
     */
    static createSong(data: SongData): SongNode {
        if (!data.title) {
            throw new Error("El título de la canción es requerido");
        }

        if (!data.artist) {
            throw new Error("El artista de la canción es requerido");
        }

        if (typeof data.duration !== "number" || data.duration <= 0) {
            throw new Error("La duración de la canción debe ser un número mayor a 0");
        }

        return new SongNode(data);
    }

    /**
     * Crea un nodo de canción a partir de datos parciales,
     * utilizando valores por defecto cuando sea necesraio
     */
    static createDefaultSong(title: string, artist: string): SongNode {
        return new SongNode({
            title,
            artist,
            duration: 180, // 3 min
            coverURL: "/placeholder-cover.jpg"
        });
    }
}