import { useState } from 'react';
import { BADGE_CATALOG, BadgeId, useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

const SANCTUARY_QUOTES: Record<BadgeId, string> = {
  canopy: 'Lulu: "Bunga Matahari mekar cerah dan serbuk sari tersebar ke seluruh padang!"',
  river: 'Kiko: "Teratai Biru mekar di atas sungai jernih. Ikan dan katak bisa berenang lega!"',
  underground: 'Cici: "Akar Pohon Oak menyerap air hujan dari tanah gembur dan menumbuhkan daun baru!"',
  mangrove: 'Bako: "Akar tunjang bakau berdiri kokoh menahan ombak laut dan menjaga pesisir tetap teduh!"'
};

function drawAndDownloadCertificate(explorerName: string) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Paper cream background
    ctx.fillStyle = '#FAF8F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Soft mint frame tint
    ctx.fillStyle = '#DCEEDB';
    ctx.fillRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Cream inner certificate card
    ctx.fillStyle = '#FAF8F0';
    ctx.fillRect(58, 58, canvas.width - 116, canvas.height - 116);

    ctx.strokeStyle = '#293A30';
    ctx.lineWidth = 6;
    ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

    ctx.strokeStyle = '#477A59';
    ctx.lineWidth = 3;
    ctx.strokeRect(76, 76, canvas.width - 152, canvas.height - 152);

    // Header badge
    ctx.fillStyle = '#F5D77D';
    ctx.beginPath();
    ctx.roundRect(410, 120, 380, 46, 23);
    ctx.fill();
    ctx.strokeStyle = '#293A30';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#293A30';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PENGHARGAAN RIMBAKECIL', 600, 150);

    // Title
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillStyle = '#293A30';
    ctx.fillText('Sertifikat Penjaga RimbaKecil', 600, 240);

    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#477A59';
    ctx.fillText('Dengan bangga diberikan kepada:', 600, 305);

    // Explorer Name
    ctx.font = 'bold 62px Georgia, serif';
    ctx.fillStyle = '#293A30';
    ctx.fillText(explorerName, 600, 392);

    ctx.strokeStyle = '#F5D77D';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(310, 418);
    ctx.lineTo(890, 418);
    ctx.stroke();

    // Citation text
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#293A30';
    ctx.fillText('Telah menuntaskan seluruh 4 misi menjaga keseimbangan alam:', 600, 485);
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#2F5C40';
    ctx.fillText('Kanopi Bunga • Sungai Jernih • Dunia Bawah Tanah • Pesisir Mangrove', 600, 526);

    // 4 Seals along bottom
    const seals = [
      { label: 'Lulu Lebah', bg: '#FDF6DC', x: 255 },
      { label: 'Kiko Katak', bg: '#D9EDE9', x: 485 },
      { label: 'Cici Cacing', bg: '#DCEEDB', x: 715 },
      { label: 'Bako Kepiting', bg: '#D9EDE9', x: 945 }
    ];
    seals.forEach((seal) => {
      ctx.fillStyle = seal.bg;
      ctx.beginPath();
      ctx.arc(seal.x, 648, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#293A30';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#293A30';
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('LULUS ✓', seal.x, 646);
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#477A59';
      ctx.fillText(seal.label, seal.x, 670);
    });

    ctx.fillStyle = '#293A30';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('RimbaKecil • Ruang Jelajah Alam Anak Indonesia', 600, 756);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `sertifikat-rimbakecil-${explorerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    return false;
  }
}

export function RewardSanctuary() {
  const { state, unlockedCount, setExploreStage, navigate, showToast } = useRimba();
  const [selectedQuote, setSelectedQuote] = useState<string>(
    'Ketuk tanaman atau satwa yang sudah tumbuh di Taman Hadiah untuk mendengar kabar mereka!'
  );

  const hasCanopy = Boolean(state.badges.canopy);
  const hasRiver = Boolean(state.badges.river);
  const hasUnderground = Boolean(state.badges.underground);
  const hasMangrove = Boolean(state.badges.mangrove);
  const allCompleted = unlockedCount === BADGE_CATALOG.length;
  const explorerName = state.passport?.name || 'Penjelajah Cilik';

  const handleInspectReward = (id: BadgeId) => {
    audioManager.playSfx('pollinate');
    setSelectedQuote(SANCTUARY_QUOTES[id]);
  };

  const handleRewardKeyDown = (id: BadgeId) => (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter') handleInspectReward(id);
    if (e.key === ' ') e.preventDefault();
  };

  const handleRewardKeyUp = (id: BadgeId) => (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === ' ') handleInspectReward(id);
  };

  const handleDownloadCertificate = () => {
    audioManager.playSfx('badge');
    const ok = drawAndDownloadCertificate(explorerName);
    if (ok) {
      showToast(`Sertifikat atas nama ${explorerName} berhasil diunduh!`);
    } else {
      showToast(`Sertifikat siap dicetak atas nama ${explorerName}!`);
    }
  };

  const handlePrintCertificate = () => {
    audioManager.playSfx('click');
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <section
      id="taman-hadiah"
      className="world-section py-10 sm:py-14 bg-gradient-to-b from-[#E8F3E5] via-[#FAF8F0] to-[#DCEEDB]"
      aria-labelledby="sanctuary-title"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-10 explore-compass-pad">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
              Taman Hadiah RimbaKecil
            </p>
            <h2 id="sanctuary-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              {state.passport ? `Taman Rimba Milik ${state.passport.name}` : 'Taman Rimba Bersama'}
            </h2>
          </div>

          <div className="field-note px-4 py-2.5 inline-flex items-center gap-3 self-start md:self-auto">
            {state.passport && <ExplorerAvatarSvg avatar={state.passport.avatar} size={32} />}
            <span className="font-extrabold text-sm sm:text-base text-[#477A59]">
              {unlockedCount}/4 Hadiah Tumbuh Bersama
            </span>
          </div>
        </div>

        <p className="field-note-mint px-5 py-3.5 text-base font-medium mb-6" aria-live="polite">
          {unlockedCount === 0
            ? 'Taman ini masih menunggu bibit pertamamu. Selesaikan misi di Zona 1, 2, 3, atau 4 untuk menumbuhkan bunga, teratai, pohon oak, dan mangrove!'
            : selectedQuote}
        </p>

        {/* Interactive Sanctuary Panorama SVG */}
        <div className="relative rounded-3xl border-2 border-[#293A30]/25 overflow-hidden bg-[#FAF8F0] shadow-md mb-8">
          <svg
            id="sanctuary-svg"
            viewBox="0 0 900 380"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Ilustrasi Taman Hadiah RimbaKecil yang menampilkan bunga matahari, teratai biru, pohon oak, dan hutan bakau pesisir"
          >
            {/* Sky & Panorama Hills */}
            <rect width="900" height="380" fill="#FAF8F0" />
            <image
              href="/assets/images/sanctuary-panorama-bg.png"
              x="0"
              y="0"
              width="900"
              height="380"
              preserveAspectRatio="xMidYMax slice"
            />

            {/* Sanctuary Pond (right side) */}
            <image
              href={hasRiver ? '/assets/images/sanctuary-pond-clean.png' : '/assets/images/sanctuary-pond-dirty.png'}
              x="518"
              y="246"
              width="346"
              height="148"
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Reward 3: Pohon Oak Rimba & Cici (center) */}
            {hasUnderground ? (
              <g
                id="sanctuary-oak"
                role="button"
                tabIndex={0}
                aria-label="Pohon Oak Rimba dan Cici si Cacing. Ketuk untuk mendengar kabar mereka"
                style={{ cursor: 'pointer' }}
                onClick={() => handleInspectReward('underground')}
                onKeyDown={handleRewardKeyDown('underground')}
                onKeyUp={handleRewardKeyUp('underground')}
              >
                <image
                  href="/assets/images/prop-oak-canopy.png"
                  x="338"
                  y="92"
                  width="196"
                  height="196"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-earthworm.png"
                  x="318"
                  y="244"
                  width="78"
                  height="78"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            ) : (
              <g opacity="0.45">
                <ellipse cx="436" cy="292" rx="34" ry="12" fill="#5C4636" stroke="#293A30" strokeDasharray="5 4" strokeWidth="2" />
                <text x="436" y="272" textAnchor="middle" fontSize="13" fontWeight="700" fill="#293A30">
                  Slot Pohon Oak
                </text>
              </g>
            )}

            {/* Reward 1: Bibit Bunga Matahari & Lulu (left side) */}
            {hasCanopy ? (
              <g
                id="sanctuary-sunflower"
                role="button"
                tabIndex={0}
                aria-label="Bibit Bunga Matahari dan Lulu si Lebah. Ketuk untuk mendengar kabar mereka"
                style={{ cursor: 'pointer' }}
                onClick={() => handleInspectReward('canopy')}
                onKeyDown={handleRewardKeyDown('canopy')}
                onKeyUp={handleRewardKeyUp('canopy')}
              >
                <image
                  href="/assets/images/prop-sunflower-stem.png"
                  x="132"
                  y="182"
                  width="116"
                  height="162"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-sunflower-head.png"
                  x="146"
                  y="134"
                  width="88"
                  height="88"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-pollinator-bee.png"
                  x="224"
                  y="128"
                  width="58"
                  height="50"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            ) : (
              <g opacity="0.45">
                <ellipse cx="190" cy="312" rx="28" ry="10" fill="#A8C99A" stroke="#293A30" strokeDasharray="5 4" strokeWidth="2" />
                <text x="190" y="294" textAnchor="middle" fontSize="13" fontWeight="700" fill="#293A30">
                  Slot Bunga Matahari
                </text>
              </g>
            )}

            {/* Reward 2: Teratai Biru & Kiko (pond center-right) */}
            {hasRiver ? (
              <g
                id="sanctuary-lotus"
                role="button"
                tabIndex={0}
                aria-label="Teratai Biru dan Kiko si Katak. Ketuk untuk mendengar kabar mereka"
                style={{ cursor: 'pointer' }}
                onClick={() => handleInspectReward('river')}
                onKeyDown={handleRewardKeyDown('river')}
                onKeyUp={handleRewardKeyUp('river')}
              >
                <image
                  href="/assets/images/prop-blue-lotus.png"
                  x="554"
                  y="278"
                  width="76"
                  height="76"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-lilypad-frog.png"
                  x="646"
                  y="286"
                  width="92"
                  height="92"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-frog-pond.png"
                  x="660"
                  y="264"
                  width="64"
                  height="64"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            ) : (
              <g opacity="0.45">
                <text x="650" y="322" textAnchor="middle" fontSize="13" fontWeight="700" fill="#293A30">
                  Slot Teratai Biru &amp; Kiko
                </text>
              </g>
            )}

            {/* Reward 4: Hutan Bakau Pesisir & Bako (far right coastal bank) */}
            {hasMangrove ? (
              <g
                id="sanctuary-mangrove"
                role="button"
                tabIndex={0}
                aria-label="Hutan Bakau Pesisir dan Bako si Kepiting. Ketuk untuk mendengar kabar mereka"
                style={{ cursor: 'pointer' }}
                onClick={() => handleInspectReward('mangrove')}
                onKeyDown={handleRewardKeyDown('mangrove')}
                onKeyUp={handleRewardKeyUp('mangrove')}
              >
                <image
                  href="/assets/images/prop-mangrove-tree.png"
                  x="728"
                  y="156"
                  width="156"
                  height="156"
                  preserveAspectRatio="xMidYMid meet"
                />
                <image
                  href="/assets/images/prop-crab-bako.png"
                  x="764"
                  y="290"
                  width="72"
                  height="58"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>
            ) : (
              <g opacity="0.45">
                <ellipse cx="810" cy="306" rx="34" ry="11" fill="#A8C99A" stroke="#293A30" strokeDasharray="5 4" strokeWidth="2" />
                <text x="810" y="286" textAnchor="middle" fontSize="13" fontWeight="700" fill="#293A30">
                  Slot Bakau Pesisir
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Official Explorer Certificate unlocked at 4/4 */}
        {allCompleted ? (
          <section
            id="rimba-certificate-card"
            className="field-note p-6 sm:p-8 bg-[#FAF8F0] mb-8 border-4 border-[#293A30] shadow-[0_8px_0_#477A59] route-stage-enter"
            aria-labelledby="certificate-title"
          >
            <div className="border-2 border-dashed border-[#477A59]/60 rounded-2xl p-5 sm:p-7 text-center space-y-4">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#F5D77D] border-2 border-[#293A30]">
                Penghargaan Resmi &bull; 4/4 Misi Tuntas
              </span>
              <h3 id="certificate-title" className="font-story text-2xl sm:text-4xl font-bold m-0 text-[#293A30]">
                Sertifikat Penjaga RimbaKecil
              </h3>
              <p className="text-base text-[#2F5C40] font-semibold m-0">
                Dengan bangga diberikan kepada:
              </p>
              <p className="font-story text-3xl sm:text-4xl font-bold text-[#293A30] underline decoration-[#F5D77D] decoration-4 underline-offset-8 m-0">
                {explorerName}
              </p>
              <p className="text-base leading-relaxed text-[#293A30]/90 max-w-2xl mx-auto m-0 pt-2">
                Telah membantu Lulu si Lebah, Kiko si Katak, Cici si Cacing, dan Bako si Kepiting memulihkan seluruh empat sudut lembah RimbaKecil hingga kembali seimbang dan lestari!
              </p>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  id="certificate-download-btn"
                  type="button"
                  className="touch-btn btn-primary px-5 py-3 text-sm sm:text-base"
                  onClick={handleDownloadCertificate}
                >
                  Unduh Sertifikat (PNG) ↓
                </button>
                <button
                  id="certificate-print-btn"
                  type="button"
                  className="touch-btn btn-paper px-5 py-3 text-sm sm:text-base"
                  onClick={handlePrintCertificate}
                >
                  Cetak Sertifikat
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="field-note p-4 sm:p-5 bg-[#FDF6DC] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm sm:text-base font-semibold text-[#293A30] m-0">
              Selesaikan semua <strong>4 zona</strong> ({unlockedCount}/4 selesai) untuk membuka <strong>Sertifikat Penjaga RimbaKecil</strong> atas namamu!
            </p>
            <button
              type="button"
              className="touch-btn btn-paper px-4 py-2 text-sm shrink-0"
              onClick={() => {
                const nextTodo = !hasCanopy
                  ? 'canopy'
                  : !hasRiver
                    ? 'river'
                    : !hasUnderground
                      ? 'underground'
                      : 'mangrove';
                setExploreStage(nextTodo);
              }}
            >
              Lanjutkan Misi Berikutnya →
            </button>
          </div>
        )}

        {/* 4 Reward / Badge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BADGE_CATALOG.map((badge) => {
            const unlocked = Boolean(state.badges[badge.id]);
            return (
              <article
                key={badge.id}
                className={`field-note p-5 flex flex-col justify-between gap-4${
                  unlocked ? ' bg-[#DCEEDB]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40]">
                      {badge.zoneLabel}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-[#293A30] ${
                        unlocked ? 'bg-[#F5D77D]' : 'bg-[#FAF8F0]'
                      }`}
                    >
                      {unlocked ? 'Tumbuh' : 'Terkunci'}
                    </span>
                  </div>
                  <h3 className="font-story text-xl font-bold mt-1 mb-1">
                    {badge.rewardName}
                  </h3>
                  <p className="text-sm font-semibold text-[#2F5C40] mt-0 mb-2">
                    Peran: {badge.animalRole}
                  </p>
                  <p className="text-sm leading-relaxed text-[#293A30]/90 m-0">
                    {unlocked
                      ? badge.fact
                      : 'Selesaikan misi zona ini untuk menyelamatkan bibit dan membuka lencana stiker.'}
                  </p>
                </div>

                <button
                  type="button"
                  className={`touch-btn ${unlocked ? 'btn-paper' : 'btn-primary'} px-4 py-2 text-sm w-full`}
                  onClick={() => {
                    audioManager.playSfx('click');
                    setExploreStage(badge.id);
                  }}
                >
                  {unlocked ? 'Kunjungi Lagi Zona Ini' : 'Mainkan Misi Zona Ini →'}
                </button>
              </article>
            );
          })}
        </div>

        {!state.passport && (
          <div className="mt-8 text-center">
            <button
              type="button"
              className="touch-btn btn-paper px-5 py-2.5 text-sm"
              onClick={() => navigate('portal')}
            >
              Pasang Namamu di Kartu Penjelajah →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
