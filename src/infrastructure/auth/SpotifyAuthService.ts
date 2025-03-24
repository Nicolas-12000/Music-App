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
// Auth Service Implementation
// ========================
export class SpotifyAuthService {
  private static readonly SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
  private static readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';

  // Environment variables validation
  private static validateEnvVariable(value: string | undefined, name: string): string {
    if (!value) {
      throw new SpotifyAuthError(`Missing environment variable: ${name}`);
    }
    return value;
  }

  static get CLIENT_ID(): string {
    return this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      'VITE_SPOTIFY_CLIENT_ID'
    );
  }

  static get CLIENT_SECRET(): string {
    return this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      'VITE_SPOTIFY_CLIENT_SECRET'
    );
  }

  static get REDIRECT_URI(): string {
    return this.validateEnvVariable(
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      'VITE_SPOTIFY_REDIRECT_URI'
    );
  }

  static get SCOPES(): string {
    return [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
    ].join(' ');
  }

  // Auth URL generation
  static getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: 'code',
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES,
      state: state,
      show_dialog: 'true',
    });
    return `${this.SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  // Token handling with improved error management
  private static createBasicAuthHeader(): string {
    try {
      const credentials = `${this.CLIENT_ID}:${this.CLIENT_SECRET}`;
      // Universal base64 encoding (works in both browser and Node.js)
      return `Basic ${typeof btoa !== 'undefined' 
        ? btoa(credentials) 
        : Buffer.from(credentials).toString('base64')}`;
    } catch (error) {
      throw new SpotifyAuthError('Failed to encode client credentials');
    }
  }

  static async getTokens(code: string): Promise<SpotifyTokenResponse> {
    try {
      const data = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.REDIRECT_URI,
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
      const errorMessage = error.response?.data?.error_description 
        || error.message 
        || 'Unknown authentication error';
      
      throw new SpotifyAuthError(`Failed to get tokens: ${errorMessage}`);
    }
  }

  static async refreshToken(refreshToken: string): Promise<SpotifyTokenResponse> {
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

      // Preserve existing refresh token if not provided in response
      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
        scope: response.data.scope,
        refresh_token: response.data.refresh_token || refreshToken,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error_description 
        || error.message 
        || 'Unknown token refresh error';
      
      throw new SpotifyAuthError(`Failed to refresh token: ${errorMessage}`);
    }
  }
}