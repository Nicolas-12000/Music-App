import React, { useState } from 'react';
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
    const [strategy, setStrategy] = useState<'start' | 'end' | 'afterCurrent'>('end');

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
        addSong(songData, strategy);
    };

    return (
        <AppContainer>
            <SearchBar />
            <div>
                <label>Insertar canción en:</label>
                <select onChange={(e) => setStrategy(e.target.value as 'start' | 'end' | 'afterCurrent')}>
                    <option value="start">Inicio</option>
                    <option value="end">Final</option>
                    <option value="afterCurrent">Después de la actual</option>
                </select>
            </div>
            <SearchResults 
                results={searchResults} 
                onSelectTrack={handleSelectTrack}
            />
        </AppContainer>
    );
};
