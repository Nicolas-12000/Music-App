import React from 'react';
import styled from 'styled-components';
import { MusicProvider } from './ui/contexts/MusicContext';
import { MusicApp } from './ui/components/MusicApp';

const AppWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  color: #fff;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #3fa9f5 0%, #6b5df5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const App = () => {
  return (
    <MusicProvider>
      <AppWrapper>
        <Container>
          <Header>
            <Title>Music App</Title>
          </Header>
          <MusicApp />
        </Container>
      </AppWrapper>
    </MusicProvider>
  );
};

export default App;
