import { ExploreStage, useRimba } from '../state/rimbaStore';
import { audioManager } from '../audio/audioManager';

interface CompassItemConfig {
  stage: ExploreStage;
  label: string;
  ariaLabel: string;
}

const COMPASS_ITEMS: CompassItemConfig[] = [
  {
    stage: 'canopy',
    label: 'Kanopi',
    ariaLabel: 'Buka Zona 1: Kanopi dan Padang Bunga'
  },
  {
    stage: 'river',
    label: 'Sungai',
    ariaLabel: 'Buka Zona 2: Tepi Sungai dan Aliran Air'
  },
  {
    stage: 'underground',
    label: 'Bawah Tanah',
    ariaLabel: 'Buka Zona 3: Dunia Bawah Tanah'
  },
  {
    stage: 'mangrove',
    label: 'Mangrove',
    ariaLabel: 'Buka Zona 4: Pesisir Hutan Mangrove'
  },
  {
    stage: 'sanctuary',
    label: 'Taman Hadiah',
    ariaLabel: 'Buka Taman Hadiah TamanPico'
  }
];

function CompassIcon({ stage }: { stage: ExploreStage }) {
  if (stage === 'canopy') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" fill="#F5D77D" stroke="#293A30" strokeWidth="1.8" />
        <path
          d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M5 19l2-2"
          stroke="#293A30"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (stage === 'river') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M12 3C8.5 8 6 11.2 6 14.5a6 6 0 0 0 12 0C18 11.2 15.5 8 12 3z"
          fill="#D9EDE9"
          stroke="#293A30"
          strokeWidth="1.8"
        />
      </svg>
    );
  }
  if (stage === 'underground') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          d="M12 4v10M12 14c-4 2-6 4-7 7M12 14c4 2 6 4 7 7M12 15c-1 2-1 4-1 6"
          fill="none"
          stroke="#477A59"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="5" r="2.5" fill="#C8DEA4" stroke="#293A30" strokeWidth="1.5" />
      </svg>
    );
  }
  if (stage === 'mangrove') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M12 11l-4 9M12 11v9M12 11l4 9" stroke="#5C4636" strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="12" cy="7.5" r="4.5" fill="#477A59" stroke="#293A30" strokeWidth="1.6" />
        <path d="M3 19.5q4.5-2 9 0t9 0" fill="none" stroke="#8CC5DE" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 20v-9" stroke="#477A59" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 12C7 10 6 5 11 5c2 0 3 2 1 7z" fill="#A8C99A" stroke="#293A30" strokeWidth="1.6" />
      <path d="M12 11c5-2 6-7 1-7-2 0-3 2-1 7z" fill="#F5D77D" stroke="#293A30" strokeWidth="1.6" />
    </svg>
  );
}

export function CompassNav() {
  const { state, activeRoute, exploreStage, setExploreStage } = useRimba();

  if (activeRoute !== 'jelajah') return null;

  return (
    <nav id="kompas-lembah" className="hud-compass" aria-label="Kompas Lembah">
      <div className="compass-ruler-track" aria-hidden="true" />
      {COMPASS_ITEMS.map((item) => {
        const isDone = item.stage !== 'sanctuary' && Boolean(state.badges[item.stage]);
        const isActive = exploreStage === item.stage;
        return (
          <button
            key={item.stage}
            type="button"
            className={`compass-item${isDone ? ' is-done' : ''}`}
            data-zone={item.stage}
            aria-label={item.ariaLabel}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => {
              audioManager.playSfx('click');
              setExploreStage(item.stage);
            }}
          >
            <span className="compass-dot" aria-hidden="true">
              <CompassIcon stage={item.stage} />
            </span>
            <span className="compass-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
