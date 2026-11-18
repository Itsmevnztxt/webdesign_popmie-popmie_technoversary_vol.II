import { useEffect, useRef, useState } from 'react';
import { BADGE_CATALOG, BadgeId, useRimba } from '../state/rimbaStore';

const STICKER_IMAGES: Record<BadgeId, string> = {
  canopy: '/assets/images/sticker-badge-canopy.png',
  river: '/assets/images/sticker-badge-river.png',
  underground: '/assets/images/sticker-badge-underground.png',
  mangrove: '/assets/images/sticker-badge-mangrove.png'
};

function BadgeStickerSvg({ id }: { id: BadgeId }) {
  return (
    <img
      src={STICKER_IMAGES[id]}
      alt=""
      aria-hidden="true"
      width={68}
      height={68}
      className="w-12 h-12 sm:w-[68px] sm:h-[68px] rounded-full object-contain select-none pointer-events-none"
    />
  );
}

interface FieldJournalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FieldJournalDialog({ isOpen, onClose }: FieldJournalDialogProps) {
  const { state, unlockedCount, resetAll } = useRimba();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const resetInitRef = useRef<HTMLButtonElement | null>(null);
  const resetNoRef = useRef<HTMLButtonElement | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setConfirmingReset(false);
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
        window.requestAnimationFrame(() => {
          closeBtnRef.current?.focus();
        });
      }
    } else if (dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      dialog.returnValue = '';
      setConfirmingReset(false);
      onClose();
    };

    dialog.addEventListener('close', handleNativeClose);

    // Fallback for browsers without native closedby="any" support (e.g., Safari)
    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isDialogContent) {
          if (typeof dialog.close === 'function') {
            dialog.close();
          } else {
            handleNativeClose();
          }
        }
      };
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleNativeClose);
      if (handleBackdropClick) {
        dialog.removeEventListener('click', handleBackdropClick);
      }
    };
  }, [onClose]);

  const handleCloseClick = () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      onClose();
    }
  };

  const handleStartReset = () => {
    setConfirmingReset(true);
    window.requestAnimationFrame(() => {
      resetNoRef.current?.focus();
    });
  };

  const handleCancelReset = () => {
    setConfirmingReset(false);
    window.requestAnimationFrame(() => {
      resetInitRef.current?.focus();
    });
  };

  const handleConfirmReset = () => {
    resetAll();
    setConfirmingReset(false);
    window.requestAnimationFrame(() => {
      resetInitRef.current?.focus();
    });
  };

  return (
    <dialog
      ref={dialogRef}
      id="journal-dialog"
      className="journal-dialog"
      aria-labelledby="journal-title"
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="journal-paper">
        <div className="journal-torn-top" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="journal-title" className="font-story text-2xl sm:text-3xl font-bold m-0">
              Buku Catatan Alam
            </h2>
            <p className="text-base mt-1 mb-0 text-[#477A59] font-semibold">
              Kumpulan stiker penemuan dari setiap sudut lembah
            </p>
          </div>
          <button
            ref={closeBtnRef}
            id="journal-close-btn"
            type="button"
            className="touch-btn btn-paper px-4 py-2 shrink-0"
            aria-label="Tutup Buku Catatan"
            autoFocus
            onClick={handleCloseClick}
          >
            Tutup
          </button>
        </div>

        {unlockedCount === 0 && (
          <div id="journal-empty-state" className="field-note-mint p-4 mb-5">
            <p className="text-base font-medium m-0">
              Belum ada lencana di buku ini. Selesaikan misi kecil di setiap zona untuk mengumpulkan stiker alam pertamamu.
            </p>
          </div>
        )}

        <ul id="journal-badges-list" className="grid grid-cols-1 gap-4 list-none p-0 m-0">
          {BADGE_CATALOG.map((badge) => {
            const unlocked = Boolean(state.badges[badge.id]);
            return (
              <li key={badge.id} className={`badge-slot${unlocked ? ' is-unlocked' : ''}`}>
                <div className="flex items-center gap-4 w-full">
                  <div
                    className="badge-seal"
                    style={unlocked ? { backgroundColor: badge.accent } : undefined}
                  >
                    <BadgeStickerSvg id={badge.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-75">{badge.zoneLabel}</p>
                    <h3 className="font-story text-lg font-bold leading-snug mt-0.5">
                      {unlocked ? badge.title : 'Spesimen Belum Terbuka'}
                    </h3>
                  </div>
                </div>
                <p className="text-base leading-relaxed mt-1">
                  {unlocked
                    ? badge.fact
                    : 'Bantu Pico menyelesaikan misi kecil di zona ini untuk membuka stiker dan fakta alamnya.'}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-5 border-t-2 border-[#293A30]/15 flex flex-wrap items-center justify-between gap-3">
          {!confirmingReset ? (
            <button
              ref={resetInitRef}
              id="journal-reset-init"
              type="button"
              className="touch-btn btn-paper px-4 py-2 text-sm"
              onClick={handleStartReset}
            >
              Ulangi Petualangan
            </button>
          ) : (
            <div id="journal-reset-confirm" className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">Hapus semua lencana dan mulai lagi?</span>
              <button
                ref={resetNoRef}
                id="journal-reset-no"
                type="button"
                className="touch-btn btn-paper px-4 py-2 text-sm"
                onClick={handleCancelReset}
              >
                Batal
              </button>
              <button
                id="journal-reset-yes"
                type="button"
                className="touch-btn btn-forest px-4 py-2 text-sm"
                onClick={handleConfirmReset}
              >
                Ya, Ulangi
              </button>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
