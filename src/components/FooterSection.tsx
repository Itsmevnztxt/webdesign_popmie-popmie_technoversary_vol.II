import { AppRoute, useRimba } from '../state/rimbaStore';

interface FooterSectionProps {
  onOpenJournal: () => void;
}

const FOOTER_LINKS: Array<{ route: AppRoute; label: string }> = [
  { route: 'home', label: 'Beranda' },
  { route: 'portal', label: 'Penjelajah' },
  { route: 'jelajah', label: 'Jelajah' },
  { route: 'wawasan', label: 'Wawasan' },
  { route: 'tentang', label: 'Tentang & Kontak' }
];

export function FooterSection({ onOpenJournal }: FooterSectionProps) {
  const { activeRoute, unlockedCount, navigate } = useRimba();

  const waveTopBg =
    activeRoute === 'portal' || activeRoute === 'tentang'
      ? '#DCEEDB'
      : activeRoute === 'jelajah'
        ? '#FAF8F0'
        : '#E8F3E5';

  const handleBackTop = () => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="site-footer-wrap" className="relative" style={{ backgroundColor: waveTopBg }}>
      {/* Organic Earth Soil Curve flowing cleanly beneath page content without overlapping buttons */}
      <div
        id="footer-soil-wave"
        className="w-full overflow-hidden leading-none pointer-events-none select-none relative"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1440 84" preserveAspectRatio="none" className="w-full h-12 sm:h-16 block">
          <path
            d="M0 36 C280 78, 560 12, 860 44 C1120 72, 1300 22, 1440 36 L1440 84 L0 84 Z"
            fill="#463529"
          />
          <path
            d="M0 52 C240 20, 520 72, 820 42 C1080 18, 1280 62, 1440 44 L1440 84 L0 84 Z"
            fill="#32261E"
          />
        </svg>
      </div>

      <footer className="bg-[#32261E] text-[#FAF8F0] pt-6 sm:pt-8 pb-24 lg:pb-16 px-5 sm:px-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-story text-2xl font-bold text-[#F5D77D] m-0">Catatan Perjalananmu</p>
          <p id="footer-discovery-count" className="text-base mt-1 mb-0 text-[#DCEEDB]">
            {unlockedCount} dari 4 penemuan tercatat
          </p>
        </div>

        <nav aria-label="Navigasi Bawah" className="flex flex-wrap gap-4">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.route}
              href={`#${link.route}`}
              className="text-sm sm:text-base font-semibold text-[#DCEEDB] hover:text-[#F5D77D] underline-offset-4 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate(link.route);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap gap-3">
          <button
            id="footer-open-journal"
            type="button"
            className="touch-btn btn-primary px-5 py-2.5"
            onClick={onOpenJournal}
          >
            Lihat Buku Catatan
          </button>
          <button
            id="footer-back-top"
            type="button"
            className="touch-btn btn-paper px-5 py-2.5"
            onClick={handleBackTop}
          >
            Ke Atas ↑
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-[#FAF8F0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm sm:text-base text-[#DCEEDB]/90 m-0">
          RimbaKecil • Ruang Jelajah Alam Anak Indonesia
        </p>
        <p className="text-xs sm:text-sm text-[#DCEEDB]/75 m-0">
          Karya Kompetisi Web Design EcoDigital For Environment
        </p>
      </div>
      </footer>
    </div>
  );
}
