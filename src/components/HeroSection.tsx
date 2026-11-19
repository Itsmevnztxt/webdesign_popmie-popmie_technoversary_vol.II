import React, { useEffect, useState } from 'react';
import { BADGE_CATALOG, useRimba } from '../state/rimbaStore';
import { BijiSvg } from './BijiSvg';
import { audioManager } from '../audio/audioManager';

export type HeroTimeMode = 'auto' | 'pagi' | 'siang' | 'senja' | 'malam';

const HERO_TIME_OPTIONS: Array<{ id: HeroTimeMode; label: string }> = [
  { id: 'auto', label: 'Otomatis' },
  { id: 'pagi', label: 'Pagi' },
  { id: 'siang', label: 'Siang' },
  { id: 'senja', label: 'Senja' },
  { id: 'malam', label: 'Malam' }
];

const STATIC_PHASE_MAP: Record<Exclude<HeroTimeMode, 'auto'>, number> = {
  pagi: 0.08,
  siang: 0.36,
  senja: 0.66,
  malam: 0.88
};

const FIREFLY_SPOTS = [
  { id: 'ff-1', left: '66%', bottom: '20%', delay: '0s', size: 7 },
  { id: 'ff-2', left: '72%', bottom: '32%', delay: '0.7s', size: 6 },
  { id: 'ff-3', left: '82%', bottom: '26%', delay: '1.3s', size: 8 },
  { id: 'ff-4', left: '58%', bottom: '16%', delay: '1.9s', size: 6 },
  { id: 'ff-5', left: '91%', bottom: '18%', delay: '0.4s', size: 7 },
  { id: 'ff-6', left: '15%', bottom: '14%', delay: '1.1s', size: 6 }
];

const STAR_SPOTS = [
  { cx: '18%', cy: '14%', r: 2.2, delay: '0s' },
  { cx: '34%', cy: '9%', r: 1.8, delay: '0.8s' },
  { cx: '52%', cy: '15%', r: 2.4, delay: '1.4s' },
  { cx: '68%', cy: '11%', r: 1.7, delay: '0.5s' },
  { cx: '84%', cy: '18%', r: 2.1, delay: '1.9s' },
  { cx: '92%', cy: '10%', r: 1.8, delay: '1.1s' }
];

const CYCLE_DURATION_MS = 36000;

export function HeroSection() {
  const { state, unlockedCount, resetCounter, setBijiAwake, announce, navigate } = useRimba();
  const [greetedAfterWake, setGreetedAfterWake] = useState(false);
  const [timeMode, setTimeMode] = useState<HeroTimeMode>('auto');
  const [cyclePhase, setCyclePhase] = useState<number>(0.34); // starts smoothly in bright daytime sky

  const allBadgesUnlocked = unlockedCount === BADGE_CATALOG.length;

  useEffect(() => {
    setGreetedAfterWake(false);
  }, [resetCounter]);

  useEffect(() => {
    if (timeMode !== 'auto') {
      setCyclePhase(STATIC_PHASE_MAP[timeMode]);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof window.requestAnimationFrame !== 'function') {
      setCyclePhase(0.34);
      return;
    }

    let rafId = 0;
    const startOffset = 0.34;
    const startWall = performance.now();

    const step = (now: number) => {
      const elapsed = now - startWall;
      const nextPhase = (startOffset + elapsed / CYCLE_DURATION_MS) % 1;
      setCyclePhase(nextPhase);
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [timeMode]);

  const wakeOrGreet = () => {
    audioManager.playSfx('wake');
    if (!state.bijiAwake) {
      setBijiAwake(true);
      announce('Pico bangun! Klik Mulai Petualangan untuk membuka Kartu Penjelajah.');
    } else {
      setGreetedAfterWake(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter') wakeOrGreet();
    if (e.key === ' ') e.preventDefault();
  };

  const handleKeyUp = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === ' ') wakeOrGreet();
  };

  const handleStartAdventure = () => {
    audioManager.playSfx('click');
    navigate('portal');
  };

  const handleQuickExplore = () => {
    audioManager.playSfx('click');
    navigate('jelajah');
  };

  // Smooth atmosphere weights derived cleanly from cyclePhase (0..1)
  const dawnWeight = cyclePhase < 0.25 ? Math.sin((cyclePhase / 0.25) * Math.PI) : 0;
  const duskWeight =
    cyclePhase >= 0.5 && cyclePhase < 0.78
      ? Math.sin(((cyclePhase - 0.5) / 0.28) * Math.PI)
      : 0;
  const nightWeight =
    cyclePhase >= 0.72
      ? Math.sin(((cyclePhase - 0.72) / 0.28) * Math.PI)
      : 0;

  const isDarkSky = nightWeight > 0.42;

  // Sun travels calmly across upper arc during 0.00..0.74, dips below horizon during night
  const dayProgress = Math.min(1, Math.max(0, cyclePhase / 0.74));
  const sunX = 5 + dayProgress * 76; // percentage across sky, safely inset on narrow screens
  const sunArcY = 14 - Math.sin(dayProgress * Math.PI) * 11 + Math.max(0, (cyclePhase - 0.68) * 110);
  const sunOpacity = cyclePhase < 0.72 ? Math.min(1, Math.max(0, (0.72 - cyclePhase) * 6)) : 0;

  const moonOpacity = Math.max(0, Math.min(1, (nightWeight - 0.2) * 1.4));

  const skyGradient =
    nightWeight > 0.35
      ? `linear-gradient(180deg, rgba(28, 43, 72, ${(0.88 * nightWeight).toFixed(2)}) 0%, rgba(56, 79, 115, ${(0.72 * nightWeight).toFixed(2)}) 58%, rgba(250, 248, 240, 0.25) 100%)`
      : duskWeight > 0.18
        ? `linear-gradient(180deg, rgba(244, 180, 140, ${(0.52 * duskWeight).toFixed(2)}) 0%, rgba(252, 224, 196, ${(0.48 * duskWeight).toFixed(2)}) 65%, rgba(250, 248, 240, 0) 100%)`
        : dawnWeight > 0.18
          ? `linear-gradient(180deg, rgba(249, 217, 154, ${(0.45 * dawnWeight).toFixed(2)}) 0%, rgba(255, 244, 214, ${(0.35 * dawnWeight).toFixed(2)}) 65%, rgba(250, 248, 240, 0) 100%)`
          : 'none';

  const landscapeFilter =
    nightWeight > 0.15
      ? `brightness(${(1 - 0.32 * nightWeight).toFixed(2)}) saturate(${(1 - 0.14 * nightWeight).toFixed(2)})`
      : duskWeight > 0.15
        ? `brightness(${(1 - 0.08 * duskWeight).toFixed(2)}) sepia(${(0.18 * duskWeight).toFixed(2)})`
        : 'none';

  const heroSpeech = !state.bijiAwake
    ? 'Zzz... ketuk Pico di bawah pohon untuk membangunkannya...'
    : allBadgesUnlocked
      ? 'Hore! Keempat sudut lembah telah pulih! Matahari, sungai, tanah, dan pesisir bakau kembali lestari bersamamu!'
      : !greetedAfterWake
        ? 'Hoaaam... halo, Penjelajah! Pagi ini hutan, sungai, tanah, dan pesisir bakau sedang butuh bantuan kita.'
        : 'Yuk buka Kartu Penjelajah dulu, lalu pilih satwa penjaga alam yang ingin kamu bantu!';

  const heroExpression = !state.bijiAwake
    ? 'sleeping'
    : allBadgesUnlocked
      ? 'celebrate'
      : 'happy';

  // Keep grounded standing mascot sprite inside Sapaan Pico when awake
  const picoDialogueImg = !state.bijiAwake
    ? '/assets/images/mascot-biji-sleeping.png'
    : '/assets/images/mascot-biji-happy.png';

  return (
    <section
      id="gerbang-lembah"
      data-hero-phase={timeMode === 'auto' ? (isDarkSky ? 'malam' : duskWeight > 0.35 ? 'senja' : 'siang') : timeMode}
      className="world-section zone-hero relative bg-[#FAF8F0] min-h-[600px] sm:min-h-[680px] md:min-h-[clamp(560px,calc(100vh-70px),810px)] overflow-x-clip overflow-y-visible"
      aria-labelledby="hero-title"
    >
      {/* Dynamic Sky Atmosphere Veil (Terbit -> Siang -> Senja -> Malam Teduh) */}
      <div
        id="hero-sky-atmosphere"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{ background: skyGradient }}
        aria-hidden="true"
      />

      {/* Unified Full-Screen Valley Backdrop + Free-Flying Sky & Meadow Canvas */}
      <div
        id="hero-scene-canvas"
        className="pointer-events-none absolute inset-0 overflow-visible select-none z-[1]"
      >
        {/* Twinkling Stars & Crescent Moon (Malam Teduh) */}
        <svg
          id="hero-night-sky"
          viewBox="0 0 1200 420"
          preserveAspectRatio="xMidYMin slice"
          className="absolute inset-x-0 top-0 w-full h-56 pointer-events-none transition-opacity duration-700"
          style={{ opacity: moonOpacity }}
          aria-hidden="true"
        >
          {STAR_SPOTS.map((star, idx) => (
            <circle
              key={idx}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="#FFF6CC"
              className="pico-petal-float"
              style={{ animationDelay: star.delay }}
            />
          ))}
          <g transform="translate(1060, 48)">
            <circle cx="0" cy="0" r="22" fill="#FFF4C2" />
            <circle cx="9" cy="-5" r="19" fill="#23375A" />
          </g>
        </svg>

        {/* Orbiting Daylight Sun (hero-sun.png) */}
        <div
          id="hero-sun-orbit"
          className="absolute pointer-events-none transition-opacity duration-500"
          style={{
            left: `${sunX.toFixed(1)}%`,
            top: `${Math.max(1.5, sunArcY).toFixed(1)}%`,
            opacity: sunOpacity
          }}
          aria-hidden="true"
        >
          <img
            src="/assets/images/hero-sun.png"
            alt=""
            className="anim-sun-spin w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] lg:w-[76px] lg:h-[76px] object-contain"
          />
        </div>

        {/* Floating Clouds */}
        <img
          src="/assets/images/hero-cloud-1.png"
          alt=""
          aria-hidden="true"
          className="anim-cloud-slow absolute top-4 left-[38%] sm:left-[42%] w-[86px] sm:w-[120px] lg:w-[146px] h-auto object-contain transition-opacity duration-700"
          style={{ opacity: Math.max(0.28, 0.95 - nightWeight * 0.65) }}
        />
        <div
          className="hidden sm:block absolute top-4 right-4 sm:right-[5%] w-[104px] lg:w-[130px] -scale-x-100 transition-opacity duration-700"
          style={{ opacity: Math.max(0.25, 0.9 - nightWeight * 0.65) }}
          aria-hidden="true"
        >
          <img
            src="/assets/images/hero-cloud-2.png"
            alt=""
            className="anim-cloud-slower w-full h-auto object-contain"
          />
        </div>

        {/* Ambient Valley Hills & Oak Tree shaded smoothly by Dusk / Night lighting */}
        <div
          id="hero-landscape-lit"
          className="absolute inset-0 pointer-events-none"
          style={{ filter: landscapeFilter }}
        >
          <img
            src="/assets/images/hero-valley-hills.png"
            alt=""
            aria-hidden="true"
            className="hero-hills-img absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none"
            draggable={false}
          />

          {/* Sheltering Story Oak Tree on Right Hill */}
          <img
            id="hero-story-tree-img"
            src="/assets/images/hero-story-tree.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-[4%] right-[3%] sm:bottom-[6%] sm:right-[10%] md:bottom-[8%] md:right-[14%] lg:right-[15%] w-[190px] sm:w-[330px] md:w-[400px] lg:w-[min(480px,54vh)] h-auto object-contain"
            draggable={false}
          />

          {/* Free-Flying Butterflies */}
          <img
            src="/assets/images/hero-butterfly-1.png"
            alt=""
            aria-hidden="true"
            className="anim-butterfly absolute bottom-[15%] left-[12%] sm:bottom-[22%] sm:left-[26%] md:bottom-[34%] md:left-[44%] lg:bottom-[36%] lg:left-[43%] w-[36px] sm:w-[46px] lg:w-[52px] h-auto object-contain"
            draggable={false}
          />
          <img
            id="hero-butterfly-right"
            src="/assets/images/hero-butterfly-2.png"
            alt=""
            aria-hidden="true"
            className="hidden sm:block anim-butterfly anim-butterfly-delay absolute sm:bottom-[42%] sm:right-[4%] md:bottom-[48%] md:right-[4%] lg:bottom-[50%] lg:right-[4.5%] sm:w-[44px] lg:w-[48px] h-auto object-contain"
            draggable={false}
          />

          {/* Swaying Grass Tufts */}
          <img
            src="/assets/images/hero-grass-tufts1.png"
            alt=""
            aria-hidden="true"
            className="anim-sway absolute bottom-[3.5%] left-[7%] sm:bottom-[4.5%] sm:left-[12%] md:left-[15%] w-[38px] sm:w-[48px] h-auto object-contain"
            draggable={false}
          />
          <img
            src="/assets/images/hero-grass-tufts2.png"
            alt=""
            aria-hidden="true"
            className="anim-sway absolute bottom-[4.5%] right-[3.5%] sm:bottom-[6%] sm:right-[6%] md:right-[7%] w-[36px] sm:w-[46px] h-auto object-contain"
            draggable={false}
          />
        </div>

        {/* Gentle Dusk/Night Tint Veil over Hills + Twinkling Fireflies */}
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none transition-opacity duration-500"
          style={{
            opacity: Math.max(nightWeight * 0.42, duskWeight * 0.24),
            background:
              nightWeight > duskWeight
                ? 'linear-gradient(180deg, transparent 0%, rgba(20, 32, 56, 0.72) 100%)'
                : 'linear-gradient(180deg, transparent 0%, rgba(224, 128, 86, 0.55) 100%)'
          }}
          aria-hidden="true"
        />

        {/* Fireflies around the oak tree & bushes during Malam Teduh */}
        <div
          id="hero-fireflies"
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ opacity: nightWeight > 0.3 ? Math.min(1, (nightWeight - 0.3) * 1.8) : 0 }}
          aria-hidden="true"
        >
          {FIREFLY_SPOTS.map((ff) => (
            <span
              key={ff.id}
              className="hero-firefly"
              style={{
                left: ff.left,
                bottom: ff.bottom,
                width: `${ff.size}px`,
                height: `${ff.size}px`,
                animationDelay: ff.delay
              }}
            />
          ))}
        </div>

        {/* Interactive Grounded Pico standing firmly on meadow grass in front of oak roots */}
        <div
          id="hero-pico-wrap"
          className="pointer-events-auto absolute bottom-[4%] right-[16%] sm:bottom-[5.5%] sm:right-[21%] md:bottom-[6.5%] md:right-[23.5%] w-[78px] h-[78px] sm:w-[96px] sm:h-[96px] md:w-[104px] md:h-[104px] lg:w-[clamp(96px,13vh,118px)] lg:h-[clamp(96px,13vh,118px)] z-[3]"
        >
          <svg viewBox="0 0 100 104" className="w-full h-full overflow-visible select-none">
            {!state.bijiAwake && (
              <g id="hero-nap-cue">
                <circle className="nap-ripple" cx="48" cy="52" r="46" fill="none" stroke="#F5D77D" strokeWidth="4" />
                <circle
                  className="nap-ripple"
                  cx="48"
                  cy="52"
                  r="34"
                  fill="none"
                  stroke="#E9A58E"
                  strokeWidth="3"
                  style={{ animationDelay: '0.7s' }}
                />
              </g>
            )}
            <g
              id="hero-biji-btn"
              className="biji-actor"
              role="button"
              tabIndex={0}
              aria-label={
                state.bijiAwake
                  ? 'Pico sudah bangun dan siap mendengarmu. Ketuk untuk menyapa lagi.'
                  : 'Ketuk Pico yang sedang tidur siang untuk membangunkannya'
              }
              aria-pressed={state.bijiAwake ? 'true' : 'false'}
              onClick={wakeOrGreet}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            >
              <circle cx="48" cy="52" r="50" fill="transparent" />
              <BijiSvg id="hero-biji-svg" expression={heroExpression} variant="hero" />
            </g>
          </svg>
        </div>
      </div>

      {/* Hero Editorial Copy (Top-Left) + Time Cycle Pill & Sapaan Pico (Top-Right) Overlaying the Sky */}
      <div className="pointer-events-none relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-10 pt-[74px] sm:pt-[96px] md:pt-[clamp(5.75rem,10vh,6.75rem)] lg:pt-[clamp(6.75rem,11.5vh,7.5rem)] pb-[238px] sm:pb-[248px] md:pb-[clamp(11.5rem,27vh,17.5rem)]">
        <div className="flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-5 lg:gap-8">
          <div className="pointer-events-auto max-w-xl w-full transition-colors duration-500">
            <p
              className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider m-0 transition-colors duration-500 ${
                isDarkSky ? 'text-[#F5D77D]' : 'text-[#477A59]'
              }`}
            >
              Kisah Alam Anak Indonesia untuk Usia 7–10 Tahun
            </p>
            <h1
              id="hero-title"
              className="font-story text-4xl sm:text-5xl lg:text-6xl font-bold leading-none tracking-tight mt-1 sm:mt-1.5 mb-0 transition-colors duration-500"
              style={{ color: isDarkSky ? '#FAF8F0' : '#293A30' }}
            >
              TamanPico
            </h1>
            <p
              className={`mt-2 sm:mt-2.5 text-sm sm:text-base lg:text-lg leading-relaxed max-w-lg mb-0 transition-colors duration-500 ${
                isDarkSky ? 'text-[#FAF8F0]/95' : 'text-[#293A30]'
              }`}
            >
              Ikuti jejak Pico menolong lebah penyerbuk di kanopi hutan, membersihkan sungai bersama katak kecil, menggemburkan tanah oak, dan menanam bakau pesisir.
            </p>
            <p
              className={`mt-1 sm:mt-1.5 text-xs sm:text-sm font-semibold mb-0 transition-colors duration-500 ${
                isDarkSky ? 'text-[#DCEEDB]' : 'text-[#477A59]'
              }`}
            >
              {state.bijiAwake
                ? 'Pico sudah siap menemanimu berkeliling lembah!'
                : 'Ketuk Pico yang sedang tidur siang di bawah pohon untuk membangunkannya, atau langsung mulai petualangan.'}
            </p>

            <div id="hero-cta-wrap" className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                id="hero-start-btn"
                type="button"
                className="touch-btn btn-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
                onClick={handleStartAdventure}
              >
                Mulai Petualangan →
              </button>

              {state.passport ? (
                <button
                  type="button"
                  className="touch-btn btn-forest px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base"
                  onClick={handleQuickExplore}
                >
                  Lanjut ke Dunia Jelajah
                </button>
              ) : (
                <button
                  type="button"
                  className="touch-btn btn-paper px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base"
                  onClick={() => {
                    audioManager.playSfx('click');
                    navigate('wawasan');
                  }}
                >
                  Baca Wawasan Alam
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Compact Sky Cycle Controls + Sapaan Pico Bubble */}
          <div className="pointer-events-auto flex flex-col items-stretch md:items-end gap-2.5 max-w-sm w-full md:w-[295px] lg:w-[360px] shrink-0">
            <div
              id="hero-time-controls"
              role="group"
              aria-label="Pilih waktu langit beranda"
              className="inline-flex flex-wrap gap-1 p-1 rounded-2xl bg-[#FAF8F0]/90 border-2 border-[#293A30]/20 shadow-xs self-start md:self-end"
            >
              {HERO_TIME_OPTIONS.map((opt) => {
                const active = timeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      audioManager.playSfx('click');
                      setTimeMode(opt.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-colors ${
                      active
                        ? 'bg-[#F5D77D] text-[#293A30] border border-[#293A30]'
                        : 'text-[#293A30]/80 hover:bg-[#DCEEDB]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div
              id="hero-biji-bubble"
              className="field-note relative p-3 sm:p-4 w-full bg-[#FAF8F0]/95 backdrop-blur-xs route-stage-enter"
            >
              <div className="flex items-start gap-3">
                <img
                  src={picoDialogueImg}
                  alt=""
                  aria-hidden="true"
                  className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 rounded-2xl bg-[#DCEEDB]/60 p-1 border border-[#293A30]/20"
                />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] mt-0 mb-0.5">
                    Sapaan Pico
                  </p>
                  <p id="hero-biji-text" className="text-sm sm:text-base font-medium leading-snug m-0 text-[#293A30]">
                    {heroSpeech}
                  </p>
                </div>
              </div>
              <span
                aria-hidden="true"
                className="hidden md:block absolute -bottom-2.5 right-16 lg:right-20 w-4 h-4 bg-[#FAF8F0] border-r-2 border-b-2 border-[#293A30]/75 rotate-45"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
