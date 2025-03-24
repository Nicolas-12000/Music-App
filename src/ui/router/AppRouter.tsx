import React from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MusicProvider } from '@/ui/contexts/MusicContext';
import { MainLayout } from '@/ui/layouts/MainLayout';
import { PlaylistView } from '@/ui/views/PlaylistView';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3fa9f5 0%, #6b5df5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <MusicProvider>
        <AppContainer>
          <Header>
            <Title>Music App</Title>
          </Header>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<PlaylistView />} />
            </Route>
          </Routes>
        </AppContainer>
      </MusicProvider>
    </BrowserRouter>
  );
};