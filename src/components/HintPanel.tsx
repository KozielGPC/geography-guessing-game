import type { Hint } from '../types';

interface HintPanelProps {
  hints: Hint[];
  revealedCount: number;
  onReveal: () => void;
  disabled?: boolean;
}

const categoryLabels: Record<Hint['category'], string> = {
  geographical: 'Geography',
  cultural: 'Culture',
  socioeconomic: 'Socioeconomic',
};

const categoryIcons: Record<Hint['category'], string> = {
  geographical: '🌍',
  cultural: '🎭',
  socioeconomic: '📊',
};

export function HintPanel({ hints, revealedCount, onReveal, disabled = false }: HintPanelProps) {
  const canRevealMore = revealedCount < hints.length;

  return (
    <div className="hint-panel">
      <div className="hint-panel-header">
        <h3>Clues</h3>
        <div className="hint-progress">
          {Array.from({ length: hints.length }).map((_, i) => (
            <span
              key={i}
              className={`hint-dot ${i < revealedCount ? 'revealed' : ''}`}
              title={i < revealedCount ? `Hint ${i + 1} revealed` : `Hint ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="hint-cards">
        {hints.slice(0, revealedCount).map((hint, i) => (
          <div key={i} className="hint-card">
            <span className="hint-category">
              {categoryIcons[hint.category]} {categoryLabels[hint.category]}
            </span>
            <p className="hint-text">{hint.text}</p>
          </div>
        ))}
      </div>

      {canRevealMore && (
        <button
          type="button"
          onClick={onReveal}
          disabled={disabled}
          className="reveal-hint-btn"
        >
          <span className="btn-icon">💡</span>
          Reveal clue {revealedCount + 1}
        </button>
      )}

      <style>{`
        .hint-panel {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--accent-primary);
          padding: 20px;
          box-shadow: var(--shadow-card);
        }

        .hint-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .hint-panel-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .hint-progress {
          display: flex;
          gap: 6px;
        }

        .hint-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--bg-elevated);
          transition: all 0.2s;
        }

        .hint-dot.revealed {
          background: var(--accent-primary);
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.5);
        }

        .hint-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .hint-card {
          padding: 12px 14px;
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--accent-primary);
        }

        .hint-category {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #fff;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .hint-text {
          margin: 0;
          font-size: 0.9rem;
          color: #fff;
          line-height: 1.45;
        }

        .reveal-hint-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(167, 139, 250, 0.15));
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .reveal-hint-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(167, 139, 250, 0.25));
          border-color: rgba(34, 211, 238, 0.5);
          transform: translateY(-1px);
        }

        .reveal-hint-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}
