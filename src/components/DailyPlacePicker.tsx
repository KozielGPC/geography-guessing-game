import { useDailyPlace } from '../hooks/useDailyPlace';
import { getHintsForPlace } from '../utils/hints';

/**
 * Optional admin/debug component to preview today's place.
 * Add ?preview=1 to the URL to show.
 */
export function DailyPlacePicker() {
  const place = useDailyPlace();
  const hints = getHintsForPlace(place);

  return (
    <details style={{ marginBottom: 16, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>Today&apos;s place (preview)</summary>
      <div style={{ marginTop: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <p><strong>Type:</strong> {place.type}</p>
        <p><strong>Name:</strong> {place.name}</p>
        {place.parentName && <p><strong>Parent:</strong> {place.parentName}</p>}
        {place.continent && <p><strong>Continent:</strong> {place.continent}</p>}
        <p><strong>Hints:</strong></p>
        <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
          {hints.map((h, i) => (
            <li key={i}>{h.text}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
