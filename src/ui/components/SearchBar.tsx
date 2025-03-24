import React, { useState, useCallback } from 'react';
import { useMusicContext } from '../contexts/MusicContext';
import { debounce } from 'lodash';
import styled from 'styled-components';
import { SearchResultTrack } from '@/core/ports/IMetadataFetcher';
import { FaSearch } from 'react-icons/fa';

const SearchContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 12px 20px;
    padding-left: 45px;
    border: none;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
`;

const SearchIcon = styled(FaSearch)`
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.1rem;
`;

interface SearchBarProps {
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { spotifyAdapter, setSearchResults } = useMusicContext();

    const debouncedSearch = useCallback(
        debounce(async (term: string) => {
            if (term.length < 3) {
                setSearchResults([]);
                return;
            }

            setIsLoading(true);
            try {
                if (!spotifyAdapter) {
                    throw new Error('Spotify adapter not initialized');
                }
                // Add explicit type annotation here
                const results: SearchResultTrack[] = await spotifyAdapter.searchTracks(term);
                setSearchResults(results || []);
            } catch (error) {
                console.error('Error en la búsqueda:', error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500),
        [spotifyAdapter, setSearchResults]
    );

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <SearchContainer className={className}>
            <SearchIcon />
            <SearchInput
                type="text"
                placeholder="Buscar canciones..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Buscar canciones"
                disabled={isLoading}
            />
            {isLoading && <LoadingIndicator />}
        </SearchContainer>
    );
};

const LoadingIndicator = styled.div`
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border: 2px solid ${({ theme }) => theme.colors.textSecondary};
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        to {
            transform: translateY(-50%) rotate(360deg);
        }
    }
`;