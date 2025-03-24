import axios from 'axios';

export interface SpotifyTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
}

/**
 * Servicio para manejar la autenticación con Spotify
 */
export class SpotifyAuthService {
    private static readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
    private static readonly CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    private static readonly CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    private static readonly REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    private static readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';

    /**
     * Obtiene la URL de autorización de Spotify
     */
    static getAuthUrl(scopes: string[] = ['user-read-private']): string {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            response_type: 'code',
            redirect_uri: this.REDIRECT_URI,
            scope: scopes.join(' '),
            show_dialog: 'true'
        });
        return `${this.SPOTIFY_AUTH_URL}?${params.toString()}`;
    }

    /**
     * Obtiene el token de acceso usando el código de autorización
     */
    static async getAccessToken(code: string): Promise<{ 
        access_token: string, 
        refresh_token: string 
    }> {
        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.REDIRECT_URI
            });

            const response = await axios.post(
                this.TOKEN_URL,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(
                            `${this.CLIENT_ID}:${this.CLIENT_SECRET}`
                        )}`
                    }
                }
            );

            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token
            };
        } catch (error: any) {
            throw new Error(`Auth failed: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Refresca el token de acceso usando el token de refresco
     */
    static async refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
        try {
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            });

            const response = await axios.post(
                this.TOKEN_URL,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${btoa(
                            `${this.CLIENT_ID}:${this.CLIENT_SECRET}`
                        )}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error('Error al refrescar el token');
        }
    }
}