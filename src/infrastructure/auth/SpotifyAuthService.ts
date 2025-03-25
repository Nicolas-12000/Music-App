import axios from 'axios';

// ========================
// Error Class
// ========================
class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpotifyAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ========================
// Type Definitions
// ========================
export interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// ========================
// Auth Service Implementation (Singleton)
// ========================
export class SpotifyAuthService {
  private static instance: SpotifyAuthService;

  // Configuración de instancia
  private readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'; // URL correcta de Spotify
  private readonly TOKEN_URL = 'https://accounts.spotify.com/api/token'; // URL correcta de Spotify
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string;

  // Constructor privado para singleton
  private constructor() {
    // Validar y cargar variables de entorno una sola vez
    this.clientId = this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      'VITE_SPOTIFY_CLIENT_ID'
    );

    this.clientSecret = this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      'VITE_SPOTIFY_CLIENT_SECRET'
    );

    this.redirectUri = this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      'VITE_SPOTIFY_REDIRECT_URI'
    );

    this.scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
    ].join(' ');
  }

  // Método singleton
  public static getInstance(): SpotifyAuthService {
    if (!SpotifyAuthService.instance) {
      SpotifyAuthService.instance = new SpotifyAuthService();
    }
    return SpotifyAuthService.instance;
  }

  // Validación centralizada de variables de entorno
  private validateEnvVariable(value: string | undefined, name: string): string {
    if (!value) {
      throw new SpotifyAuthError(`Missing environment variable: ${name}`);
    }
    return value;
  }

  // Generación de URL de autenticación
  public getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state,
      show_dialog: 'true',
    });
    return `${this.SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  // Manejo de autenticación básica
  private createBasicAuthHeader(): string {
    try {
      const credentials = `${this.clientId}:${this.clientSecret}`;
      return `Basic ${typeof btoa !== 'undefined'
        ? btoa(credentials)
        : Buffer.from(credentials).toString('base64')}`;
    } catch (error) {
      throw new SpotifyAuthError('Failed to encode client credentials');
    }
  }

  // Obtención de tokens (proxy estático)
  public static async getTokens(code: string): Promise<SpotifyTokenResponse> {
    return SpotifyAuthService.getInstance()._getTokens(code); // Llama al método de instancia
  }

  // Refresh de tokens (proxy estático)
  public static async refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    return SpotifyAuthService.getInstance()._refreshToken(refreshToken); // Llama al método de instancia
  }

  // Obtención de tokens (método de instancia renombrado)
  private async _getTokens(code: string): Promise<SpotifyTokenResponse> {
    try {
      const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const response = await axios.post(this.TOKEN_URL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.createBasicAuthHeader(),
        },
      });

      if (!response.data.access_token) {
        throw new SpotifyAuthError('Invalid token response from Spotify');
      }

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
        scope: response.data.scope,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error_description ||
        error.message ||
        'Unknown authentication error';

      throw new SpotifyAuthError(`Failed to get tokens: ${errorMessage}`);
    }
  }

  // Refresh de tokens (método de instancia renombrado)
  private async _refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    if (!refreshToken) {
      throw new SpotifyAuthError('No refresh token available');
    }

    try {
      const data = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const response = await axios.post(this.TOKEN_URL, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.createBasicAuthHeader(),
        },
      });

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
        scope: response.data.scope,
        refresh_token: response.data.refresh_token || refreshToken,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error_description ||
        error.message ||
        'Unknown token refresh error';

      throw new SpotifyAuthError(`Failed to refresh token: ${errorMessage}`);
    }
  }
}