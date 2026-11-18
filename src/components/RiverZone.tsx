import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

type BinType = 'recycle' | 'compost';
type WasteId = 'bottle' | 'branch' | 'can' | 'leaf';

interface WasteItemConfig {
  id: WasteId;
  label: string;
  expectedBin: BinType;
}

const WASTE_ITEMS: WasteItemConfig[] = [
  { id: 'bottle', label: 'Botol Plastik', expectedBin: 'recycle' },
  { id: 'branch', label: 'Ranting Patah', expectedBin: 'compost' },
  { id: 'can', label: 'Kaleng Bekas', expectedBin: 'recycle' },
  { id: 'leaf', label: 'Daun Kering', expectedBin: 'compost' }
];

const WRONG_HINTS: Record<BinType, string> = {
  recycle: 'Ups! Benda alam seperti daun dan ranting bisa lapuk menjadi tanah subur. Coba masukkan ke Tumpukan Kompos.',
  compost: 'Ups! Plastik dan kaleng tidak membusuk di tumpukan kompos. Masukkan ke Keranjang Daur Ulang ya.'
};

const DEFAULT_FEEDBACK = 'Seret benda di sungai ke wadah yang tepat, atau klik benda lalu klik wadahnya.';

function WasteIcon({ id }: { id: WasteId }) {
  if (id === 'bottle') {
    return (
      <img
        src="/assets/images/prop-waste-bottle.png"
        alt=""
        aria-hidden="true"
        width={34}
        height={34}
        className="w-[34px] h-[34px] object-contain shrink-0 pointer-events-none select-none"
      />
    );
  }
  if (id === 'branch') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M5 24 L26 8 M15 16 L13 8 M18 14 L26 16"
          fill="none"
          stroke="#5C4636"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === 'can') {
    return (
      <img
        src="/assets/images/prop-waste-can.png"
        alt=""
        aria-hidden="true"
        width={34}
        height={34}
        className="w-[34px] h-[34px] object-contain shrink-0 pointer-events-none select-none"
      />
    );
  }
  return (
    <img
      src="/assets/images/prop-waste-leaf.png"
      alt=""
      aria-hidden="true"
      width={34}
      height={34}
      className="w-[34px] h-[34px] object-contain shrink-0 pointer-events-none select-none"
    />
  );
}

export function RiverZone() {
  const { state, resetCounter, unlockBadge, updateSandbox, announce, setExploreStage } = useRimba();

  const [sortedItems, setSortedItems] = useState<WasteId[]>(() =>
    state.badges.river ? WASTE_ITEMS.map((item) => item.id) : []
  );
  const [selectedItemId, setSelectedItemId] = useState<WasteId | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean }>(() => ({
    text: state.badges.river
      ? 'Sungai sudah bersih dan jernih! Sekarang coba aktifkan hujan di bawah.'
      : DEFAULT_FEEDBACK,
    isError: false
  }));

  const [draggingState, setDraggingState] = useState<{ id: WasteId; dx: number; dy: number } | null>(null);
  const [hoveredBin, setHoveredBin] = useState<BinType | null>(null);

  const recycleBinRef = useRef<HTMLButtonElement | null>(null);
  const compostBinRef = useRef<HTMLButtonElement | null>(null);
  const dragStartRef = useRef<{ id: WasteId; startX: number; startY: number; dx: number; dy: number } | null>(null);
  const suppressClickRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (state.badges.river) {
      setSortedItems(WASTE_ITEMS.map((item) => item.id));
      setFeedback({
        text: 'Sungai sudah bersih dan jernih! Sekarang coba aktifkan hujan di bawah.',
        isError: false
      });
    } else {
      setSortedItems([]);
      setFeedback({ text: DEFAULT_FEEDBACK, isError: false });
    }
    setSelectedItemId(null);
    setDraggingState(null);
    setHoveredBin(null);
    dragStartRef.current = null;
  }, [state.badges.river, resetCounter]);

  const reportFeedback = useCallback(
    (message: string, isError = false) => {
      setFeedback({ text: message, isError });
      announce(message);
    },
    [announce]
  );

  const findBinUnderPointer = useCallback((clientX: number, clientY: number): BinType | null => {
    const bins: Array<{ type: BinType; el: HTMLButtonElement | null }> = [
      { type: 'recycle', el: recycleBinRef.current },
      { type: 'compost', el: compostBinRef.current }
    ];
    for (const bin of bins) {
      if (!bin.el) continue;
      const r = bin.el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return bin.type;
      }
    }
    return null;
  }, []);

  const trySortItem = useCallback(
    (itemId: WasteId, targetBinType: BinType) => {
      if (sortedItems.includes(itemId)) return;
      const item = WASTE_ITEMS.find((w) => w.id === itemId);
      if (!item) return;

      if (item.expectedBin === targetBinType) {
        audioManager.playSfx('sort-ok');
        const nextSorted = [...sortedItems, itemId];
        setSortedItems(nextSorted);
        setSelectedItemId(null);

        const binName = targetBinType === 'recycle' ? 'Keranjang Daur Ulang' : 'Tumpukan Kompos';
        if (nextSorted.length === WASTE_ITEMS.length) {
          unlockBadge('river');
          setFeedback({
            text: 'Sungai sudah bersih dan jernih! Sekarang coba aktifkan hujan di bawah.',
            isError: false
          });
        } else {
          reportFeedback(`Tepat! ${item.label} masuk ke ${binName}.`);
        }
      } else {
        audioManager.playSfx('sort-err');
        setSelectedItemId(null);
        reportFeedback(WRONG_HINTS[targetBinType] || 'Coba cek lagi wadah yang cocok ya.', true);
      }
    },
    [reportFeedback, sortedItems, unlockBadge]
  );

  const handleItemPointerDown = (itemId: WasteId) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (sortedItems.includes(itemId)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStartRef.current = { id: itemId, startX: e.clientX, startY: e.clientY, dx: 0, dy: 0 };
    setDraggingState({ id: itemId, dx: 0, dy: 0 });
  };

  const handleItemPointerMove = (itemId: WasteId) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.id !== itemId) return;
    drag.dx = e.clientX - drag.startX;
    drag.dy = e.clientY - drag.startY;
    setDraggingState({ id: itemId, dx: drag.dx, dy: drag.dy });
    setHoveredBin(findBinUnderPointer(e.clientX, e.clientY));
  };

  const handleItemPointerUp = (itemId: WasteId) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.id !== itemId) return;
    const movedDist = Math.hypot(drag.dx, drag.dy);
    dragStartRef.current = null;
    setDraggingState(null);
    setHoveredBin(null);

    if (movedDist < 10) return;

    suppressClickRef.current[itemId] = true;
    window.setTimeout(() => {
      suppressClickRef.current[itemId] = false;
    }, 60);

    const droppedBin = findBinUnderPointer(e.clientX, e.clientY);
    if (droppedBin) {
      trySortItem(itemId, droppedBin);
    }
  };

  const handleItemPointerCancel = () => {
    dragStartRef.current = null;
    setDraggingState(null);
    setHoveredBin(null);
  };

  const handleItemClick = (item: WasteItemConfig) => () => {
    if (suppressClickRef.current[item.id]) {
      suppressClickRef.current[item.id] = false;
      return;
    }
    if (sortedItems.includes(item.id)) return;
    audioManager.playSfx('click');
    const next = selectedItemId === item.id ? null : item.id;
    setSelectedItemId(next);
    if (next) {
      reportFeedback(`"${item.label}" dipilih! Sekarang ketuk Keranjang Daur Ulang atau Tumpukan Kompos.`);
    } else {
      reportFeedback(DEFAULT_FEEDBACK);
    }
  };

  const handleBinClick = (binType: BinType) => () => {
    if (!selectedItemId) {
      reportFeedback('Pilih salah satu benda di sungai dulu, lalu ketuk wadah ini untuk memindahkannya.');
      return;
    }
    trySortItem(selectedItemId, binType);
  };

  const isClean = sortedItems.length === WASTE_ITEMS.length;
  const rainActive = isClean && state.sandbox.rainActive;

  return (
    <section
      id="zona-sungai"
      className="world-section zone-river py-8 sm:py-12 min-h-[calc(100svh-140px)]"
      aria-labelledby="river-title"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-10 explore-compass-pad">
        {/* Animal Roleplay Header */}
        <div className="field-note px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F0]">
          <div className="flex items-center gap-3">
            <ExplorerAvatarSvg avatar="frog" size={44} />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] m-0">
                Bermain Peran Satwa Penjaga Alam
              </p>
              <p className="font-story text-lg font-bold m-0">
                Kamu berperan sebagai Kiko si Katak Penjaga Sungai
              </p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-full bg-[#D9EDE9] border border-[#293A30] self-start sm:self-auto">
            Hadiah: Teratai Biru
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-5">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40]">
              Zona 2: Air Bersih &amp; Pilah Sampah
            </p>
            <h2 id="river-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              Tepi Sungai &amp; Aliran Air
            </h2>
          </div>
          <div className="field-note px-4 py-2.5 inline-flex items-center gap-3 self-start md:self-auto">
            <span id="river-sorted-count" className="text-base font-extrabold text-[#477A59]">
              {sortedItems.length}/4 Benda Dipilah
            </span>
          </div>
        </div>

        <p
          id="river-feedback"
          className="field-note px-5 py-3.5 text-base font-medium mb-6"
          style={{ borderColor: feedback.isError ? '#E9A58E' : 'rgba(41, 58, 48, 0.25)' }}
        >
          {feedback.text}
        </p>

        <div
          id="river-stage"
          className="relative rounded-3xl border-2 border-[#293A30]/20 bg-[#DCEEDB]/65 p-3 sm:p-5 shadow-sm"
        >
          <div className="relative w-full">
            <svg
              id="river-svg"
              viewBox="0 0 800 420"
              className="w-full h-auto block select-none rounded-2xl overflow-hidden"
              role="img"
              aria-label="Ilustrasi sungai hutan TamanPico yang bertransisi dari air keruh bersampah menjadi sungai jernih bersama ikan, teratai biru, dan Kiko si katak"
            >
              {/* Color fallback & state indicator beneath unified scene artwork */}
              <path
                className="river-water"
                d="M0 140 Q220 110 450 148 T800 130 L800 320 Q620 350 440 310 T0 318 Z"
                fill={isClean ? '#D9EDE9' : '#9AA989'}
              />

              {/* Unified Dirty River Scene (Base Layer) */}
              <image
                id="river-scene-dirty"
                href="/assets/images/zone2-river-dirty.png"
                x="0"
                y="0"
                width="800"
                height="420"
                preserveAspectRatio="xMidYMid slice"
              />

              {/* Unified Clean River Scene (Smooth Crossfade when all items sorted) */}
              <image
                id="river-scene-clean"
                href="/assets/images/zone2-river-clean.png"
                x="0"
                y="0"
                width="800"
                height="420"
                preserveAspectRatio="xMidYMid slice"
                style={{
                  opacity: isClean ? 1 : 0,
                  transition: 'opacity 1100ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              />

              {/* Raincloud & Raindrops (Sandbox) */}
              <g
                id="river-rain-layer"
                style={{ opacity: rainActive ? 1 : 0, transition: 'opacity 600ms ease' }}
                aria-hidden="true"
              >
                <image
                  href="/assets/images/prop-raincloud.png"
                  x="480"
                  y="-6"
                  width="136"
                  height="136"
                  preserveAspectRatio="xMidYMid meet"
                />
                <g stroke="#477A59" strokeWidth="2.5" strokeLinecap="round">
                  <line className="rain-drop" x1="508" y1="92" x2="504" y2="108" />
                  <line className="rain-drop" x1="538" y1="88" x2="534" y2="104" style={{ animationDelay: '0.28s' }} />
                  <line className="rain-drop" x1="568" y1="94" x2="564" y2="110" style={{ animationDelay: '0.56s' }} />
                  <line className="rain-drop" x1="594" y1="86" x2="590" y2="102" style={{ animationDelay: '0.16s' }} />
                </g>
              </g>
            </svg>

            {/* 4 Draggable / Clickable Floating Waste Items */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4" aria-label="Benda yang menyumbat sungai">
              {WASTE_ITEMS.map((item) => {
                const isSorted = sortedItems.includes(item.id);
                const isSelected = selectedItemId === item.id;
                const isDragging = draggingState?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSorted}
                    className={`waste-item field-note px-2.5 sm:px-3 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-2.5 justify-center min-h-[52px]${
                      isDragging ? ' is-dragging' : ''
                    }${isSelected ? ' is-selected' : ''}${isSorted ? ' is-sorted' : ''}`}
                    data-waste-id={item.id}
                    data-expected-bin={item.expectedBin}
                    data-waste-label={item.label}
                    aria-pressed={isSelected}
                    style={
                      isDragging && draggingState
                        ? { transform: `translate(${draggingState.dx}px, ${draggingState.dy}px) scale(1.06)` }
                        : undefined
                    }
                    onPointerDown={handleItemPointerDown(item.id)}
                    onPointerMove={handleItemPointerMove(item.id)}
                    onPointerUp={handleItemPointerUp(item.id)}
                    onPointerCancel={handleItemPointerCancel}
                    onClick={handleItemClick(item)}
                  >
                    <WasteIcon id={item.id} />
                    <span className="font-bold text-xs sm:text-sm md:text-base">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two Sorting Targets on Riverbank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <button
              ref={recycleBinRef}
              type="button"
              className={`sort-bin touch-btn btn-paper p-4 flex items-center justify-start gap-4 text-left${
                hoveredBin === 'recycle' ? ' is-drop-ready' : ''
              }`}
              data-bin-type="recycle"
              onClick={handleBinClick('recycle')}
            >
              <span
                className="w-14 h-14 rounded-2xl bg-[#D9EDE9] border-2 border-[#293A30] flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <path d="M8 12h16l-2 15H10z" fill="#FAF8F0" stroke="#293A30" strokeWidth="2.2" strokeLinejoin="round" />
                  <path d="M6 12h20M12 12V8h8v4" fill="none" stroke="#293A30" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block font-story text-lg font-bold">Keranjang Daur Ulang</span>
                <span className="block text-sm font-medium opacity-80">Untuk botol plastik &amp; kaleng</span>
              </span>
            </button>

            <button
              ref={compostBinRef}
              type="button"
              className={`sort-bin touch-btn btn-paper p-4 flex items-center justify-start gap-4 text-left${
                hoveredBin === 'compost' ? ' is-drop-ready' : ''
              }`}
              data-bin-type="compost"
              onClick={handleBinClick('compost')}
            >
              <span
                className="w-14 h-14 rounded-2xl bg-[#C8DEA4] border-2 border-[#293A30] flex items-center justify-center shrink-0 overflow-hidden"
                aria-hidden="true"
              >
                <img
                  src="/assets/images/prop-bin-compost.png"
                  alt=""
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain pointer-events-none select-none"
                />
              </span>
              <span>
                <span className="block font-story text-lg font-bold">Tumpukan Kompos</span>
                <span className="block text-sm font-medium opacity-80">Untuk ranting &amp; daun kering</span>
              </span>
            </button>
          </div>
        </div>

        {/* Unlocked Sandbox: Pemicu Hujan */}
        {isClean && (
          <div id="river-sandbox-panel" className="field-note p-5 sm:p-6 mt-6 space-y-4 route-stage-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-story text-xl font-bold m-0">Pemicu Hujan Lembah</h3>
                <p id="river-rain-note" className="text-base mt-1 mb-0">
                  {rainActive
                    ? 'Hujan turun membasahi kolam! Permukaan air naik sedikit dan Kiko si katak melompat ke daun teratai.'
                    : 'Air sungai mengalir tenang dan Teratai Biru mulai mekar. Tekan tombol hujan untuk mengajak Kiko melompat!'}
                </p>
              </div>
              <button
                id="river-rain-toggle"
                type="button"
                aria-pressed={rainActive}
                className={`touch-btn ${rainActive ? 'btn-forest' : 'btn-primary'} px-6 py-3 shrink-0`}
                onClick={() => {
                  const nextRain = !state.sandbox.rainActive;
                  audioManager.playSfx(nextRain ? 'rain' : 'click');
                  updateSandbox({ rainActive: nextRain });
                }}
              >
                {rainActive ? 'Hentikan Hujan' : 'Turunkan Hujan'}
              </button>
            </div>

            <div className="pt-3 border-t border-[#293A30]/15 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#477A59] m-0">
                Hadiah terbuka: Teratai Biru kini mekar di Taman Hadiah!
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
                  onClick={() => setExploreStage('underground')}
                >
                  Lanjut ke Zona 3 →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
