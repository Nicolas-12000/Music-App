import { IMetadataFetcher } from "@/core/ports/IMetadataFetcher";

/**
 * Adaptador para obtener metadatos de canciones (mock)
 * En un escenario real, esto se conectaría con la Api de Spotify
 */

export class SpotifyAdapter implements IMetadataFetcher {
    private mockData: Record<string, any> = {
        "Queen - Bohemian Rhapsody": {
            cover: "https://i.scdn.co/image/ab67616d0000b273365b3fb600c4dc90d86669a8",
            info: {album: "A Night At The Opera", year: 1975 }
        },
        "Michael Jackson - Unbreakable": {
            cover: "https://i.scdn.co/image/ab67616d0000b273365b3fb600c4dc90d86669a8",
            info: {album: "Invincible", year: 2001 }
        },
        "default": {
            cover: "https://placehold.co/400x400/1a1a1a/e0e0e0?text=No+Cover",
            info: {album: "Unknown", year: "Unknown" }
        }
    };
    async fetchCover(title: string, artist: string): Promise<string> {

        await new Promise(resolve => setTimeout(resolve, 300));
        const key = `${artist} - ${title}`;
        const result = this.mockData[key] || this.mockData.default;
        return result.cover;
    }
    /**
     * obtiene infroomacion adicional de una canción
     */
    async fetchSongInfo(title: string, artist: string): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const key = `${artist} - ${title}`;
        const result = this.mockData[key] || this.mockData.default;
        return result.info;
    }
}