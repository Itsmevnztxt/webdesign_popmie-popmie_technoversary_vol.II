import { useEffect, useRef, useState } from 'react';
import { AppRoute, useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';

interface NavLinkItem {
  route: AppRoute;
  href: string;
  label: string;
}

const NAV_LINKS: readonly NavLinkItem[] = [
  { route: 'home', href: '#home', label: 'Beranda' },
  { route: 'portal', href: '#portal', label: 'Penjelajah' },
  { route: 'jelajah', href: '#jelajah', label: 'Jelajah' },
  { route: 'wawasan', href: '#wawasan', label: 'Wawasan' },
  { route: 'tentang', href: '#tentang', label: 'Tentang & Kontak' }
];

interface SiteHeaderProps {
  journalOpen: boolean;
  onOpenJournal: () => void;
}

export function SiteHeader({ journalOpen, onOpenJournal }: SiteHeaderProps) {
  const { state, activeRoute, unlockedCount, navigate } = useRimba();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

  const handleLinkClick = (route: AppRoute) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(route);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a
          href="#home"
          className="site-brand"
          onClick={handleLinkClick('home')}
        >
          <span className="site-brand-mark" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#DCEEDB" stroke="#293A30" strokeWidth="2.2" />
              <path d="M18 27V15" stroke="#477A59" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M18 16C12 10, 7 14, 11 19C13 21, 16 19, 18 16Z" fill="#A8C99A" stroke="#293A30" strokeWidth="1.8" />
              <path d="M18 15C24 9, 29 13, 25 18C23 20, 20 18, 18 15Z" fill="#477A59" stroke="#293A30" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="font-story font-bold text-xl sm:text-2xl text-[#293A30]">RimbaKecil</span>
        </a>

        <nav ref={navRef} className="site-nav" aria-label="Navigasi Utama">
          <button
            ref={toggleBtnRef}
            type="button"
            className="touch-btn btn-paper site-menu-toggle px-3 py-2 text-sm"
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="#293A30" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span>Menu</span>
          </button>

          <ul id="site-nav-menu" className={`site-nav-list${menuOpen ? ' is-open' : ''}`}>
            {NAV_LINKS.map((item) => {
              const isCurrent = activeRoute === item.route;
              return (
                <li key={item.route}>
                  <a
                    href={item.href}
                    className="site-nav-link"
                    aria-current={isCurrent ? 'page' : undefined}
                    onClick={handleLinkClick(item.route)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header-actions">
          {state.passport ? (
            <a
              href="#portal"
              className="passport-chip"
              aria-label={`Kartu Penjelajah: ${state.passport.name}`}
              onClick={handleLinkClick('portal')}
            >
              <ExplorerAvatarSvg avatar={state.passport.avatar} size={28} />
              <span className="hidden md:inline font-bold text-sm truncate max-w-[110px]">
                {state.passport.name}
              </span>
            </a>
          ) : (
            <a
              href="#portal"
              className="passport-chip passport-chip-guest"
              onClick={handleLinkClick('portal')}
            >
              <span className="font-bold text-sm">Buat Kartu</span>
            </a>
          )}

          <button
            id="journal-open-btn"
            type="button"
            className="hud-journal-btn"
            aria-haspopup="dialog"
            aria-expanded={journalOpen}
            aria-controls="journal-dialog"
            onClick={onOpenJournal}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="3" width="16" height="18" rx="3" fill="#DCEEDB" stroke="#293A30" strokeWidth="2" />
              <path d="M8 3v18M11.5 9h5M11.5 13h4" stroke="#293A30" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="hidden md:inline">Buku Catatan</span>
            <span id="journal-count" className="hud-journal-count">
              {unlockedCount}/4 Penemuan
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
