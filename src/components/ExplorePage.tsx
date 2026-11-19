import { ExploreStage, useRimba } from '../state/rimbaStore';
import { CanopyZone } from './CanopyZone';
import { RiverZone } from './RiverZone';
import { UndergroundZone } from './UndergroundZone';
import { MangroveZone } from './MangroveZone';
import { RewardSanctuary } from './RewardSanctuary';
import { audioManager } from '../audio/audioManager';

interface StageTabConfig {
  id: ExploreStage;
  shortLabel: string;
  subLabel: string;
}

const STAGES: readonly StageTabConfig[] = [
  { id: 'canopy', shortLabel: 'Zona 1: Kanopi', subLabel: 'Lulu si Lebah' },
  { id: 'river', shortLabel: 'Zona 2: Sungai', subLabel: 'Kiko si Katak' },
  { id: 'underground', shortLabel: 'Zona 3: Bawah Tanah', subLabel: 'Cici si Cacing' },
  { id: 'mangrove', shortLabel: 'Zona 4: Mangrove', subLabel: 'Bako si Kepiting' },
  { id: 'sanctuary', shortLabel: 'Taman Hadiah', subLabel: 'Koleksi Alam' }
];

export function ExplorePage() {
  const { state, exploreStage, setExploreStage, unlockedCount } = useRimba();

  const currentIdx = STAGES.findIndex((s) => s.id === exploreStage);
  const prevStage = currentIdx > 0 ? STAGES[currentIdx - 1] : null;
  const nextStage = currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;

  const handleSelectStage = (stage: ExploreStage) => {
    audioManager.playSfx('click');
    setExploreStage(stage);
  };

  return (
    <div id="jelajah-page" className="explore-shell">
      {/* Stage Switcher Bar */}
      <div id="explore-stage-header" className="no-print bg-[#FAF8F0] border-b-2 border-[#293A30]/15 py-3 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 explore-compass-pad">
          <div>
            <h1 className="font-story text-xl sm:text-2xl font-bold m-0">
              Panggung Dunia Jelajah
            </h1>
            <p className="text-xs sm:text-sm text-[#477A59] font-semibold m-0">
              {state.passport
                ? `Penjelajah aktif: ${state.passport.name} • ${unlockedCount}/4 Lencana`
                : 'Pilih satu zona di bawah untuk mulai bermain peran menjaga alam'}
            </p>
          </div>

          <div
            className="stage-switcher"
            role="group"
            aria-label="Pilih panggung zona jelajah"
          >
            {STAGES.map((stage) => {
              const isActive = exploreStage === stage.id;
              const isDone =
                stage.id !== 'sanctuary' && Boolean(state.badges[stage.id]);
              return (
                <button
                  key={stage.id}
                  id={`stage-btn-${stage.id}`}
                  type="button"
                  aria-pressed={isActive}
                  className={`stage-pill-btn${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                  onClick={() => handleSelectStage(stage.id)}
                >
                  <span className="font-bold text-xs sm:text-sm leading-tight">{stage.shortLabel}</span>
                  <span className="text-[11px] sm:text-xs opacity-80 leading-tight">
                    {stage.id === 'sanctuary' ? `${unlockedCount}/4 Tumbuh` : stage.subLabel}
                    {isDone ? ' ✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Full-Screen Interactive Stage (1 stage at a time) */}
      <div id="explore-active-stage" key={exploreStage} className="route-stage-enter">
        {exploreStage === 'canopy' && <CanopyZone />}
        {exploreStage === 'river' && <RiverZone />}
        {exploreStage === 'underground' && <UndergroundZone />}
        {exploreStage === 'mangrove' && <MangroveZone />}
        {exploreStage === 'sanctuary' && <RewardSanctuary />}
      </div>

      {/* Stage Footer Navigation */}
      <div id="explore-stage-footer" className="bg-[#FAF8F0] border-t-2 border-[#293A30]/15 py-5 sm:py-6 px-5 sm:px-10">
        <div className="max-w-5xl mx-auto explore-compass-pad flex flex-wrap items-center justify-between gap-3">
          {prevStage ? (
            <button
              type="button"
              className="touch-btn btn-paper px-4 py-2 text-sm sm:text-base"
              onClick={() => handleSelectStage(prevStage.id)}
            >
              ← {prevStage.shortLabel}
            </button>
          ) : (
            <span />
          )}

          {nextStage && (
            <button
              type="button"
              className="touch-btn btn-primary px-5 py-2 text-sm sm:text-base ml-auto"
              onClick={() => handleSelectStage(nextStage.id)}
            >
              Pindah ke {nextStage.shortLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
