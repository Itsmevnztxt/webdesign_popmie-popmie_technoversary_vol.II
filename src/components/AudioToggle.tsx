import { useEffect, useState } from 'react';
import { audioManager } from '../audio/audioManager';

export function AudioToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => audioManager.isEnabled());

  useEffect(() => {
    return audioManager.subscribe(setEnabled);
  }, []);

  const handleToggle = () => {
    audioManager.toggle();
  };

  return (
    <button
      id="audio-toggle-btn"
      type="button"
      className={`hud-audio-btn${enabled ? ' is-active' : ''}`}
      aria-pressed={enabled}
      aria-label={enabled ? 'Matikan suara latar dan efek suara' : 'Nyalakan suara latar dan efek suara'}
      onClick={handleToggle}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill={enabled ? '#F5D77D' : '#DCEEDB'}
          stroke="#293A30"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {enabled ? (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="#293A30" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#293A30" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <path d="M16.5 9.5l4 5m0-5l-4 5" fill="none" stroke="#293A30" strokeWidth="2.2" strokeLinecap="round" />
        )}
      </svg>
      <span>{enabled ? 'Suara: Hidup' : 'Suara: Mati'}</span>
    </button>
  );
}
