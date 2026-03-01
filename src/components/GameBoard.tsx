import { useState, useCallback } from 'react';
import { useDailyPlace } from '../hooks/useDailyPlace';
import { useMapSelection, checkGuess } from '../hooks/useMapSelection';
import { getHintsForPlace } from '../utils/hints';
import { MapSelector } from './MapSelector';
import { HintPanel } from './HintPanel';
import type { Place, GameStatus } from '../types';

const MAX_TRIES = 5;

export function GameBoard() {
  const place = useDailyPlace();
  const hints = getHintsForPlace(place);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [triesUsed, setTriesUsed] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);

  const { selection, isLoading, error, handleMapClick } = useMapSelection();

  const handleRevealHint = useCallback(() => {
    setHintsRevealed((n) => Math.min(n + 1, hints.length));
  }, [hints.length]);

  const handleMapSelect = useCallback(
    async (lat: number, lon: number, zoom: number) => {
      if (status !== 'playing') return;
      const result = await handleMapClick(lat, lon, zoom);
      if (!result) return;

      const correct = checkGuess(result, place);
      if (correct) {
        setStatus('won');
        setWrongFeedback(null);
      } else {
        const guessStr = [result.city, result.state, result.country, result.continent].filter(Boolean).join(', ') || 'Unknown';
        const newTries = triesUsed + 1;
        setTriesUsed(newTries);
        setWrongFeedback(`Wrong! You selected: ${guessStr}. Try again (${newTries}/${MAX_TRIES}).`);

        if (newTries >= MAX_TRIES) {
          setStatus('lost');
        }
      }
    },
    [handleMapClick, place, status, triesUsed]
  );

  const handleRevealAnswer = useCallback(() => {
    setAnswerRevealed(true);
  }, []);

  const handleTryAgain = useCallback(() => {
    setStatus('playing');
    setTriesUsed(0);
    setAnswerRevealed(false);
    setWrongFeedback(null);
  }, []);

  const getPlaceDisplayName = (p: Place): string => {
    const parts: string[] = [p.name];
    if (p.parentName) parts.push(`(${p.parentName})`);
    if (p.continent && p.type !== 'continent') parts.push(`— ${p.continent}`);
    return parts.join(' ');
  };

  const mapDisabled = status === 'won' || (status === 'lost' && !answerRevealed);
  const showEndButtons = status === 'lost' && triesUsed >= MAX_TRIES;
  const livesRemaining = MAX_TRIES - triesUsed;

  return (
    <div className="game-board">
      <header className="game-header">
        <div className="game-title">
          <h1>Geography Quest</h1>
          <span className="game-subtitle">Daily challenge</span>
        </div>
        <div className="game-stats">
          <div className="lives">
            {Array.from({ length: MAX_TRIES }).map((_, i) => (
              <span
                key={i}
                className={`life ${i < livesRemaining ? 'active' : 'lost'}`}
                aria-label={i < livesRemaining ? 'Life remaining' : 'Life lost'}
              >
                ♥
              </span>
            ))}
          </div>
          <span className="challenge-type">Guess the {place.type}</span>
        </div>
      </header>

      <div className="game-layout">
        <aside className="hints-panel">
          <HintPanel
            hints={hints}
            revealedCount={hintsRevealed}
            onReveal={handleRevealHint}
            disabled={status === 'won'}
          />
        </aside>

        <main className="map-panel">
          <div className="map-header">
            <span className="map-instruction">
              {status === 'playing' ? 'Click on the map to guess' : 'Map'}
            </span>
            {selection && status === 'playing' && (
              <span className="zoom-hint">
                Zoom: {selection.city ? 'city' : selection.state ? 'state' : selection.country ? 'country' : 'continent'}
              </span>
            )}
          </div>

          {wrongFeedback && status === 'playing' && (
            <div className="wrong-feedback">
              <span className="wrong-icon">✗</span>
              {wrongFeedback}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}

          <div className="map-wrapper">
            {isLoading && <div className="loading-overlay">Resolving location...</div>}
            <MapSelector
              onSelect={handleMapSelect}
              disabled={mapDisabled || isLoading}
              height="100%"
            />
          </div>

          {showEndButtons && !answerRevealed && (
            <div className="end-buttons">
              <button type="button" onClick={handleTryAgain} className="btn btn-primary">
                Try again
              </button>
              <button type="button" onClick={handleRevealAnswer} className="btn btn-secondary">
                Reveal answer
              </button>
            </div>
          )}

          {status === 'won' && (
            <div className="result-card success">
              <span className="result-icon">✓</span>
              <h3>Correct!</h3>
              <p>You found {getPlaceDisplayName(place)}!</p>
            </div>
          )}

          {(status === 'lost' && answerRevealed) && (
            <div className="result-card fail">
              <h3>The answer was</h3>
              <p>{getPlaceDisplayName(place)}</p>
              <button type="button" onClick={handleTryAgain} className="btn btn-primary">
                Try again
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .game-board {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(16px, 3vw, 24px);
          min-height: 100vh;
        }

        .game-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--accent-primary);
          box-shadow: var(--shadow-card);
        }

        .game-title h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .game-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-top: 2px;
        }

        .game-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lives {
          display: flex;
          gap: 4px;
        }

        .life {
          font-size: 1.25rem;
          transition: opacity 0.2s;
        }

        .life.active {
          color: var(--accent-danger);
          opacity: 1;
        }

        .life.lost {
          color: var(--text-muted);
          opacity: 0.35;
        }

        .challenge-type {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .game-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .game-layout {
            grid-template-columns: 1fr;
          }

          .hints-panel {
            order: 2;
          }

          .map-panel {
            order: 1;
          }
        }

        .hints-panel {
          position: sticky;
          top: 24px;
        }

        .map-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 400px;
        }

        .map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .map-instruction {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .zoom-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: var(--bg-elevated);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
        }

        .wrong-feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: var(--radius-md);
          color: var(--accent-warning);
          font-size: 0.9rem;
        }

        .wrong-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .error-message {
          color: var(--accent-danger);
          font-size: 0.9rem;
        }

        .map-wrapper {
          position: relative;
          height: 420px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--accent-primary);
          box-shadow: var(--shadow-card);
        }

        .map-wrapper .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.9);
          color: var(--text-secondary);
          font-size: 0.9rem;
          z-index: 10;
        }

        .map-wrapper > div:not(.loading-overlay) {
          height: 100% !important;
          min-height: 100% !important;
        }

        .end-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .btn:active {
          transform: translateY(0);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-primary), #06b6d4);
          color: var(--bg-primary);
        }

        .btn-secondary {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
        }

        .result-card {
          padding: 24px;
          border-radius: var(--radius-lg);
          margin-top: 16px;
        }

        .result-card.success {
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.4);
        }

        .result-card.success .result-icon {
          display: inline-block;
          font-size: 2rem;
          color: var(--accent-success);
          margin-bottom: 8px;
        }

        .result-card.success h3 {
          margin: 0 0 4px 0;
          color: var(--accent-success);
          font-size: 1.25rem;
        }

        .result-card.success p {
          margin: 0 0 16px 0;
          color: var(--text-secondary);
        }

        .result-card.fail {
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .result-card.fail h3 {
          margin: 0 0 8px 0;
          color: var(--accent-danger);
          font-size: 1.1rem;
        }

        .result-card.fail p {
          margin: 0 0 16px 0;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
