import axios from 'axios';
import { IMetadataFetcher, SearchResultTrack, SongMetadata } from "@/core/ports/IMetadataFetcher";
import { SpotifyAuthService } from '@/infrastructure/auth/SpotifyAuthService';
import { SongFactory } from '@/infrastructure/factories/SongFactory';
import { SongData } from '@/core/entities/SongNode';

// ========================
// Error de clases
// ========================
class SpotifyApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public endpoint?: string
    ) {
        super(message);
        this.name = 'SpotifyApiError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class SpotifyAuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SpotifyAuthError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

// ========================
// Definicion de Tipado
// ========================
interface SpotifyImage {
    url: string;
    height?: number;
    width?: number;
}

interface SpotifyArtist {
    name: string;
}

interface SpotifyAlbum {
    name: string;
    release_date: string;
    images: SpotifyImage[];
}

interface SpotifyTrack {
    id: string;
    name: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
}

interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
    };
}

interface PlaybackState {
    is_playing: boolean;
    progress_ms: number;
    item?: {
        id: string;
        uri: string;
    };
    device?: {
        id: string;
        is_active: boolean;
    };
}

// ========================
// Implemetacion de adaptador
// ========================
export class SpotifyAdapter implements IMetadataFetcher {
    private readonly MAX_RETRIES = 3;
    private accessToken: string;
    private refreshToken: string;
    
    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    private async makeRequest<T>(
        endpoint: string,
        params?: Record<string, any>,
        retryCount = 0
    ): Promise<T> {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
                headers: { 
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                params
            });
            return response.data;
        } catch (error: any) {
            const response = error.response;
            
            // Handle rate limiting
            if (response?.status === 429) {
                if (retryCount >= this.MAX_RETRIES) {
                    throw new SpotifyApiError(
                        "Service is temporarily unavailable. Please try again later.",
                        429,
                        endpoint
                    );
                }
                
                const retryAfter = parseInt(response.headers['retry-after'] || '5');
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return this.makeRequest(endpoint, params, retryCount + 1);
            }

            // Handle token expiration
            if (response?.status === 401) {
                try {
                    await this.refreshAccessToken();
                    return this.makeRequest(endpoint, params);
                } catch (refreshError) {
                    throw new SpotifyAuthError("Your session has expired. Please authenticate again.");
                }
            }

            // Handle specific error cases
            switch (response?.status) {
                case 404:
                    throw new SpotifyApiError(
                        "The requested resource was not found",
                        404,
                        endpoint
                    );
                case 500:
                    throw new SpotifyApiError(
                        "Internal server error",
                        500,
                        endpoint
                    );
            }

            // Handle network errors
            if (!response) {
                throw new SpotifyApiError(
                    "Network connection error",
                    undefined,
                    endpoint
                );
            }

            // Generic error handling
            throw new SpotifyApiError(
                response.data?.error?.message || 'An unexpected error occurred',
                response.status,
                endpoint
            );
        }
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            // Validar que existe el refresh token
            if (!this.refreshToken) {
                throw new SpotifyAuthError('Token de renovación no disponible');
            }

            // Obtener nuevos tokens
            const newTokens = await SpotifyAuthService.refreshToken(this.refreshToken);
                
            // Validar el nuevo access token
            if (!newTokens?.access_token) {
                throw new SpotifyAuthError('No se recibió un nuevo token de acceso válido');
            }

            // Actualizar tokens
            this.accessToken = newTokens.access_token;
            
            // Actualizar refresh token si se proporciona uno nuevo
            if (newTokens.refresh_token) {
                this.refreshToken = newTokens.refresh_token;
            }
        } catch (error) {
            // Manejar el error y propagarlo como SpotifyAuthError
            const mensaje = error instanceof Error ? error.message : 'Error desconocido';
            throw new SpotifyAuthError(`Error en la renovación del token: ${mensaje}`);
        }
    }

    async fetchSongInfo(title: string, artist: string): Promise<SongMetadata> {
        const data = await this.makeRequest<SpotifySearchResponse>('search', {
            q: `track:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`,
            type: 'track',
            limit: 1,
            market: 'US'
        });
    
        const track = data.tracks?.items[0];
        if (!track) {
            throw new SpotifyApiError(`Track not found: ${title} by ${artist}`, 404, 'search');
        }
    
        const coverURL = track.album.images[0]?.url;
        if (!coverURL) {
            throw new SpotifyApiError(`Missing album art for: ${title} by ${artist}`, 404, 'search');
        }
    
        return {
            duration: Math.floor(track.duration_ms / 1000),
            coverURL,
            spotifyId: track.id,
            album: track.album.name,
            year: track.album.release_date?.split('-')[0] || 'Unknown'
        };
    }

    async fetchCover(title: string, artist: string): Promise<string> {
        const data = await this.makeRequest<SpotifySearchResponse>('search', {
            q: `track:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`,
            type: 'track',
            limit: 1,
            market: 'US'
        });
    
        const track = data.tracks?.items[0];
        if (!track) {
            throw new SpotifyApiError(`Track not found: ${title} by ${artist}`, 404, 'search');
        }
    
        const coverURL = track.album.images[0]?.url;
        if (!coverURL) {
            throw new SpotifyApiError(`Missing album art for: ${title} by ${artist}`, 404, 'search');
        }
    
        return coverURL;
    }

    async searchTracks(query: string): Promise<SearchResultTrack[]> {
        try {
            const data = await this.makeRequest<SpotifySearchResponse>('search', {
                q: query,
                type: 'track',
                limit: 10,
                market: 'US'
            });
    
            if (!data.tracks?.items?.length) {
                return [];
            }
    
            return data.tracks.items.map(track => {
                const songData: SongData = {
                    spotifyId: track.id,
                    title: track.name,
                    artist: track.artists[0]?.name || 'Unknown Artist',
                    duration: Math.floor(track.duration_ms / 1000),
                    coverURL: track.album.images[0]?.url || '',
                    uri: `spotify:track:${track.id}`
                };

                try {
                    // Validate and create the song using the factory
                    SongFactory.createSong(songData);
                    return {
                        id: track.id,
                        name: track.name,
                        duration_ms: track.duration_ms,
                        artists: track.artists.map(artist => ({
                            name: artist.name
                        })),
                        album: {
                            name: track.album.name,
                            images: track.album.images.map(image => ({
                                url: image.url,
                                height: image.height,
                                width: image.width
                            }))
                        }
                    };
                } catch (error) {
                    console.warn(`Skipping invalid track ${track.id}:`, error);
                    return null;
                }
            }).filter(Boolean) as SearchResultTrack[];
        } catch (error) {
            console.error('Error searching tracks:', error);
            throw new SpotifyApiError(
                'Failed to search tracks',
                error instanceof Error ? undefined : (error as any).response?.status,
                'search'
            );
        }
    }

    static async initialize(code: string): Promise<SpotifyAdapter> {
        try {
            const { access_token, refresh_token } = await SpotifyAuthService.getAccessToken(code);
            return new SpotifyAdapter(access_token, refresh_token);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown initialization error';
            throw new SpotifyAuthError(`Initialization failed: ${message}`);
        }
    }

    async playTrack(spotifyId: string, deviceId?: string): Promise<void> {
        try {
            const endpoint = 'me/player/play';
            const body = {
                uris: [`spotify:track:${spotifyId}`]
            };

            const options = {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                params: deviceId ? { device_id: deviceId } : undefined
            };

            await axios.put(`https://api.spotify.com/v1/${endpoint}`, body, options);
        } catch (error: any) {
            const response = error.response;
            
            if (response?.status === 404) {
                throw new SpotifyApiError(
                    "No active device found. Please open Spotify on a device first.",
                    404,
                    'play'
                );
            }

            throw new SpotifyApiError(
                "Failed to play track",
                response?.status,
                'play'
            );
        }
    }

    async getCurrentPlayback(): Promise<PlaybackState> {
        return this.makeRequest('me/player');
    }

    getAccessToken(): string {
        return this.accessToken;
    }
}