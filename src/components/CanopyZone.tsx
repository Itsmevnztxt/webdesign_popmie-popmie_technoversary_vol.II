import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SunTime, useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

interface SunModeConfig {
  sunX: number;
  sunY: number;
  sunColor: string;
  flowerAngle: number;
  butterflies: number;
  note: string;
  label: string;
}

const SUN_MODES: Record<SunTime, SunModeConfig> = {
  pagi: {
    sunX: -240,
    sunY: 56,
    sunColor: '#F5D77D',
    flowerAngle: -14,
    butterflies: 1,
    note: 'Pagi hari: cahaya masih lembut, bunga matahari menoleh ke timur menyambut matahari terbit.',
    label: 'Pagi'
  },
  siang: {
    sunX: 0,
    sunY: 0,
    sunColor: '#F5D77D',
    flowerAngle: 0,
    butterflies: 3,
    note: 'Siang terik: sinar matahari paling terang! Lebah dan kupu-kupu ramai mengunjungi kelopak bunga.',
    label: 'Siang Terik'
  },
  senja: {
    sunX: 245,
    sunY: 66,
    sunColor: '#E9A58E',
    flowerAngle: 15,
    butterflies: 2,
    note: 'Senja tiba: langit hangat keemasan dan bunga perlahan menunduk ke barat untuk beristirahat.',
    label: 'Senja'
  }
};

const SUN_CHOICES: SunTime[] = ['pagi', 'siang', 'senja'];

export function CanopyZone() {
  const { state, resetCounter, unlockBadge, updateSandbox, announce, setExploreStage } = useRimba();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [clearedClouds, setClearedClouds] = useState<number[]>(() =>
    state.badges.canopy ? [0, 1] : []
  );
  const [beePollinated, setBeePollinated] = useState<boolean>(() =>
    Boolean(state.badges.canopy)
  );
  const [beeWarning, setBeeWarning] = useState(false);

  const [cloudDragOffsets, setCloudDragOffsets] = useState<Record<number, { dx: number; dy: number } | null>>({});
  const [beeDragOffset, setBeeDragOffset] = useState<{ dx: number; dy: number } | null>(null);

  const cloudDragStateRef = useRef<Record<number, { startX: number; startY: number; dx: number; dy: number } | null>>({});
  const cloudSuppressClickRef = useRef<Record<number, boolean>>({});
  const beeDragStateRef = useRef<{ startX: number; startY: number; dx: number; dy: number } | null>(null);
  const beeSuppressClickRef = useRef(false);

  useEffect(() => {
    if (state.badges.canopy) {
      setClearedClouds([0, 1]);
      setBeePollinated(true);
    } else {
      setClearedClouds([]);
      setBeePollinated(false);
    }
    setCloudDragOffsets({});
    setBeeDragOffset(null);
    setBeeWarning(false);
    cloudDragStateRef.current = {};
    beeDragStateRef.current = null;
  }, [state.badges.canopy, resetCounter]);

  const clientToSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 410;
    return {
      x: ((clientX - rect.left) / width) * 800,
      y: ((clientY - rect.top) / height) * 410
    };
  }, []);

  const clearCloud = useCallback(
    (index: number) => {
      if (clearedClouds.includes(index)) return;
      audioManager.playSfx('cloud');
      setBeeWarning(false);
      setClearedClouds((prev) => (prev.includes(index) ? prev : [...prev, index]));
      announce(`Lulu menyingkirkan awan kelabu ${index + 1}.`);
    },
    [announce, clearedClouds]
  );

  const cloudsClearedCount = clearedClouds.length;
  const cloudsLeft = 2 - cloudsClearedCount;

  const pollinateFlower = useCallback(() => {
    if (cloudsClearedCount < 2) {
      audioManager.playSfx('sort-err');
      setBeeWarning(true);
      announce('Singkirkan kedua awan kelabu dulu supaya matahari bersinar.');
      return;
    }
    if (beePollinated) return;
    audioManager.playSfx('pollinate');
    setBeeWarning(false);
    setBeePollinated(true);
    unlockBadge('canopy');
  }, [announce, beePollinated, cloudsClearedCount, unlockBadge]);

  const handleCloudPointerDown = (index: number) => (e: React.PointerEvent<SVGGElement>) => {
    if (clearedClouds.includes(index)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    cloudDragStateRef.current[index] = { startX: pt.x, startY: pt.y, dx: 0, dy: 0 };
    setCloudDragOffsets((prev) => ({ ...prev, [index]: { dx: 0, dy: 0 } }));
  };

  const handleCloudPointerMove = (index: number) => (e: React.PointerEvent<SVGGElement>) => {
    const drag = cloudDragStateRef.current[index];
    if (!drag) return;
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    drag.dx = pt.x - drag.startX;
    drag.dy = pt.y - drag.startY;
    setCloudDragOffsets((prev) => ({ ...prev, [index]: { dx: drag.dx, dy: drag.dy } }));
  };

  const handleCloudPointerEnd = (index: number) => () => {
    const drag = cloudDragStateRef.current[index];
    if (!drag) return;
    const dist = Math.hypot(drag.dx, drag.dy);
    cloudDragStateRef.current[index] = null;
    setCloudDragOffsets((prev) => ({ ...prev, [index]: null }));

    if (dist < 10) return;

    cloudSuppressClickRef.current[index] = true;
    window.setTimeout(() => {
      cloudSuppressClickRef.current[index] = false;
    }, 60);

    if (dist >= 55) {
      clearCloud(index);
    }
  };

  const handleCloudPointerCancel = (index: number) => () => {
    cloudDragStateRef.current[index] = null;
    setCloudDragOffsets((prev) => ({ ...prev, [index]: null }));
  };

  const handleCloudClick = (index: number) => () => {
    if (cloudSuppressClickRef.current[index]) {
      cloudSuppressClickRef.current[index] = false;
      return;
    }
    clearCloud(index);
  };

  const handleCloudKeyDown = (index: number) => (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter') clearCloud(index);
    if (e.key === ' ') e.preventDefault();
  };

  const handleCloudKeyUp = (index: number) => (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === ' ') clearCloud(index);
  };

  const handleBeePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (cloudsClearedCount < 2 || beePollinated) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    beeDragStateRef.current = { startX: pt.x, startY: pt.y, dx: 0, dy: 0 };
    setBeeDragOffset({ dx: 0, dy: 0 });
  };

  const handleBeePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = beeDragStateRef.current;
    if (!drag) return;
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    drag.dx = pt.x - drag.startX;
    drag.dy = pt.y - drag.startY;
    setBeeDragOffset({ dx: drag.dx, dy: drag.dy });
  };

  const handleBeePointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const drag = beeDragStateRef.current;
    if (!drag) return;
    const distDragged = Math.hypot(drag.dx, drag.dy);
    const pt = clientToSvgPoint(e.clientX, e.clientY);
    const distToFlower = Math.hypot(pt.x - 390, pt.y - 210);
    beeDragStateRef.current = null;
    setBeeDragOffset(null);

    if (distDragged < 10) return;

    beeSuppressClickRef.current = true;
    window.setTimeout(() => {
      beeSuppressClickRef.current = false;
    }, 60);

    if (distToFlower < 110) {
      pollinateFlower();
    }
  };

  const handleBeePointerCancel = () => {
    beeDragStateRef.current = null;
    setBeeDragOffset(null);
  };

  const handleBeeClick = () => {
    if (beeSuppressClickRef.current) {
      beeSuppressClickRef.current = false;
      return;
    }
    pollinateFlower();
  };

  const handleBeeKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter') pollinateFlower();
    if (e.key === ' ') e.preventDefault();
  };

  const handleBeeKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === ' ') pollinateFlower();
  };

  const activeSunTime = state.sandbox.sunTime;
  const sunMode = SUN_MODES[activeSunTime] || SUN_MODES.siang;
  const targetSunX = beePollinated ? sunMode.sunX : 0;
  const targetSunY = beePollinated ? sunMode.sunY : 0;

  const [animSunPos, setAnimSunPos] = useState<{ x: number; y: number }>(() => ({
    x: targetSunX,
    y: targetSunY
  }));
  const animSunPosRef = useRef(animSunPos);
  animSunPosRef.current = animSunPos;

  useEffect(() => {
    const startX = animSunPosRef.current.x;
    const startY = animSunPosRef.current.y;
    if (startX === targetSunX && startY === targetSunY) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof window.requestAnimationFrame !== 'function') {
      setAnimSunPos({ x: targetSunX, y: targetSunY });
      return;
    }

    let rafId = 0;
    let startTime: number | null = null;
    const durationMs = 1050;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      setAnimSunPos({
        x: startX + (targetSunX - startX) * eased,
        y: startY + (targetSunY - startY) * eased
      });

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [targetSunX, targetSunY]);

  const sunCenterX = 390 + animSunPos.x;
  const sunCenterY = 74 + animSunPos.y;
  const rayDx = 390 - sunCenterX;
  const rayDy = 388 - sunCenterY;
  const rayLen = Math.hypot(rayDx, rayDy) || 1;
  const perpX = -rayDy / rayLen;
  const perpY = rayDx / rayLen;

  const innerTopL = `${(sunCenterX + perpX * 28).toFixed(1)},${(sunCenterY + perpY * 28).toFixed(1)}`;
  const innerTopR = `${(sunCenterX - perpX * 28).toFixed(1)},${(sunCenterY - perpY * 28).toFixed(1)}`;
  const outerTopL = `${(sunCenterX + perpX * 44).toFixed(1)},${(sunCenterY + perpY * 44).toFixed(1)}`;
  const outerTopR = `${(sunCenterX - perpX * 44).toFixed(1)},${(sunCenterY - perpY * 44).toFixed(1)}`;

  const beamPoints = `${innerTopL} ${innerTopR} 488,388 292,388`;
  const outerBeamPoints = `${outerTopL} ${outerTopR} 532,396 248,396`;
  const beamTopColor = beePollinated && activeSunTime === 'senja' ? '#E9A58E' : '#F5D77D';

  const questStatusText = beePollinated
    ? 'Padang bunga mekar cerah! Putar waktu matahari untuk melihat perubahan bunga dan kupu-kupu.'
    : cloudsLeft > 0
      ? beeWarning
        ? `Eits! Singkirkan dulu ${cloudsLeft} awan kelabu agar matahari bersinar sebelum Lulu terbang ke bunga.`
        : `Langkah 1 dari 2: Geser atau klik ${cloudsLeft} awan kelabu supaya matahari bersinar.`
      : 'Langkah 2 dari 2: Seret atau klik Lulu si Lebah menuju tengah bunga matahari.';

  const sunflowerTransform = beePollinated
    ? `rotate(${sunMode.flowerAngle}deg) scale(1.04)`
    : cloudsLeft === 0
      ? 'rotate(4deg) scale(0.95)'
      : 'rotate(14deg) scale(0.88)';

  const beeTransform = beeDragOffset
    ? `translate(${beeDragOffset.dx}px, ${beeDragOffset.dy}px)`
    : beePollinated
      ? 'translate(-158px, -18px)'
      : undefined;

  const cloud1Cleared = clearedClouds.includes(0);
  const cloud2Cleared = clearedClouds.includes(1);

  const cloud1Transform = cloud1Cleared
    ? 'translate(-160px, -30px) scale(0.85)'
    : cloudDragOffsets[0]
      ? `translate(${cloudDragOffsets[0].dx}px, ${cloudDragOffsets[0].dy}px)`
      : undefined;

  const cloud2Transform = cloud2Cleared
    ? 'translate(160px, -30px) scale(0.85)'
    : cloudDragOffsets[1]
      ? `translate(${cloudDragOffsets[1].dx}px, ${cloudDragOffsets[1].dy}px)`
      : undefined;

  return (
    <section
      id="zona-kanopi"
      className="world-section zone-canopy py-8 sm:py-12 min-h-[calc(100svh-140px)]"
      aria-labelledby="canopy-title"
      data-sun-time={beePollinated ? activeSunTime : undefined}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-10 explore-compass-pad">
        {/* Animal Roleplay Header */}
        <div className="field-note-mint px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ExplorerAvatarSvg avatar="bee" size={44} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
                Bermain Peran Satwa Penjaga Alam
              </p>
              <p className="font-story text-lg font-bold m-0">
                Kamu berperan sebagai Lulu si Lebah Penyerbuk
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full bg-[#F5D77D] border border-[#293A30] self-start sm:self-auto">
            Hadiah: Bibit Bunga Matahari
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40]">
              Zona 1: Kanopi Hutan &amp; Penyerbukan
            </p>
            <h2 id="canopy-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              Kanopi &amp; Padang Bunga
            </h2>
          </div>
          <div
            className="field-note px-5 py-3.5 max-w-md"
            style={{ borderColor: beeWarning && cloudsLeft > 0 ? '#E9A58E' : 'rgba(41, 58, 48, 0.2)' }}
          >
            <p id="canopy-quest-status" className="text-base font-semibold m-0">
              {questStatusText}
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <svg
            ref={svgRef}
            id="canopy-svg"
            viewBox="0 0 800 410"
            className="w-full h-auto block select-none rounded-3xl border-2 border-[#293A30]/20 bg-[#FAF8F0]/45 shadow-sm"
            role="img"
            aria-label="Ilustrasi interaktif padang bunga matahari, awan kelabu, matahari, dan Lulu si lebah kecil"
          >
            <defs>
              <linearGradient
                id="sunbeam-grad"
                x1={sunCenterX / 800}
                y1={sunCenterY / 410}
                x2={390 / 800}
                y2="0.96"
              >
                <stop
                  offset="0%"
                  stopColor={beamTopColor}
                  stopOpacity="0.58"
                  style={{ transition: 'stop-color 950ms ease' }}
                />
                <stop
                  offset="55%"
                  stopColor={beamTopColor}
                  stopOpacity="0.26"
                  style={{ transition: 'stop-color 950ms ease' }}
                />
                <stop
                  offset="100%"
                  stopColor={beamTopColor}
                  stopOpacity="0"
                  style={{ transition: 'stop-color 950ms ease' }}
                />
              </linearGradient>
              <linearGradient
                id="sunbeam-outer-grad"
                x1={sunCenterX / 800}
                y1={sunCenterY / 410}
                x2={390 / 800}
                y2="0.96"
              >
                <stop
                  offset="0%"
                  stopColor={beamTopColor}
                  stopOpacity="0.34"
                  style={{ transition: 'stop-color 950ms ease' }}
                />
                <stop
                  offset="65%"
                  stopColor={beamTopColor}
                  stopOpacity="0.12"
                  style={{ transition: 'stop-color 950ms ease' }}
                />
                <stop offset="100%" stopColor={beamTopColor} stopOpacity="0" />
              </linearGradient>
              <radialGradient id="sun-halo-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={beamTopColor} stopOpacity="0.5" />
                <stop offset="65%" stopColor={beamTopColor} stopOpacity="0.16" />
                <stop offset="100%" stopColor={beamTopColor} stopOpacity="0" />
              </radialGradient>
              <filter id="sunbeam-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>

            {/* Layered Gouache Meadow Background */}
            <image
              href="/assets/images/zone1-meadow-bg.png"
              x="0"
              y="0"
              width="800"
              height="410"
              preserveAspectRatio="xMidYMax slice"
            />

            {/* Soft Outer & Inner Sunbeams smoothly tracking the sun */}
            <g
              style={{
                opacity: cloudsLeft === 0 ? 1 : 0.12,
                transition: 'opacity 800ms ease'
              }}
            >
              <polygon
                points={outerBeamPoints}
                fill="url(#sunbeam-outer-grad)"
                filter="url(#sunbeam-soft)"
              />
              <polygon
                id="canopy-sunbeams"
                points={beamPoints}
                fill="url(#sunbeam-grad)"
              />
            </g>

            {/* Sun */}
            <g
              id="canopy-sun-group"
              style={{
                transform: `translate(${animSunPos.x}px, ${animSunPos.y}px)`
              }}
            >
              <circle cx="390" cy="74" r="68" fill="url(#sun-halo-grad)" aria-hidden="true" />
              <image
                id="canopy-sun-core"
                href={
                  beePollinated && activeSunTime === 'senja'
                    ? '/assets/images/canopy-sun-senja.png'
                    : '/assets/images/canopy-sun-day.png'
                }
                x="342"
                y="26"
                width="96"
                height="96"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            {/* Pollen sparkles */}
            <g
              id="canopy-pollen-sparkles"
              style={{ opacity: beePollinated ? 1 : 0, transition: 'opacity 750ms ease' }}
              aria-hidden="true"
            >
              <circle cx="330" cy="180" r="4" fill="#F5D77D" />
              <circle cx="452" cy="172" r="5" fill="#F5D77D" />
              <circle cx="355" cy="148" r="3.5" fill="#E9A58E" />
              <circle cx="426" cy="142" r="4" fill="#F5D77D" />
            </g>

            {/* Sunflower Stem & Connected Head */}
            <g
              id="sunflower-stem"
              style={{
                transform: beePollinated
                  ? 'rotate(0deg)'
                  : cloudsLeft === 0
                    ? 'rotate(4deg)'
                    : 'rotate(11deg)',
                transformOrigin: '390px 385px',
                transition: 'transform 1050ms cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <image
                href="/assets/images/prop-sunflower-stem.png"
                x="320"
                y="186"
                width="142"
                height="204"
                preserveAspectRatio="xMidYMid meet"
              />
              <g transform="translate(390, 212)">
                <g
                  id="sunflower-head"
                  className="sunflower-head"
                  style={{ transform: sunflowerTransform }}
                >
                  <image
                    href="/assets/images/prop-sunflower-head.png"
                    x="-58"
                    y="-58"
                    width="116"
                    height="116"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              </g>
            </g>

            {/* Pulsing pollination click target */}
            {cloudsLeft === 0 && !beePollinated && (
              <g
                id="sunflower-pollination-target"
                style={{ cursor: 'pointer' }}
                onClick={pollinateFlower}
              >
                <circle className="nap-ripple" cx="390" cy="212" r="46" fill="none" stroke="#E9A58E" strokeWidth="4" />
                <rect x="330" y="138" width="120" height="30" rx="12" fill="#FAF8F0" stroke="#293A30" strokeWidth="2" />
                <text
                  x="390"
                  y="158"
                  textAnchor="middle"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontSize="13"
                  fontWeight="700"
                  fill="#293A30"
                >
                  Hinggap di sini
                </text>
              </g>
            )}

            {/* Butterflies (Sandbox reacts) */}
            <g transform="translate(220, 235)">
              <g
                id="canopy-butterfly-1"
                className="anim-butterfly"
                style={{
                  opacity: beePollinated ? (sunMode.butterflies >= 1 ? 1 : 0) : 0.55,
                  transition: 'opacity 400ms ease'
                }}
              >
                <image
                  href="/assets/images/prop-butterfly-1.png"
                  x="-28"
                  y="-23"
                  width="56"
                  height="46"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>
            <g transform="translate(565, 220)">
              <g
                id="canopy-butterfly-2"
                className="anim-butterfly anim-butterfly-delay"
                style={{
                  opacity: beePollinated && sunMode.butterflies >= 2 ? 1 : 0,
                  transition: 'opacity 400ms ease'
                }}
              >
                <image
                  href="/assets/images/prop-butterfly-2.png"
                  x="-26"
                  y="-22"
                  width="52"
                  height="44"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>
            <g transform="translate(650, 270)">
              <g
                id="canopy-butterfly-3"
                className="anim-butterfly"
                style={{
                  opacity: beePollinated && sunMode.butterflies >= 3 ? 1 : 0,
                  transition: 'opacity 400ms ease'
                }}
              >
                <image
                  href="/assets/images/prop-butterfly-3.png"
                  x="-26"
                  y="-22"
                  width="52"
                  height="44"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>

            {/* Interactive Bee (Lulu) */}
            <g
              id="canopy-bee"
              className={`bee-actor${beeDragOffset ? ' is-dragging' : ''}`}
              role="button"
              tabIndex={beePollinated ? -1 : 0}
              aria-disabled={beePollinated ? 'true' : undefined}
              aria-label="Lulu si lebah kecil penyerbuk. Seret atau klik untuk membawa lebah ke bunga matahari"
              style={{ transform: beeTransform }}
              onPointerDown={handleBeePointerDown}
              onPointerMove={handleBeePointerMove}
              onPointerUp={handleBeePointerUp}
              onPointerCancel={handleBeePointerCancel}
              onClick={handleBeeClick}
              onKeyDown={handleBeeKeyDown}
              onKeyUp={handleBeeKeyUp}
            >
              <circle cx="585" cy="210" r="64" fill="transparent" />
              <g transform="translate(585, 210)">
                <image
                  href="/assets/images/prop-pollinator-bee.png"
                  x="-36"
                  y="-31"
                  width="72"
                  height="62"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            </g>

            {/* Two Draggable/Clickable Grey Storm Clouds */}
            <g
              id="storm-cloud-1"
              className={`storm-cloud${cloud1Cleared ? ' is-cleared' : ''}${cloudDragOffsets[0] ? ' is-dragging' : ''}`}
              role="button"
              tabIndex={cloud1Cleared ? -1 : 0}
              aria-disabled={cloud1Cleared ? 'true' : undefined}
              aria-label="Awan kelabu pertama menutupi matahari. Klik atau seret untuk menggeser"
              style={{ transform: cloud1Transform }}
              onPointerDown={handleCloudPointerDown(0)}
              onPointerMove={handleCloudPointerMove(0)}
              onPointerUp={handleCloudPointerEnd(0)}
              onPointerCancel={handleCloudPointerCancel(0)}
              onClick={handleCloudClick(0)}
              onKeyDown={handleCloudKeyDown(0)}
              onKeyUp={handleCloudKeyUp(0)}
            >
              <image
                href="/assets/images/prop-storm-cloud-1.png"
                x="266"
                y="46"
                width="166"
                height="104"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>

            <g
              id="storm-cloud-2"
              className={`storm-cloud${cloud2Cleared ? ' is-cleared' : ''}${cloudDragOffsets[1] ? ' is-dragging' : ''}`}
              role="button"
              tabIndex={cloud2Cleared ? -1 : 0}
              aria-disabled={cloud2Cleared ? 'true' : undefined}
              aria-label="Awan kelabu kedua menutupi matahari. Klik atau seret untuk menggeser"
              style={{ transform: cloud2Transform }}
              onPointerDown={handleCloudPointerDown(1)}
              onPointerMove={handleCloudPointerMove(1)}
              onPointerUp={handleCloudPointerEnd(1)}
              onPointerCancel={handleCloudPointerCancel(1)}
              onClick={handleCloudClick(1)}
              onKeyDown={handleCloudKeyDown(1)}
              onKeyUp={handleCloudKeyUp(1)}
            >
              <image
                href="/assets/images/prop-storm-cloud-2.png"
                x="342"
                y="66"
                width="166"
                height="104"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </svg>
        </div>

        {/* Unlocked Sandbox: Sunlight Time Dial + Reward Notice */}
        {beePollinated && (
          <div id="canopy-sandbox-panel" className="field-note-mint p-5 sm:p-6 mt-6 space-y-4 route-stage-enter">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-story text-xl font-bold m-0">Pengatur Waktu Matahari</h3>
                <p id="canopy-time-note" className="text-base mt-1 mb-0">
                  {sunMode.note}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Pengatur Waktu Matahari">
                {SUN_CHOICES.map((choice) => {
                  const active = activeSunTime === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      data-sun-choice={choice}
                      className={`touch-btn ${active ? 'btn-primary' : 'btn-paper'} px-5 py-2.5`}
                      onClick={() => {
                        audioManager.playSfx('click');
                        updateSandbox({ sunTime: choice });
                      }}
                    >
                      {SUN_MODES[choice].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#293A30]/15 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#2F5C40] m-0">
                Hadiah terbuka: Bibit Bunga Matahari kini mekar di Taman Hadiah!
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="touch-btn btn-paper px-4 py-2 text-sm"
                  onClick={() => setExploreStage('sanctuary')}
                >
                  Lihat Taman Hadiah
                </button>
                <button
                  type="button"
                  className="touch-btn btn-forest px-4 py-2 text-sm"
                  onClick={() => setExploreStage('river')}
                >
                  Lanjut ke Zona 2 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
