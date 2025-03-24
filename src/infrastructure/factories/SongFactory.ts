import { SongData, SongNode } from "@/core/entities/SongNode";

/**
 * Factory for creating song nodes with validations
 */
export class SongFactory {
    /**
     * Creates a song node with validations
     */
    static createSong(data: SongData): SongNode {
        this.validateSongData(data);
        return new SongNode(data);
    }

    /**
     * Validates all required fields in song data
     */
    private static validateSongData(data: SongData): void {
        const validations = [
            {
                condition: !data.spotifyId?.trim(),
                message: "Spotify ID is required for song creation"
            },
            {
                condition: !data.title?.trim(),
                message: "Song title is required"
            },
            {
                condition: !data.artist?.trim(),
                message: "Artist name is required"
            },
            {
                condition: !data.coverURL?.trim(),
                message: "Cover URL is required"
            },
            {
                condition: typeof data.duration !== 'number' || data.duration <= 0,
                message: "Valid duration is required"
            }
        ];

        const failure = validations.find(v => v.condition);
        if (failure) {
            throw new Error(failure.message);
        }
    }
}