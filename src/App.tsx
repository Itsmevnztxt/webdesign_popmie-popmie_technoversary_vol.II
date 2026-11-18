import { useState } from 'react';
import { RimbaProvider, useRimba } from './state/rimbaStore';
import { SiteHeader } from './components/SiteHeader';
import { CompassNav } from './components/CompassNav';
import { CompanionBiji } from './components/CompanionBiji';
import { AudioToggle } from './components/AudioToggle';
import { HomePage } from './components/HomePage';
import { PortalPage } from './components/PortalPage';
import { ExplorePage } from './components/ExplorePage';
import { WawasanPage } from './components/WawasanPage';
import { AboutContactPage } from './components/AboutContactPage';
import { FooterSection } from './components/FooterSection';
import { FieldJournalDialog } from './components/FieldJournalDialog';

export function RimbaWorld() {
  const { activeRoute, toastMessage, toastVisible, announcement } = useRimba();
  const [journalOpen, setJournalOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className="skip-link visually-hidden">
        Langsung ke konten utama
      </a>
      <div className="paper-grain" aria-hidden="true" />
      <div id="live-announcer" className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Toast Discovery Notification */}
      <div
        id="discovery-toast"
        className={`discovery-toast${toastVisible ? ' is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="14" fill="#FAF8F0" stroke="#293A30" strokeWidth="2.2" />
          <path
            d="M10 16.5l4 4 8-8.5"
            fill="none"
            stroke="#477A59"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span id="discovery-toast-text" className="text-sm sm:text-base">
          {toastMessage}
        </span>
      </div>

      {/* Persistent Multi-View Header */}
      <SiteHeader journalOpen={journalOpen} onOpenJournal={() => setJournalOpen(true)} />

      {/* Left-Side Kompas Lembah (Active inside #jelajah on desktop) */}
      <CompassNav />

      {/* Floating Audio Toggle (Bottom-Left) */}
      <AudioToggle />

      {/* Floating Companion Mascot: Pico (Visible inside #jelajah) */}
      <CompanionBiji />

      {/* Active Hash Route View */}
      <main id="main-content" tabIndex={-1}>
        <div key={activeRoute} className="route-stage-enter">
          {activeRoute === 'home' && <HomePage />}
          {activeRoute === 'portal' && <PortalPage />}
          {activeRoute === 'jelajah' && <ExplorePage />}
          {activeRoute === 'wawasan' && <WawasanPage />}
          {activeRoute === 'tentang' && <AboutContactPage />}
        </div>
      </main>

      <FooterSection onOpenJournal={() => setJournalOpen(true)} />

      <FieldJournalDialog isOpen={journalOpen} onClose={() => setJournalOpen(false)} />
    </>
  );
}

export function App() {
  return (
    <RimbaProvider>
      <RimbaWorld />
    </RimbaProvider>
  );
}

export default App;
