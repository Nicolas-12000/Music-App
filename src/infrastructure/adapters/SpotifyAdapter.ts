import axios from 'axios';
import { IMetadataFetcher, SearchResultTrack, SongMetadata } from "@/core/ports/IMetadataFetcher";
import { SpotifyAuthService } from '@/infrastructure/auth/SpotifyAuthService';

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
    
            // Mapeo correcto asegurando que los tipos coincidan
            return data.tracks.items.map(track => ({
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
            }));
        } catch (error) {
            console.error('Error buscando canciones:', error);
            throw new SpotifyApiError(
                'Error al buscar canciones',
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
}