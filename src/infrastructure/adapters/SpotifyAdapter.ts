import axios from 'axios';
import { IMetadataFetcher, SearchResultTrack, SongMetadata } from '@/core/ports/IMetadataFetcher';
import { SpotifyAuthService, SpotifyTokenResponse } from '@/infrastructure/auth/SpotifyAuthService';
import { SongFactory } from '@/infrastructure/factories/SongFactory';
import { SongData } from '@/core/entities/SongNode';

// ========================
// Error Classes
// ========================
class SpotifyApiError extends Error {
  constructor(message: string, public statusCode?: number, public endpoint?: string) {
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
// Type Definitions
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
  uri: string;
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
// Adapter Implementation
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
          'Content-Type': 'application/json',
        },
        params,
      });
      return response.data;
    } catch (error: any) {
      const response = error.response;

      // Handle rate limiting
      if (response?.status === 429) {
        if (retryCount >= this.MAX_RETRIES) {
          throw new SpotifyApiError(
            'Service is temporarily unavailable. Please try again later.',
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
          throw new SpotifyAuthError('Your session has expired. Please authenticate again.');
        }
      }

      // Handle specific error cases
      switch (response?.status) {
        case 404:
          throw new SpotifyApiError('The requested resource was not found', 404, endpoint);
        case 500:
          throw new SpotifyApiError('Internal server error', 500, endpoint);
      }

      // Handle network errors
      if (!response) {
        throw new SpotifyApiError('Network connection error', undefined, endpoint);
      }

      // Generic error handling
      throw new SpotifyApiError(
        response.data?.error?.message || 'An unexpected error occurred',
        response.status,
        endpoint
      );
    }
  }

  private async validateToken(): Promise<void> {
    try {
      await this.makeRequest('me');
    } catch (error) {
      if (error instanceof SpotifyApiError && error.statusCode === 401) {
        await this.refreshAccessToken();
      } else {
        throw error;
      }
    }
  }

  public async refreshAccessToken(): Promise<void> {
    try {
      const newTokens = await SpotifyAuthService.refreshToken(this.refreshToken);
      
      if (!newTokens?.access_token) {
        throw new SpotifyAuthError('No valid access token received');
      }

      this.accessToken = newTokens.access_token;
      if (newTokens.refresh_token) {
        this.refreshToken = newTokens.refresh_token;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new SpotifyAuthError(`Token refresh error: ${message}`);
    }
  }

  async fetchSongInfo(title: string, artist: string): Promise<SongMetadata> {
    await this.validateToken();
    const data = await this.makeRequest<SpotifySearchResponse>('search', {
      q: `track:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`,
      type: 'track',
      limit: 1,
      market: 'US',
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
      year: track.album.release_date?.split('-')[0] || 'Unknown',
    };
  }

  async fetchCover(title: string, artist: string): Promise<string> {
    await this.validateToken();
    const data = await this.makeRequest<SpotifySearchResponse>('search', {
      q: `track:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}`,
      type: 'track',
      limit: 1,
      market: 'US',
    });

    const track = data.tracks?.items[0];
    if (!track) {
      throw new SpotifyApiError(`Track not found: ${title} by ${artist}`, 404, 'search');
    }

    return track.album.images[0]?.url || '';
  }

  async searchTracks(query: string): Promise<SearchResultTrack[]> {
    await this.validateToken();
    try {
      const data = await this.makeRequest<SpotifySearchResponse>('search', {
        q: query,
        type: 'track',
        limit: 10,
        market: 'US',
      });

      return data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        duration_ms: track.duration_ms,
        artists: track.artists.map(artist => ({ name: artist.name })),
        album: {
          name: track.album.name,
          images: track.album.images.map(image => ({
            url: image.url,
            height: image.height,
            width: image.width,
          })),
        },
        uri: track.uri,
      })).filter(Boolean) as SearchResultTrack[];
    } catch (error) {
      throw new SpotifyApiError(
        'Failed to search tracks',
        error instanceof Error ? undefined : (error as any).response?.status,
        'search'
      );
    }
  }

  static async initialize(code: string | undefined): Promise<SpotifyAdapter> {
    try {
      if (!code) {
        throw new SpotifyAuthError('Authorization code is missing');
      }
      
      const tokens = await SpotifyAuthService.getTokens(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new SpotifyAuthError('Invalid tokens received from Spotify');
      }

      return new SpotifyAdapter(tokens.access_token, tokens.refresh_token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown initialization error';
      throw new SpotifyAuthError(`Initialization failed: ${message}`);
    }
  }

  async playTrack(spotifyId: string, deviceId?: string): Promise<void> {
    await this.validateToken();
    try {
      const endpoint = 'me/player/play';
      const body = {
        uris: [`spotify:track:${spotifyId}`],
      };

      await axios.put(`https://api.spotify.com/v1/${endpoint}`, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        params: deviceId ? { device_id: deviceId } : undefined,
      });
    } catch (error: any) {
      const response = error.response;
      
      if (response?.status === 404) {
        throw new SpotifyApiError(
          'No active device found. Please open Spotify on a device first.',
          404,
          'play'
        );
      }

      throw new SpotifyApiError(
        response?.data?.error?.message || 'Failed to play track',
        response?.status,
        'play'
      );
    }
  }

  async getCurrentPlayback(): Promise<PlaybackState> {
    await this.validateToken();
    return this.makeRequest<PlaybackState>('me/player');
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }
}