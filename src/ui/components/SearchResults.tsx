import React, { useState } from 'react';
import styled from 'styled-components';
import { SearchResultTrack } from '@/core/ports/IMetadataFetcher';

const ResultsContainer = styled.div`
    margin-top: 10px;
    max-height: 400px;
    overflow-y: auto;
    background: #2a2a2a;
    border-radius: 8px;
    padding: 10px;
`;

const StrategySelector = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
`;

const StrategyButton = styled.button<{ active: boolean }>`
    padding: 8px 12px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background: ${({ active }) => (active ? '#1db954' : '#3a3a3a')};
    color: white;
    transition: background 0.3s;
    &:hover {
        background: #1db954;
    }
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
    onSelectTrack: (track: SearchResultTrack, strategy: 'start' | 'end' | 'afterCurrent') => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelectTrack }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<'start' | 'end' | 'afterCurrent'>('end');

    if (!results.length) return null;

    return (
        <ResultsContainer>
            {/* Selector de Estrategia */}
            <StrategySelector>
                <StrategyButton 
                    active={selectedStrategy === 'start'}
                    onClick={() => setSelectedStrategy('start')}
                >
                    Agregar al Inicio
                </StrategyButton>
                <StrategyButton 
                    active={selectedStrategy === 'end'}
                    onClick={() => setSelectedStrategy('end')}
                >
                    Agregar al Final
                </StrategyButton>
                <StrategyButton 
                    active={selectedStrategy === 'afterCurrent'}
                    onClick={() => setSelectedStrategy('afterCurrent')}
                >
                    Insertar Después
                </StrategyButton>
            </StrategySelector>

            {/* Lista de Resultados */}
            {results.map((track) => (
                <ResultItem key={track.id} onClick={() => onSelectTrack(track, selectedStrategy)}>
                    <TrackImage src={track.album.images[0]?.url || '/default-album.png'} alt={track.name} />
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