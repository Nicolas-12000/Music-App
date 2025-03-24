import axios from 'axios';

/**
 * Servicio para manejar la autenticación con Spotify
 */
export class SpotifyAuthService {
    private static readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
    private static readonly SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
    private static readonly CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    private static readonly CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    private static readonly REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

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
        refresh_token: string, 
        expires_in: number 
    }> {
        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.REDIRECT_URI
            });

            const response = await axios.post(
                this.SPOTIFY_TOKEN_URL,
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
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in
            };
        } catch (error: any) {
            const mensajeError = error.response?.data?.error_description 
                || 'Error al autenticar con Spotify';
            throw new Error(`Error de Autenticación Spotify: ${mensajeError}`);
        }
    }

    /**
     * Refresca el token de acceso usando el token de refresco
     */
    static async refreshToken(refreshToken: string): Promise<{
        access_token: string,
        expires_in: number
    }> {
        try {
            const params = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            });

            const response = await axios.post(
                this.SPOTIFY_TOKEN_URL,
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
                expires_in: response.data.expires_in
            };
        } catch (error: any) {
            throw new Error(`Error al refrescar el token: ${error.response?.data?.error || 'Error desconocido'}`);
        }
    }
}