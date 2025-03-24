import { SongNode, SongData } from "@/core/entities/SongNode";

/**
 * Factory for creating song nodes with validations
 */
export class SongFactory {
    /**
     * Creates a song node with validations
     */
    static createSong(data: SongData): SongNode {
        if (!data.title?.trim()) {
            throw new Error("El título de la canción es requerido");
        }

        if (!data.artist?.trim()) {
            throw new Error("El artista de la canción es requerido");
        }

        if (!data.spotifyId?.trim()) {
            throw new Error("El ID de Spotify es requerido");
        }

        if (!this.isValidUrl(data.coverURL)) {
            throw new Error("La URL de la portada es inválida o falta");
        }

        if (typeof data.duration !== "number" || data.duration <= 0) {
            throw new Error("La duración debe ser un número mayor a 0");
        }

        return new SongNode(data);
    }

    /**
     * Validates if a string is a valid URL
     */
    private static isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

}