import axios from 'axios';

export interface SpotifyTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

export class SpotifyAuthService {
    private static readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
    private static readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';
    
    static get CLIENT_ID(): string {
        return import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    }

    static get CLIENT_SECRET(): string {
        return import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    }

    static get REDIRECT_URI(): string {
        return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    }

    static get SCOPES(): string {
        return [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing'
        ].join(' ');
    }

    static getAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            response_type: 'code',
            redirect_uri: this.REDIRECT_URI,
            scope: this.SCOPES,
            state: state,
            show_dialog: 'true'
        });
        return `${this.SPOTIFY_AUTH_URL}?${params.toString()}`;
    }

    static async getTokens(code: string): Promise<SpotifyTokenResponse> {
        try {
            const data = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: this.REDIRECT_URI
            });

            const response = await axios.post(this.TOKEN_URL, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`
                }
            });

            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in,
                token_type: response.data.token_type,
                scope: response.data.scope
            };
        } catch (error: any) {
            throw new Error(`Error getting tokens: ${error.response?.data?.error_description || error.message}`);
        }
    }

    static async refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
        try {
            const data = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            });

            const response = await axios.post(this.TOKEN_URL, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`
                }
            });

            return {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in,
                token_type: response.data.token_type,
                scope: response.data.scope
            };
        } catch (error: any) {
            throw new Error(`Error refreshing token: ${error.response?.data?.error_description || error.message}`);
        }
    }
}