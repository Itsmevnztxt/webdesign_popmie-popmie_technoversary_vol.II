import { useEffect, useState } from 'react';
import { BADGE_CATALOG, ZoneId, useRimba } from '../state/rimbaStore';
import { BijiExpression, BijiSvg } from './BijiSvg';

const ZONE_SCRIPTS: Record<ZoneId, { quest: string; hint: string; done: string }> = {
  hero: {
    quest: 'Hoaaam... halo, Penjelajah! Ada empat sudut lembah yang butuh bantuan kita hari ini.',
    hint: 'Ketuk tombol Mulai Petualangan untuk membuka Kartu Penjelajah.',
    done: 'Wah, semua sudut lembah sudah pulih! Yuk kunjungi Taman Hadiah.'
  },
  canopy: {
    quest: 'Lihat, awan kelabu menutupi matahari! Bantu Lulu menyingkirkan awan supaya bunga bisa berjemur.',
    hint: 'Klik atau seret kedua awan kelabu ke samping, lalu arahkan Lulu si lebah ke tengah bunga matahari.',
    done: 'Hore! Bibit Bunga Matahari kini mekar di Taman Hadiah. Putar waktu matahari dari pagi sampai senja!'
  },
  river: {
    quest: 'Aliran sungai tersumbat sampah dan ranting kering! Bantu Kiko memilah ke keranjang daur ulang atau kompos.',
    hint: 'Botol dan kaleng masuk ke Keranjang Daur Ulang. Ranting dan daun kering masuk ke Tumpukan Kompos.',
    done: 'Sungai kembali jernih dan Teratai Biru mulai mekar! Tekan tombol hujan untuk melihat Kiko melompat.'
  },
  underground: {
    quest: 'Biji pohon oak terjebak di tanah yang keras! Bantu Cici mengetuk gumpalan tanah untuk menggemburkannya.',
    hint: 'Pecahkan ketiga gumpalan tanah keras, panggil Cici si cacing tanah, lalu siram bijinya.',
    done: 'Pohon Oak Rimba tumbuh dengan akar kuat! Geser kaca pembesar akar untuk mengintip aliran air.'
  },
  mangrove: {
    quest: 'Pesisir mangrove tertutup jaring dan plastik laut! Bantu Bako membersihkan pantai dan menanam bibit bakau.',
    hint: 'Ketuk jaring nelayan serta botol plastik untuk membersihkan lumpur, lalu tanam ketiga bibit bakau.',
    done: 'Hutan Bakau tumbuh kokoh bersama Bako! Coba tombol uji ombak pasang untuk melihat akarnya menahan ombak.'
  },
  sanctuary: {
    quest: 'Ini Taman Hadiahmu! Selesaikan misi di Zona 1, 2, 3, dan 4 untuk menumbuhkan keempat hadiah alam.',
    hint: 'Ketuk tanaman atau satwa yang sudah tumbuh di taman untuk mendengar kabar gembira mereka.',
    done: 'Seluruh Taman Hadiah mekar penuh! Kamu kini resmi menjadi Penjaga Utama TamanPico!'
  }
};

export function CompanionBiji() {
  const { state, activeRoute, activeZone, unlockedCount, resetCounter } = useRimba();
  const [showingHint, setShowingHint] = useState(false);
  const [bubbleMinimized, setBubbleMinimized] = useState(false);

  useEffect(() => {
    setShowingHint(false);
    setBubbleMinimized(false);
  }, [activeZone, activeRoute, resetCounter]);

  const hidden = activeRoute !== 'jelajah';
  const script = ZONE_SCRIPTS[activeZone] || ZONE_SCRIPTS.canopy;
  const isUnlocked =
    activeZone === 'sanctuary'
      ? unlockedCount === BADGE_CATALOG.length
      : activeZone !== 'hero' && Boolean(state.badges[activeZone]);

  let expression: BijiExpression = 'worried';
  let message = script.quest;

  if (showingHint && !isUnlocked) {
    expression = 'hint';
    message = script.hint;
  } else if (isUnlocked) {
    expression = 'celebrate';
    message = script.done;
  }

  const handleAvatarClick = () => {
    if (bubbleMinimized) {
      setBubbleMinimized(false);
      return;
    }
    if (!isUnlocked && !showingHint) {
      setShowingHint(true);
    } else {
      setBubbleMinimized(true);
      setShowingHint(false);
    }
  };

  return (
    <aside
      id="biji-companion"
      className={`biji-companion${hidden ? ' is-hidden' : ''}`}
      aria-label="Pemandu Pico"
      aria-hidden={hidden}
    >
      {!bubbleMinimized && (
        <div id="companion-biji-bubble" className="biji-bubble">
          <div className="flex items-start justify-between gap-2">
            <p id="companion-biji-text" className="text-sm sm:text-base font-medium m-0">
              {message}
            </p>
            <button
              type="button"
              tabIndex={hidden ? -1 : 0}
              aria-label="Sembunyikan pesan Pico"
              className="biji-close-btn shrink-0 w-7 h-7 rounded-full border border-[#293A30]/30 bg-[#DCEEDB]/60 text-[#293A30] text-xs font-extrabold flex items-center justify-center hover:bg-[#F5D77D]"
              onClick={() => {
                setBubbleMinimized(true);
                setShowingHint(false);
              }}
            >
              ✕
            </button>
          </div>
          {!isUnlocked && (
            <button
              id="companion-hint-toggle"
              type="button"
              tabIndex={hidden ? -1 : 0}
              className="mt-1 min-h-[44px] inline-flex items-center gap-1 text-xs sm:text-sm font-bold underline decoration-2 underline-offset-4 text-[#477A59]"
              onClick={() => setShowingHint((prev) => !prev)}
            >
              {showingHint ? 'Kembali' : 'Butuh petunjuk?'}
            </button>
          )}
        </div>
      )}
      <button
        id="companion-biji-btn"
        type="button"
        tabIndex={hidden ? -1 : 0}
        className="biji-avatar-btn"
        aria-label={
          bubbleMinimized
            ? 'Tampilkan pesan Pico'
            : 'Pico, pemandu lembah. Klik untuk menyembunyikan atau membuka pesan'
        }
        onClick={handleAvatarClick}
      >
        <BijiSvg id="companion-biji-svg" expression={expression} variant="companion" />
      </button>
    </aside>
  );
}
