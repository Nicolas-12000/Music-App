import React from 'react';
import styled from 'styled-components';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { useMusicContext } from '../contexts/MusicContext';
import { SearchResultTrack, SongData } from '@/core/ports/IMetadataFetcher';

const AppContainer = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

export const MusicApp: React.FC = () => {
    const { searchResults, addSong } = useMusicContext();

    const handleSelectTrack = (track: SearchResultTrack): void => {
        const songData: SongData = {
            id: track.id,
            title: track.name,
            artist: track.artists[0]?.name || 'Unknown Artist',
            duration: Math.floor(track.duration_ms / 1000),
            coverURL: track.album.images[0]?.url || '',
            albumName: track.album.name,
            spotifyId: track.id 
        };
        addSong(songData);
    };

    return (
        <AppContainer>
            <SearchBar />
            <SearchResults 
                results={searchResults} 
                onSelectTrack={handleSelectTrack}
            />
        </AppContainer>
    );
};