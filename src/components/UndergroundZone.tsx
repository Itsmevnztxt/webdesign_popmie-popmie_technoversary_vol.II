import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

const CLUMPS = [
  {
    id: 'soil-clump-1',
    label: 'Gumpalan tanah keras pertama. Ketuk untuk menggemburkan',
    image: '/assets/images/prop-soil-clump-1.png',
    leftPct: 43,
    topPct: 62
  },
  {
    id: 'soil-clump-2',
    label: 'Gumpalan tanah keras kedua. Ketuk untuk menggemburkan',
    image: '/assets/images/prop-soil-clump-2.png',
    leftPct: 54,
    topPct: 61
  },
  {
    id: 'soil-clump-3',
    label: 'Gumpalan tanah keras ketiga. Ketuk untuk menggemburkan',
    image: '/assets/images/prop-soil-clump-3.png',
    leftPct: 48.5,
    topPct: 70
  }
];

function getXrayReadout(y: number, active: boolean): string {
  if (!active) {
    return 'Aktifkan kaca pembesar lalu seret lingkarannya melewati batang dan akar pohon oak.';
  }
  if (y < 160) {
    return 'Bagian Daun & Cabang: air dan mineral tiba di daun untuk dimasak bersama sinar matahari.';
  }
  if (y < 235) {
    return 'Bagian Batang Pohon: pipa kecil di dalam batang mengalirkan air naik ke seluruh dahan.';
  }
  return 'Jaringan Akar Bawah Tanah: rambut akar menyerap air dan mineral dari tanah gembur!';
}

export function UndergroundZone() {
  const { state, resetCounter, unlockBadge, updateSandbox, announce, setExploreStage } = useRimba();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingLensRef = useRef(false);
  const lensGrabOffsetRef = useRef<{ ox: number; oy: number }>({ ox: 0, oy: 0 });
  const suppressStageClickRef = useRef(false);

  const [brokenClumps, setBrokenClumps] = useState<number[]>(() =>
    state.badges.underground ? [0, 1, 2] : []
  );
  const [wormSummoned, setWormSummoned] = useState<boolean>(() => Boolean(state.badges.underground));
  const [seedWatered, setSeedWatered] = useState<boolean>(() => Boolean(state.badges.underground));
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 400, y: 272 });
  const [isDraggingLens, setIsDraggingLens] = useState(false);
  const [stageWidth, setStageWidth] = useState(800);

  useEffect(() => {
    if (state.badges.underground) {
      setBrokenClumps([0, 1, 2]);
      setWormSummoned(true);
      setSeedWatered(true);
    } else {
      setBrokenClumps([]);
      setWormSummoned(false);
      setSeedWatered(false);
      setLensPos({ x: 400, y: 272 });
    }
    draggingLensRef.current = false;
    setIsDraggingLens(false);
  }, [state.badges.underground, resetCounter]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setStageWidth(w);
    };

    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minLensX = stageWidth < 780 ? 96 : 75;
  const maxLensX = 800 - minLensX;
  const minLensY = stageWidth < 780 ? 96 : 75;
  const maxLensY = stageWidth < 780 ? 310 : 335;

  const clientToStage = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return { x: 400, y: 272 };
      const rect = stage.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 410;
      return {
        x: Math.max(minLensX, Math.min(maxLensX, ((clientX - rect.left) / width) * 800)),
        y: Math.max(minLensY, Math.min(maxLensY, ((clientY - rect.top) / height) * 410))
      };
    },
    [maxLensX, maxLensY, minLensX, minLensY]
  );

  const breakClump = useCallback(
    (index: number) => {
      if (brokenClumps.includes(index)) return;
      audioManager.playSfx('soil');
      setBrokenClumps((prev) => (prev.includes(index) ? prev : [...prev, index]));
      announce(`Gumpalan tanah ${index + 1} berhasil digemburkan.`);
    },
    [announce, brokenClumps]
  );

  const handleClumpKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') breakClump(index);
    if (e.key === ' ') e.preventDefault();
  };

  const handleClumpKeyUp = (index: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ') breakClump(index);
  };

  const soilLoose = brokenClumps.length === CLUMPS.length;
  const xrayOn = seedWatered && state.sandbox.xrayActive;

  const handleSummonWorm = () => {
    if (!soilLoose || wormSummoned) return;
    audioManager.playSfx('soil');
    setWormSummoned(true);
    announce('Cacing tanah membuat lorong udara di dalam tanah.');
  };

  const handleWaterSeed = () => {
    if (!wormSummoned || seedWatered) return;
    audioManager.playSfx('water');
    setSeedWatered(true);
    updateSandbox({ xrayActive: true });
    unlockBadge('underground');
  };

  const handleLensPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!xrayOn) return;
    e.preventDefault();
    draggingLensRef.current = true;
    setIsDraggingLens(true);
    suppressStageClickRef.current = false;
    const pt = clientToStage(e.clientX, e.clientY);
    lensGrabOffsetRef.current = { ox: pt.x - lensPos.x, oy: pt.y - lensPos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleLensPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingLensRef.current) return;
    suppressStageClickRef.current = true;
    const pt = clientToStage(e.clientX, e.clientY);
    const nextX = Math.max(minLensX, Math.min(maxLensX, pt.x - lensGrabOffsetRef.current.ox));
    const nextY = Math.max(minLensY, Math.min(maxLensY, pt.y - lensGrabOffsetRef.current.oy));
    setLensPos({ x: nextX, y: nextY });
  };

  const handleLensPointerEnd = () => {
    draggingLensRef.current = false;
    setIsDraggingLens(false);
    if (suppressStageClickRef.current) {
      window.setTimeout(() => {
        suppressStageClickRef.current = false;
      }, 60);
    }
  };

  const handleLensKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!xrayOn) return;
    const step = 24;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, x: Math.max(75, p.x - step) }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, x: Math.min(725, p.x + step) }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, y: Math.max(75, p.y - step) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, y: Math.min(335, p.y + step) }));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, y: 75 }));
    } else if (e.key === 'End') {
      e.preventDefault();
      setLensPos((p) => ({ ...p, y: 335 }));
    }
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!xrayOn) return;
    if (e.detail === 0) return;
    if (suppressStageClickRef.current) {
      suppressStageClickRef.current = false;
      return;
    }
    const target = e.target as Element | null;
    if (target?.closest('.soil-clump')) return;
    setLensPos(clientToStage(e.clientX, e.clientY));
  };

  const stepStatusText = seedWatered
    ? 'Pohon oak tumbuh dengan akar bercabang! Nyalakan dan geser Kaca Pembesar Akar untuk mengintip ke dalam.'
    : !soilLoose
      ? `Langkah 1 dari 3: Ketuk ${CLUMPS.length - brokenClumps.length} gumpalan tanah keras di sekitar biji oak.`
      : !wormSummoned
        ? 'Langkah 2 dari 3: Tanah sudah gembur! Sekarang tekan tombol Panggil Cacing Tanah.'
        : 'Langkah 3 dari 3: Lorong udara sudah terbuka! Tekan tombol Siram Biji Oak untuk menumbuhkan pohon.';

  const readoutText = getXrayReadout(lensPos.y, xrayOn);
  const pctX = (lensPos.x / 800) * 100;
  const pctY = (lensPos.y / 410) * 100;
  const lensRadiusPx = stageWidth >= 780 ? 95 : Math.max(34, Math.round((stageWidth / 800) * 95));
  const lensSmoothTransition = isDraggingLens
    ? 'none'
    : 'left 480ms cubic-bezier(0.22, 1, 0.36, 1), top 480ms cubic-bezier(0.22, 1, 0.36, 1)';
  const xrayClipPath = xrayOn
    ? `circle(${lensRadiusPx}px at ${pctX}% ${pctY}%)`
    : seedWatered
      ? `circle(0px at ${pctX}% ${pctY}%)`
      : 'circle(0px at 50% 50%)';

  return (
    <section
      id="zona-bawah-tanah"
      className="world-section zone-underground py-8 sm:py-12 min-h-[calc(100svh-140px)]"
      aria-labelledby="ug-title"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-10 explore-compass-pad">
        {/* Animal Roleplay Header */}
        <div className="field-note px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#293A30]">
          <div className="flex items-center gap-3">
            <ExplorerAvatarSvg avatar="worm" size={44} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] m-0">
                Bermain Peran Satwa Penjaga Alam
              </p>
              <p className="font-story text-lg font-bold m-0">
                Kamu berperan sebagai Cici si Cacing &amp; Tunas Oak
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full bg-[#C8DEA4] border border-[#293A30] self-start sm:self-auto">
            Hadiah: Pohon Oak Rimba
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#F5D77D]">
              Zona 3: Akar, Tanah &amp; Pertumbuhan
            </p>
            <h2 id="ug-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              Dunia Bawah Tanah
            </h2>
          </div>
          <div className="field-note px-5 py-3.5 max-w-md text-[#293A30]">
            <p id="ug-quest-status" className="text-base font-semibold m-0">
              {stepStatusText}
            </p>
          </div>
        </div>

        {/* Full-Scene Interactive Stage */}
        <div
          ref={stageRef}
          id="underground-svg"
          role="region"
          aria-label="Penampang tanah bawah tanah dengan pohon oak, jaringan akar, Cici si cacing tanah, dan kaca pembesar akar"
          className="relative w-full aspect-[800/410] rounded-3xl border-2 border-[#FAF8F0]/25 overflow-hidden bg-[#463529] shadow-lg select-none"
          onClick={handleStageClick}
        >
          {/* Base Layer: Full Normal Oak Tree & Underground Roots Scene */}
          <img
            src="/assets/images/zone3-scene-normal.png"
            alt="Pemandangan pohon oak rimbun di atas padang rumput dan jaringan akar bercabang di dalam tanah"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />

          {/* X-Ray Overlay Layer: Clipped precisely to the Magnifying Lens Circle */}
          <img
            id="ug-xray-layer"
            src="/assets/images/zone3-scene-xray.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
            style={{
              clipPath: xrayClipPath,
              WebkitClipPath: xrayClipPath,
              transition: isDraggingLens ? 'none' : 'clip-path 480ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />

          {/* Pre-Sprout Veil (Uses zone3-scene-early.png until seed is watered, then fades out smoothly) */}
          <div
            aria-hidden={seedWatered}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: seedWatered ? 0 : 1,
              pointerEvents: seedWatered ? 'none' : 'auto'
            }}
          >
            <img
              id="ug-early-scene"
              src="/assets/images/zone3-scene-early.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />

            {/* Dormant Seed buried in the center */}
            <img
              id="ug-dormant-seed"
              src="/assets/images/prop-oak-seed-dormant.png"
              alt="Biji pohon oak yang sedang tertidur di dalam tanah"
              className="absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 w-[9%] max-w-[74px] h-auto object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* 3 Compacted Soil Clumps */}
            {CLUMPS.map((clump, idx) => {
              const isBroken = brokenClumps.includes(idx);
              return (
                <div
                  key={clump.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-[14%] min-w-[48px] max-w-[96px] aspect-square"
                  style={{
                    left: `${clump.leftPct}%`,
                    top: `${clump.topPct}%`
                  }}
                >
                  <button
                    id={clump.id}
                    type="button"
                    disabled={isBroken}
                    tabIndex={isBroken ? -1 : 0}
                    aria-disabled={isBroken ? 'true' : undefined}
                    aria-label={clump.label}
                    className={`soil-clump w-full h-full bg-transparent border-0 p-0 block${
                      isBroken ? ' is-broken' : ''
                    }`}
                    onClick={() => breakClump(idx)}
                    onKeyDown={handleClumpKeyDown(idx)}
                    onKeyUp={handleClumpKeyUp(idx)}
                  >
                    <img
                      src={clump.image}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Water Pour Effect (appears cleanly at surface when watering seed) */}
          <img
            id="ug-water-pour"
            src="/assets/images/ug-water-pour.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute left-1/2 top-[43%] -translate-x-1/2 w-[8.5%] max-w-[68px] h-auto object-contain pointer-events-none transition-opacity duration-500"
            style={{ opacity: seedWatered ? 0.85 : 0 }}
          />

          {/* Aeration Tunnels & Earthworm Cici (left soil area, stays visible once summoned) */}
          <img
            id="ug-tunnels"
            src="/assets/images/ug-aeration-tunnels.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute left-[4%] top-[59%] w-[24%] max-w-[195px] h-auto object-contain pointer-events-none transition-opacity duration-500"
            style={{ opacity: wormSummoned ? (seedWatered ? 0.72 : 0.94) : 0 }}
          />
          <img
            id="ug-earthworm"
            src="/assets/images/prop-earthworm.png"
            alt="Cici si cacing tanah menggali lorong udara"
            draggable={false}
            className="absolute left-[11%] top-[66%] w-[11%] max-w-[90px] h-auto object-contain pointer-events-none"
            style={{
              opacity: wormSummoned ? 1 : 0,
              transform: wormSummoned ? 'translateX(0px)' : 'translateX(-48px)',
              transition: 'opacity 400ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          />

          {/* Draggable Magnifying Lens Frame (clean vector lens centered concentrically over clip-path circle) */}
          {xrayOn && (
            <svg
              id="xray-lens-visual"
              viewBox="0 0 200 200"
              aria-hidden="true"
              className="absolute pointer-events-none select-none overflow-visible"
              style={{
                width: `${lensRadiusPx * 2}px`,
                height: `${lensRadiusPx * 2}px`,
                left: `${pctX}%`,
                top: `${pctY}%`,
                transform: 'translate(-50%, -50%)',
                transition: lensSmoothTransition
              }}
            >
              {/* Soft dark-cool glass tint matching earlier X-ray lens contrast */}
              <circle
                cx="100"
                cy="100"
                r="98"
                fill="rgba(32, 46, 40, 0.22)"
                stroke="rgba(41, 58, 48, 0.25)"
                strokeWidth="3"
              />
              {/* Glossy upper-left glass highlight arc */}
              <path
                d="M 38 78 A 66 66 0 0 1 82 36"
                fill="none"
                stroke="rgba(255, 255, 255, 0.78)"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <circle cx="32" cy="92" r="3.2" fill="rgba(255, 255, 255, 0.72)" />

              {/* Handle at 45deg bottom-right */}
              <g transform="rotate(45 100 100)">
                <rect
                  x="198"
                  y="93"
                  width="14"
                  height="14"
                  rx="4"
                  fill="#F5D77D"
                  stroke="#293A30"
                  strokeWidth="3.5"
                />
                <rect
                  x="210"
                  y="90"
                  width="62"
                  height="20"
                  rx="10"
                  fill="#E9A58E"
                  stroke="#293A30"
                  strokeWidth="3.5"
                />
                <line
                  x1="222"
                  y1="96"
                  x2="260"
                  y2="96"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              {/* Golden magnifying ring with crisp dark forest outline */}
              <circle cx="100" cy="100" r="100" fill="none" stroke="#293A30" strokeWidth="14" />
              <circle cx="100" cy="100" r="100" fill="none" stroke="#F5D77D" strokeWidth="8.5" />
            </svg>
          )}

          {/* Accessible Drag & Keyboard Lens Hit Handle */}
          {xrayOn && (
            <div
              id="xray-lens-handle"
              className="xray-lens-handle absolute rounded-full"
              style={{
                width: `${lensRadiusPx * 2}px`,
                height: `${lensRadiusPx * 2}px`,
                left: `${pctX}%`,
                top: `${pctY}%`,
                transform: 'translate(-50%, -50%)',
                transition: lensSmoothTransition
              }}
              role="slider"
              tabIndex={0}
              aria-valuemin={75}
              aria-valuemax={335}
              aria-valuenow={Math.round(lensPos.y)}
              aria-valuetext={readoutText}
              aria-label="Kaca Pembesar Akar. Seret atau gunakan tombol panah keyboard untuk memeriksa batang dan akar pohon"
              onPointerDown={handleLensPointerDown}
              onPointerMove={handleLensPointerMove}
              onPointerUp={handleLensPointerEnd}
              onPointerCancel={handleLensPointerEnd}
              onKeyDown={handleLensKeyDown}
            />
          )}
        </div>

        {/* Quest Controls (Worm + Water) */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            id="ug-worm-btn"
            type="button"
            className="touch-btn btn-paper px-5 py-3"
            disabled={!soilLoose || wormSummoned}
            aria-disabled={!soilLoose || wormSummoned ? 'true' : 'false'}
            onClick={handleSummonWorm}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 15q4-6 9 0t9 0" fill="none" stroke="#E9A58E" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span>Panggil Cacing Tanah</span>
          </button>

          <button
            id="ug-water-btn"
            type="button"
            className="touch-btn btn-paper px-5 py-3"
            disabled={!wormSummoned || seedWatered}
            aria-disabled={!wormSummoned || seedWatered ? 'true' : 'false'}
            onClick={handleWaterSeed}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 4C9 8.5 7 11.5 7 14.5a5 5 0 0 0 10 0C17 11.5 15 8.5 12 4z"
                fill="#D9EDE9"
                stroke="#293A30"
                strokeWidth="1.8"
              />
            </svg>
            <span>Siram Biji Oak</span>
          </button>
        </div>

        {/* Unlocked Sandbox: X-Ray Nature Lens */}
        {seedWatered && (
          <div id="ug-sandbox-panel" className="field-note p-5 sm:p-6 mt-6 text-[#293A30] space-y-4 route-stage-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-story text-xl font-bold m-0">Kaca Pembesar Akar</h3>
                <p id="ug-xray-readout" className="text-base mt-1 mb-0">
                  {readoutText}
                </p>
              </div>
              <button
                id="ug-xray-toggle"
                type="button"
                aria-pressed={xrayOn}
                className={`touch-btn ${xrayOn ? 'btn-forest' : 'btn-primary'} px-5 py-3 shrink-0`}
                onClick={() => {
                  audioManager.playSfx('click');
                  updateSandbox({ xrayActive: !state.sandbox.xrayActive });
                }}
              >
                {xrayOn ? 'Tutup Kaca Pembesar Akar' : 'Nyalakan Kaca Pembesar Akar'}
              </button>
            </div>

            <div className="pt-3 border-t border-[#293A30]/15 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#477A59] m-0">
                Hadiah terbuka: Pohon Oak Rimba kini berdiri kokoh di Taman Hadiah!
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
