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
    const W = 1400;
    const H = 990;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const ink = '#293A30';
    const leaf = '#477A59';
    const deep = '#2F5C40';
    const gold = '#D9A73C';
    const butter = '#F5D77D';
    const mint = '#DCEEDB';
    const cream = '#FAF8F0';

    // Paper background + gentle warm top wash
    ctx.fillStyle = cream;
    ctx.fillRect(0, 0, W, H);

    const headerGrad = ctx.createRadialGradient(W / 2, 70, 20, W / 2, 70, 620);
    headerGrad.addColorStop(0, 'rgba(220, 238, 219, 0.85)');
    headerGrad.addColorStop(1, 'rgba(250, 248, 240, 0)');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(48, 48, W - 96, 360);

    // Rounded double frame
    ctx.strokeStyle = ink;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(36, 36, W - 72, H - 72, 24);
    ctx.stroke();

    ctx.strokeStyle = leaf;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(54, 54, W - 108, H - 108, 16);
    ctx.stroke();

    // Corner gold medallions tucked cleanly inside the inner corners
    [[74, 74], [W - 74, 74], [74, H - 74], [W - 74, H - 74]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = butter;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Top sprout crest medallion
    ctx.beginPath();
    ctx.arc(W / 2, 114, 28, 0, Math.PI * 2);
    ctx.fillStyle = mint;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = leaf;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W / 2, 129);
    ctx.lineTo(W / 2, 108);
    ctx.stroke();
    ctx.fillStyle = '#A8C99A';
    ctx.beginPath();
    ctx.ellipse(W / 2 - 9, 108, 9, 5.5, -0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = leaf;
    ctx.beginPath();
    ctx.ellipse(W / 2 + 9, 106, 9, 5.5, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Kicker pill
    ctx.fillStyle = butter;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 245, 158, 490, 42, 21);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PENGHARGAAN RESMI  •  4/4 MISI TUNTAS', W / 2, 185);

    // Certificate Title
    ctx.fillStyle = ink;
    ctx.font = 'bold 54px Georgia, "Times New Roman", serif';
    ctx.fillText('Sertifikat Penjaga TamanPico', W / 2, 266);

    ctx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = leaf;
    ctx.fillText('Dengan bangga diberikan kepada:', W / 2, 318);

    // Explorer Name (auto-fit)
    let nameSize = 60;
    ctx.font = `bold ${nameSize}px Georgia, "Times New Roman", serif`;
    while (nameSize > 32 && ctx.measureText(explorerName).width > 860) {
      nameSize -= 2;
      ctx.font = `bold ${nameSize}px Georgia, "Times New Roman", serif`;
    }
    ctx.fillStyle = ink;
    ctx.fillText(explorerName, W / 2, 396);

    // Clean ornamental gold rule below name (no descender collision)
    const ruleHalf = Math.max(180, Math.min(440, ctx.measureText(explorerName).width / 2 + 56));
    ctx.strokeStyle = gold;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - ruleHalf, 422);
    ctx.lineTo(W / 2 - 16, 422);
    ctx.moveTo(W / 2 + 16, 422);
    ctx.lineTo(W / 2 + ruleHalf, 422);
    ctx.stroke();

    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(W / 2, 422, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Citation body
    ctx.fillStyle = ink;
    ctx.font = '21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'Telah membantu Lulu, Kiko, Cici, dan Bako memulihkan keempat sudut alam:',
      W / 2,
      478
    );
    ctx.fillStyle = deep;
    ctx.font = 'bold 21px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      'Kanopi Bunga  •  Sungai Jernih  •  Dunia Bawah Tanah  •  Pesisir Mangrove',
      W / 2,
      514
    );

    // 4 Guardian Seal Cards
    const seals = [
      { label: 'Lulu Lebah', zone: 'Kanopi Bunga', bg: '#FDF6DC' },
      { label: 'Kiko Katak', zone: 'Sungai Jernih', bg: '#D9EDE9' },
      { label: 'Cici Cacing', zone: 'Bawah Tanah', bg: '#DCEEDB' },
      { label: 'Bako Kepiting', zone: 'Pesisir Mangrove', bg: '#D9EDE9' }
    ];
    const cardW = 230;
    const cardGap = 32;
    const totalRowW = seals.length * cardW + (seals.length - 1) * cardGap;
    const startX = (W - totalRowW) / 2;

    seals.forEach((seal, index) => {
      const cx = startX + index * (cardW + cardGap) + cardW / 2;
      const topY = 556;

      ctx.fillStyle = seal.bg;
      ctx.beginPath();
      ctx.roundRect(cx - cardW / 2, topY, cardW, 174, 20);
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner seal circle
      ctx.beginPath();
      ctx.arc(cx, topY + 62, 34, 0, Math.PI * 2);
      ctx.fillStyle = cream;
      ctx.fill();
      ctx.strokeStyle = leaf;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Crisp vector checkmark
      ctx.beginPath();
      ctx.moveTo(cx - 13, topY + 62);
      ctx.lineTo(cx - 4, topY + 72);
      ctx.lineTo(cx + 14, topY + 51);
      ctx.strokeStyle = deep;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.fillStyle = ink;
      ctx.font = 'bold 19px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(seal.label, cx, topY + 128);

      ctx.fillStyle = deep;
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(seal.zone.toUpperCase(), cx, topY + 152);
    });

    // Footer separator
    ctx.strokeStyle = 'rgba(71,122,89,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(130, 774);
    ctx.lineTo(W - 130, 774);
    ctx.stroke();

    const issued = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // 3-column balanced footer metadata
    ctx.textAlign = 'left';
    ctx.fillStyle = leaf;
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DITERBITKAN', 130, 814);
    ctx.fillStyle = ink;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(issued, 130, 844);

    ctx.textAlign = 'center';
    ctx.fillStyle = butter;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 140, 796, 280, 56, 28);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('STATUS RESMI', W / 2, 818);
    ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Penjaga Utama • 4/4 Zona', W / 2, 841);

    ctx.textAlign = 'right';
    ctx.fillStyle = leaf;
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PEMANDU LEMBAH', W - 130, 814);
    ctx.fillStyle = ink;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Pico si Tunas Ek', W - 130, 844);

    ctx.textAlign = 'center';
    ctx.fillStyle = leaf;
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TamanPico • Ruang Jelajah Alam Anak Indonesia', W / 2, 902);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `sertifikat-tamanpico-${explorerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
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
  const issuedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
        <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
              Taman Hadiah TamanPico
            </p>
            <h2 id="sanctuary-title" className="font-story text-3xl sm:text-4xl font-bold mt-1 mb-0">
              {state.passport ? `Taman Pico Milik ${state.passport.name}` : 'Taman Pico Bersama'}
            </h2>
          </div>

          <div className="field-note px-4 py-2.5 inline-flex items-center gap-3 self-start md:self-auto">
            {state.passport && <ExplorerAvatarSvg avatar={state.passport.avatar} size={32} />}
            <span className="font-extrabold text-sm sm:text-base text-[#477A59]">
              {unlockedCount}/4 Hadiah Tumbuh Bersama
            </span>
          </div>
        </div>

        <p className="no-print field-note-mint px-5 py-3.5 text-base font-medium mb-6" aria-live="polite">
          {unlockedCount === 0
            ? 'Taman ini masih menunggu bibit pertamamu. Selesaikan misi di Zona 1, 2, 3, atau 4 untuk menumbuhkan bunga, teratai, pohon oak, dan mangrove!'
            : selectedQuote}
        </p>

        {/* Interactive Sanctuary Panorama SVG */}
        <div className="no-print relative rounded-3xl border-2 border-[#293A30]/25 overflow-hidden bg-[#FAF8F0] shadow-md mb-8">
          <svg
            id="sanctuary-svg"
            viewBox="0 0 900 380"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Ilustrasi Taman Hadiah TamanPico yang menampilkan bunga matahari, teratai biru, pohon oak, dan hutan bakau pesisir"
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
            className="certificate-shell mb-8 route-stage-enter"
            aria-labelledby="certificate-title"
          >
            <div className="certificate-frame">
              <div className="certificate-inner-border" aria-hidden="true" />
              <span className="certificate-corner is-tl" aria-hidden="true" />
              <span className="certificate-corner is-tr" aria-hidden="true" />
              <span className="certificate-corner is-bl" aria-hidden="true" />
              <span className="certificate-corner is-br" aria-hidden="true" />

              <div className="certificate-header">
                <div className="certificate-crest" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 36 36">
                    <path d="M18 28V15" stroke="#477A59" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M18 16C11 10, 6 14, 10 19C12.5 21.5, 16 19, 18 16Z" fill="#A8C99A" stroke="#293A30" strokeWidth="1.9" />
                    <path d="M18 15C25 9, 30 13, 26 18C23.5 20.5, 20 18, 18 15Z" fill="#477A59" stroke="#293A30" strokeWidth="1.9" />
                  </svg>
                </div>
                <p className="certificate-kicker">Penghargaan Resmi &bull; 4/4 Misi Tuntas</p>
                <h3 id="certificate-title" className="certificate-title">
                  Sertifikat Penjaga TamanPico
                </h3>
              </div>

              <div className="certificate-recipient">
                <p className="certificate-lead">Dengan bangga diberikan kepada:</p>
                <p className="certificate-name">{explorerName}</p>
                <div className="certificate-name-rule" aria-hidden="true">
                  <span />
                </div>
                <p className="certificate-body">
                  Telah membantu Lulu si Lebah, Kiko si Katak, Cici si Cacing, dan Bako si Kepiting
                  memulihkan seluruh empat sudut lembah TamanPico hingga kembali seimbang dan lestari!
                </p>
              </div>

              <ul className="certificate-seals" aria-label="Empat zona yang telah diselesaikan">
                {[
                  {
                    label: 'Lulu Lebah',
                    zone: 'Kanopi Bunga',
                    bg: '#FDF6DC',
                    img: '/assets/images/sticker-badge-canopy.png'
                  },
                  {
                    label: 'Kiko Katak',
                    zone: 'Sungai Jernih',
                    bg: '#D9EDE9',
                    img: '/assets/images/sticker-badge-river.png'
                  },
                  {
                    label: 'Cici Cacing',
                    zone: 'Bawah Tanah',
                    bg: '#DCEEDB',
                    img: '/assets/images/sticker-badge-underground.png'
                  },
                  {
                    label: 'Bako Kepiting',
                    zone: 'Pesisir Mangrove',
                    bg: '#D9EDE9',
                    img: '/assets/images/sticker-badge-mangrove.png'
                  }
                ].map((seal) => (
                  <li key={seal.label} className="certificate-seal" style={{ background: seal.bg }}>
                    <span className="certificate-seal-medallion" aria-hidden="true">
                      <img src={seal.img} alt="" width={46} height={46} className="certificate-seal-img" />
                      <span className="certificate-seal-check">✓</span>
                    </span>
                    <span className="certificate-seal-label">{seal.label}</span>
                    <span className="certificate-seal-zone">{seal.zone}</span>
                  </li>
                ))}
              </ul>

              <div className="certificate-footer">
                <div className="certificate-meta">
                  <div className="certificate-meta-cell is-left">
                    <span>Diterbitkan</span>
                    <strong>{issuedDate}</strong>
                  </div>
                  <div className="certificate-meta-stamp">
                    <span>Status Resmi</span>
                    <strong>Penjaga Utama &bull; 4/4 Zona</strong>
                  </div>
                  <div className="certificate-meta-cell is-right">
                    <span>Pemandu Lembah</span>
                    <strong>Pico si Tunas Ek</strong>
                  </div>
                </div>
                <p className="certificate-brand">TamanPico &bull; Ruang Jelajah Alam Anak Indonesia</p>
              </div>
            </div>

            <div className="certificate-actions no-print">
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
          </section>
        ) : (
          <div className="no-print field-note p-4 sm:p-5 bg-[#FDF6DC] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm sm:text-base font-semibold text-[#293A30] m-0">
              Selesaikan semua <strong>4 zona</strong> ({unlockedCount}/4 selesai) untuk membuka <strong>Sertifikat Penjaga TamanPico</strong> atas namamu!
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
        <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          <div className="no-print mt-8 text-center">
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
