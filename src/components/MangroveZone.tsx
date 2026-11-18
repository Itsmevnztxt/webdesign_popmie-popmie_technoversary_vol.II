import React, { useEffect, useState } from 'react';
import { useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

interface TrashItem {
  id: string;
  domId: string;
  label: string;
  image: string;
  leftPct: number;
  topPct: number;
}

const SEA_TRASH: readonly TrashItem[] = [
  {
    id: 'net',
    domId: 'mangrove-trash-net',
    label: 'Bersihkan jaring nelayan yang tersangkut di lumpur pesisir',
    image: '/assets/images/prop-sea-net.png',
    leftPct: 33,
    topPct: 68
  },
  {
    id: 'bottle',
    domId: 'mangrove-trash-bottle',
    label: 'Angkat botol plastik hanyut dari tepi pesisir bakau',
    image: '/assets/images/prop-waste-bottle.png',
    leftPct: 58,
    topPct: 72
  }
];

const PLANT_SPOTS = [
  { id: 'mangrove-spot-0', leftPct: 26, topPct: 64, label: 'Tanam bibit bakau pertama di pesisir kiri' },
  { id: 'mangrove-spot-1', leftPct: 45, topPct: 67, label: 'Tanam bibit bakau kedua di tengah pesisir' },
  { id: 'mangrove-spot-2', leftPct: 64, topPct: 65, label: 'Tanam bibit bakau ketiga di tepi air surut' }
];

export function MangroveZone() {
  const { state, resetCounter, unlockBadge, updateSandbox, setExploreStage, announce } = useRimba();
  const initialDone = Boolean(state.badges.mangrove);

  const [clearedTrash, setClearedTrash] = useState<string[]>(() =>
    initialDone ? SEA_TRASH.map((t) => t.id) : []
  );
  const [plantedSpots, setPlantedSpots] = useState<number[]>(() =>
    initialDone ? [0, 1, 2] : []
  );

  useEffect(() => {
    const done = Boolean(state.badges.mangrove);
    setClearedTrash(done ? SEA_TRASH.map((t) => t.id) : []);
    setPlantedSpots(done ? [0, 1, 2] : []);
  }, [resetCounter, state.badges.mangrove]);

  const trashCleaned = clearedTrash.length >= SEA_TRASH.length;
  const plantedCount = plantedSpots.length;
  const forestRestored = plantedCount >= PLANT_SPOTS.length;
  const waveActive = forestRestored && state.sandbox.waveActive;

  const handleClearTrash = (item: TrashItem) => {
    if (clearedTrash.includes(item.id)) return;
    audioManager.playSfx('sort-ok');
    const next = [...clearedTrash, item.id];
    setClearedTrash(next);
    if (next.length >= SEA_TRASH.length) {
      announce('Pesisir bersih dari jaring dan plastik! Sekarang ketuk 3 titik lumpur untuk menanam bibit bakau.');
    } else {
      announce('Satu sampah pesisir terangkat! Satu lagi ya supaya bibit bakau bisa tumbuh.');
    }
  };

  const handlePlantSpot = (spotIdx: number) => {
    if (!trashCleaned || plantedSpots.includes(spotIdx)) return;
    audioManager.playSfx('soil');
    const next = [...plantedSpots, spotIdx];
    setPlantedSpots(next);
    if (next.length >= PLANT_SPOTS.length) {
      unlockBadge('mangrove');
      announce('Hore! Ketiga bibit bakau tumbuh kokoh! Sekarang coba uji gelombang ombak laut di bawah.');
    } else {
      announce(`Bibit bakau ke-${next.length} tertanam! Tersisa ${PLANT_SPOTS.length - next.length} titik lagi.`);
    }
  };

  const handleKeyDownAction = (cb: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') cb();
    if (e.key === ' ') e.preventDefault();
  };

  const handleKeyUpAction = (cb: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === ' ') cb();
  };

  const statusText = !trashCleaned
    ? `Langkah 1 dari 2: Ketuk ${SEA_TRASH.length - clearedTrash.length} sampah laut (jaring & botol) agar Bako bisa menanam bakau.`
    : !forestRestored
      ? `Langkah 2 dari 2: Pesisir sudah bersih! Ketuk ${PLANT_SPOTS.length - plantedCount} titik lumpur untuk menanam bibit mangrove.`
      : waveActive
        ? 'Ombak pasang datang! Lihat bagaimana akar tunjang bakau memecah gelombang agar pesisir dan Bako tetap aman.'
        : 'Hutan Bakau Pesisir tumbuh subur bersama Bako! Nyalakan uji gelombang ombak laut untuk melihat fungsi akar tunjangnya.';

  return (
    <section
      id="zona-mangrove"
      className="world-section py-8 sm:py-12 min-h-[calc(100svh-140px)] bg-gradient-to-b from-[#D9EDE9] via-[#E8F3E5] to-[#C8DEA4]"
      aria-labelledby="mangrove-title"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-10 explore-compass-pad">
        {/* Animal Roleplay Header */}
        <div className="field-note px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F0]">
          <div className="flex items-center gap-3">
            <ExplorerAvatarSvg avatar="crab" size={44} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
                Bermain Peran Satwa Penjaga Alam
              </p>
              <p className="font-story text-lg font-bold m-0">
                Kamu berperan sebagai Bako si Kepiting Bakau
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full bg-[#D9EDE9] border border-[#293A30] self-start sm:self-auto">
            Hadiah: Hutan Bakau Pesisir
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40]">
              Zona 4: Pesisir Mangrove &amp; Pelindung Ombak
            </p>
            <h2 id="mangrove-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              Pesisir Hutan Mangrove
            </h2>
          </div>
          <div className="field-note px-5 py-3.5 max-w-md bg-[#FAF8F0]">
            <p id="mangrove-quest-status" className="text-base font-semibold m-0">
              {statusText}
            </p>
          </div>
        </div>

        {/* Interactive Coastal Mangrove Stage */}
        <div
          id="mangrove-stage"
          role="region"
          aria-label="Teluk pesisir bakau bersama Bako si kepiting, sampah laut, bibit mangrove, dan ombak laut"
          className="relative w-full aspect-[800/410] rounded-3xl border-2 border-[#293A30]/25 overflow-hidden bg-[#D9EDE9] shadow-lg select-none"
        >
          {/* Coastal Bay Backdrop */}
          <img
            id="mangrove-bg-img"
            src="/assets/images/zone4-mangrove-bg.png"
            alt="Pesisir teluk air surut tempat menanam bibit hutan mangrove"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* Step 1: Sea Trash Props blocking the mudflat */}
          {SEA_TRASH.map((item) => {
            const isCleared = clearedTrash.includes(item.id);
            return (
              <div
                key={item.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-[15%] min-w-[52px] max-w-[116px] aspect-square transition-all duration-500"
                style={{
                  left: `${item.leftPct}%`,
                  top: `${item.topPct}%`,
                  opacity: isCleared ? 0 : 1,
                  transform: isCleared ? 'translate(-50%, -80%) scale(0.75)' : 'translate(-50%, -50%) scale(1)',
                  pointerEvents: isCleared ? 'none' : 'auto'
                }}
              >
                <button
                  id={item.domId}
                  type="button"
                  disabled={isCleared}
                  tabIndex={isCleared ? -1 : 0}
                  aria-label={item.label}
                  className="w-full h-full bg-transparent border-0 p-1 rounded-2xl hover:scale-105 transition-transform focus-visible:outline-3 focus-visible:outline-[#E9A58E]"
                  onClick={() => handleClearTrash(item)}
                  onKeyDown={handleKeyDownAction(() => handleClearTrash(item))}
                  onKeyUp={handleKeyUpAction(() => handleClearTrash(item))}
                >
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow"
                    draggable={false}
                  />
                </button>
              </div>
            );
          })}

          {/* Step 2: 3 Mudflat Planting Spots -> Seedlings -> Full Mangrove Trees */}
          {PLANT_SPOTS.map((spot, idx) => {
            const isPlanted = plantedSpots.includes(idx);
            const treeVisible = forestRestored;
            return (
              <div
                key={spot.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${spot.leftPct}%`,
                  top: `${spot.topPct}%`
                }}
              >
                {treeVisible ? (
                  <img
                    src="/assets/images/prop-mangrove-tree.png"
                    alt="Pohon mangrove berakar tunjang kokoh"
                    draggable={false}
                    className="w-[96px] sm:w-[148px] md:w-[172px] h-auto -translate-y-[34%] object-contain pointer-events-none select-none transition-all duration-700"
                  />
                ) : isPlanted ? (
                  <img
                    src="/assets/images/prop-mangrove-seedling.png"
                    alt="Bibit bakau muda tertanam di lumpur"
                    draggable={false}
                    className="w-[46px] sm:w-[68px] h-auto -translate-y-[30%] object-contain pointer-events-none select-none"
                  />
                ) : trashCleaned ? (
                  <button
                    id={spot.id}
                    type="button"
                    aria-label={spot.label}
                    className="min-w-[52px] min-h-[52px] sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-[#293A30] bg-[#FAF8F0]/85 hover:bg-[#F5D77D] flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    onClick={() => handlePlantSpot(idx)}
                    onKeyDown={handleKeyDownAction(() => handlePlantSpot(idx))}
                    onKeyUp={handleKeyUpAction(() => handlePlantSpot(idx))}
                  >
                    <span className="text-xs font-extrabold text-[#293A30]">+ Tanam</span>
                  </button>
                ) : null}
              </div>
            );
          })}

          {/* Coastal Tidal Wave Overlay (Sandbox Test) */}
          <svg
            id="mangrove-wave-layer"
            viewBox="0 0 800 410"
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700"
            style={{ opacity: waveActive ? 0.92 : 0 }}
            aria-hidden="true"
          >
            <g fill="none" stroke="#FAF8F0" strokeWidth="4" strokeLinecap="round">
              <path className="river-ripple" strokeDasharray="16 10" d="M510 250 Q580 232 650 250 T790 245" />
              <path className="river-ripple" strokeDasharray="18 12" d="M490 285 Q570 264 660 286 T795 278" />
              <path className="river-ripple" strokeDasharray="14 10" d="M500 322 Q585 304 670 324 T795 318" />
            </g>
            {/* Soft shield glow near prop roots illustrating wave absorption */}
            <ellipse cx="475" cy="292" rx="18" ry="62" fill="rgba(217, 237, 233, 0.45)" />
          </svg>

          {/* Bako the Mangrove Crab Companion */}
          <img
            id="mangrove-crab-actor"
            src="/assets/images/prop-crab-bako.png"
            alt="Bako si kepiting bakau menjaga akar mangrove"
            draggable={false}
            className="absolute left-[14%] bottom-[8%] w-[12%] min-w-[54px] max-w-[104px] h-auto object-contain pointer-events-none transition-transform duration-700"
            style={{
              transform: forestRestored ? 'translateX(36px) scale(1.06)' : 'translateX(0px)'
            }}
          />
        </div>

        {/* Unlocked Sandbox: Uji Ombak Pasang */}
        {forestRestored && (
          <div id="mangrove-sandbox-panel" className="field-note p-5 sm:p-6 mt-6 text-[#293A30] space-y-4 route-stage-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-story text-xl font-bold m-0">Uji Ombak Pasang Laut</h3>
                <p id="mangrove-sandbox-status" className="text-base mt-1 mb-0">
                  {waveActive
                    ? 'Gelombang ombak diredam akar tunjang mangrove! Pantai di belakang bakau tetap teduh dan aman.'
                    : 'Tekan tombol di samping untuk menguji kekuatan akar tunjang mangrove menahan gelombang pasang.'}
                </p>
              </div>
              <button
                id="mangrove-wave-toggle"
                type="button"
                aria-pressed={waveActive}
                className={`touch-btn ${waveActive ? 'btn-forest' : 'btn-primary'} px-5 py-3 shrink-0`}
                onClick={() => {
                  audioManager.playSfx('click');
                  updateSandbox({ waveActive: !state.sandbox.waveActive });
                }}
              >
                {waveActive ? 'Tenangkan Ombak Pasang' : 'Uji Gelombang Ombak Laut'}
              </button>
            </div>

            <div className="pt-3 border-t border-[#293A30]/15 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#477A59] m-0">
                Hadiah terbuka: Hutan Bakau Pesisir kini menjaga pantai di Taman Hadiah!
              </p>
              <button
                type="button"
                className="touch-btn btn-primary px-5 py-2.5 text-sm"
                onClick={() => setExploreStage('sanctuary')}
              >
                Kunjungi Taman Hadiah →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
