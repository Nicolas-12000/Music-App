import { SongNode } from "../entities/SongNode";
import { Playlist } from "../entities/Playlist";
import { AddStrategy } from "../strategies/AddStrategies";
import { SongFactory } from "@/infrastructure/factories/SongFactory";
import { IMetadataFetcher } from "../ports/IMetadataFetcher";

/**
 * Caso de uso para agregar una canción a la lista de reproducción
 */
export class AddSongUseCase {
    constructor(
        private playlist: Playlist,
        private strategy: AddStrategy,
        private metadataFetcher: IMetadataFetcher
    ){}

    /**
     * Ejecuta el caso de uso
     */
    async execute(title: string, artist: string): Promise<SongNode> {
        try {
            const songInfo = await this.metadataFetcher.fetchSongInfo(title, artist);

            const node = SongFactory.createSong({
                title,
                artist,
                duration: songInfo.duration,
                coverURL: songInfo.coverURL,
                spotifyId: songInfo.spotifyId
            });

            this.strategy.add(node, this.playlist);

            return node;
        } catch (error) {
            console.error("Error en AddSongUseCase:", error);
            throw error;
        }
    }
}