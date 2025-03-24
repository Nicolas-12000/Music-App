import React from 'react';
import styled from 'styled-components';
import { SearchResultTrack } from '@/core/ports/IMetadataFetcher';

const ResultsContainer = styled.div`
    margin-top: 10px;
    max-height: 400px;
    overflow-y: auto;
    background: #2a2a2a;
    border-radius: 8px;
`;

const ResultItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background: #3a3a3a;
    }
`;

const TrackInfo = styled.div`
    margin-left: 12px;
`;

const TrackImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 4px;
`;

interface SearchResultsProps {
    results: SearchResultTrack[];
    onSelectTrack: (track: SearchResultTrack) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
    results, 
    onSelectTrack 
}) => {
    if (!results.length) return null;

    return (
        <ResultsContainer>
            {results.map((track) => (
                <ResultItem 
                    key={track.id}
                    onClick={() => onSelectTrack(track)}
                >
                    <TrackImage 
                        src={track.album.images[0]?.url || '/default-album.png'} 
                        alt={track.name}
                    />
                    <TrackInfo>
                        <div>{track.name}</div>
                        <div style={{ fontSize: '0.8em', color: '#808080' }}>
                            {track.artists.map(a => a.name).join(', ')}
                        </div>
                    </TrackInfo>
                </ResultItem>
            ))}
        </ResultsContainer>
    );
};