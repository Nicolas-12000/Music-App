import axios from 'axios';
import { IMetadataFetcher } from "@/core/ports/IMetadataFetcher";
import { SpotifyAuthService } from '@/infrastructure/auth/SpotifyAuthService';

interface SpotifyImage {
    url: string;
    height: number;
    width: number;
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
    album: SpotifyAlbum;
}

interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
    };
}

interface SpotifyTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
}

interface SongMetadata {
    album: string;
    year: string;
    duration: number;
    spotifyId: string;
    coverURL: string;
}

export class SpotifyAdapter implements IMetadataFetcher {
    private accessToken: string;
    private refreshToken: string;
    
    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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
            if (error.response?.status === 401) {
                await this.refreshAccessToken();
                return this.makeRequest(endpoint, params);
            }
            
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 5;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return this.makeRequest(endpoint, params);
            }
            
            throw new Error(`Spotify API Error [${error.response?.status}]: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            const newTokens: SpotifyTokenResponse = await SpotifyAuthService.refreshToken(this.refreshToken);
            this.accessToken = newTokens.access_token;
            if (newTokens.refresh_token) {
                this.refreshToken = newTokens.refresh_token;
            }
        } catch (error) {
            throw new Error("Error al refrescar el token: " + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    }

    async fetchCover(title: string, artist: string): Promise<string> {
        const data = await this.makeRequest<SpotifySearchResponse>('search', {
            q: `track:${title} artist:${artist}`,
            type: 'track',
            limit: 1,
            market: 'US'
        });
        
        const coverUrl = data.tracks?.items[0]?.album?.images[0]?.url;
        if (!coverUrl) throw new Error("No se encontró portada para la canción");
        return coverUrl;
    }

    async fetchSongInfo(title: string, artist: string): Promise<SongMetadata> {
        const data = await this.makeRequest<SpotifySearchResponse>('search', {
            q: `track:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`,
            type: 'track',
            limit: 1,
            market: 'US'
        });
    
        const track = data.tracks?.items[0];
        if (!track) throw new Error("TRACK_NOT_FOUND");
    
        // Obtener coverURL usando fetchCover()
        const coverURL = await this.fetchCover(title, artist); 
    
        return {
            duration: Math.floor(track.duration_ms / 1000), // Documentar que está en segundos
            coverURL, // Asignar explícitamente
            spotifyId: track.id,
            album: track.album.name,
            year: track.album.release_date?.split('-')[0] || 'Desconocido'
        };
    }

    static async initialize(code: string): Promise<SpotifyAdapter> {
        try {
            const { access_token, refresh_token } = await SpotifyAuthService.getAccessToken(code);
            return new SpotifyAdapter(access_token, refresh_token);
        } catch (error) {
            throw new Error(`Error de inicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}