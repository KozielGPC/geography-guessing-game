import { useMemo } from 'react';
import { GameBoard } from './components/GameBoard';
import { DailyPlacePicker } from './components/DailyPlacePicker';

function App() {
  const showPreview = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1',
    []
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {showPreview && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 3vw, 24px)' }}>
          <DailyPlacePicker />
        </div>
      )}
      <GameBoard />
    </div>
  );
}

export default App;
