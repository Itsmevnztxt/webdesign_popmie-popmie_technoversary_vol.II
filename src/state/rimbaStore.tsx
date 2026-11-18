import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { audioManager } from '../audio/audioManager';

export type AppRoute = 'home' | 'portal' | 'jelajah' | 'wawasan' | 'tentang';
export type ExploreStage = 'canopy' | 'river' | 'underground' | 'mangrove' | 'sanctuary';
export type ZoneId = 'hero' | 'canopy' | 'river' | 'underground' | 'mangrove' | 'sanctuary';
export type BadgeId = 'canopy' | 'river' | 'underground' | 'mangrove';
export type SunTime = 'pagi' | 'siang' | 'senja';
export type ExplorerAvatar = 'bee' | 'frog' | 'crab' | 'biji';

export interface ExplorerProfile {
  name: string;
  email: string;
  avatar: ExplorerAvatar;
  isGuest: boolean;
  joinedAt: string;
}

export interface BadgeCatalogItem {
  id: BadgeId;
  title: string;
  zoneLabel: string;
  animalRole: string;
  rewardName: string;
  fact: string;
  accent: string;
}

export interface RimbaPersistedState {
  bijiAwake: boolean;
  badges: Record<BadgeId, boolean>;
  sandbox: {
    sunTime: SunTime;
    rainActive: boolean;
    xrayActive: boolean;
    waveActive: boolean;
  };
  passport: ExplorerProfile | null;
  registeredExplorers: ExplorerProfile[];
}

export interface RimbaContextValue {
  state: RimbaPersistedState;
  activeRoute: AppRoute;
  exploreStage: ExploreStage;
  activeZone: ZoneId;
  unlockedCount: number;
  toastMessage: string;
  toastVisible: boolean;
  announcement: string;
  resetCounter: number;
  navigate: (route: AppRoute, options?: { stage?: ExploreStage }) => void;
  setExploreStage: (stage: ExploreStage) => void;
  setBijiAwake: (awake: boolean) => void;
  unlockBadge: (zoneId: BadgeId) => boolean;
  setActiveZone: (zoneId: ZoneId) => void;
  updateSandbox: (patch: Partial<RimbaPersistedState['sandbox']>) => void;
  registerExplorer: (payload: { name: string; email: string; avatar: ExplorerAvatar }) => ExplorerProfile;
  loginExplorer: (payload: { identifier: string; avatar?: ExplorerAvatar }) => {
    ok: boolean;
    profile?: ExplorerProfile;
    error?: string;
  };
  loginAsGuest: () => ExplorerProfile;
  logoutExplorer: () => void;
  resetAll: () => void;
  showToast: (message: string) => void;
  announce: (message: string) => void;
}

export const STORAGE_KEY = 'rimbakecil_progress_v1';

export const VALID_ROUTES: readonly AppRoute[] = ['home', 'portal', 'jelajah', 'wawasan', 'tentang'];

export const BADGE_CATALOG: readonly BadgeCatalogItem[] = [
  {
    id: 'canopy',
    title: 'Bunga Matahari & Lebah Penyerbuk',
    zoneLabel: 'Zona 1: Kanopi Hutan',
    animalRole: 'Lulu si Lebah Penyerbuk',
    rewardName: 'Bibit Bunga Matahari',
    fact: 'Bunga matahari muda memutar kepalanya mengikuti arah sinar matahari. Lebah membantu memindahkan serbuk sari agar bunga bisa menghasilkan biji baru.',
    accent: '#F5D77D'
  },
  {
    id: 'river',
    title: 'Katak Hijau & Sungai Jernih',
    zoneLabel: 'Zona 2: Aliran Sungai',
    animalRole: 'Kiko si Katak Penjaga Sungai',
    rewardName: 'Teratai Biru',
    fact: 'Sampah plastik butuh ratusan tahun untuk hancur dan menyumbat aliran air. Kulit katak menyerap oksigen langsung dari air yang bersih dan sejuk.',
    accent: '#D9EDE9'
  },
  {
    id: 'underground',
    title: 'Pohon Oak & Jaringan Akar',
    zoneLabel: 'Zona 3: Dunia Bawah Tanah',
    animalRole: 'Cici si Cacing & Tunas Oak',
    rewardName: 'Pohon Oak Rimba',
    fact: 'Cacing tanah menggali lorong kecil supaya udara dan air hujan mudah masuk ke akar. Akar menyedot air dan mineral dari tanah lalu mengirimnya ke daun.',
    accent: '#C8DEA4'
  },
  {
    id: 'mangrove',
    title: 'Hutan Mangrove & Bako Kepiting',
    zoneLabel: 'Zona 4: Pesisir Mangrove',
    animalRole: 'Bako si Kepiting Bakau',
    rewardName: 'Hutan Bakau Pesisir',
    fact: 'Akar tunjang bakau saling mengait kuat di pesisir pantai untuk memecah ombak besar sekaligus menjadi tempat berlindung ikan dan kepiting kecil.',
    accent: '#D9EDE9'
  }
];

export function parseRouteFromHash(hash: string): AppRoute {
  const cleaned = hash.replace(/^#\/?/, '').trim().toLowerCase();
  if ((VALID_ROUTES as readonly string[]).includes(cleaned)) {
    return cleaned as AppRoute;
  }
  return 'home';
}

export function createDefaultState(): RimbaPersistedState {
  return {
    bijiAwake: false,
    badges: {
      canopy: false,
      river: false,
      underground: false,
      mangrove: false
    },
    sandbox: {
      sunTime: 'siang',
      rainActive: false,
      xrayActive: false,
      waveActive: false
    },
    passport: null,
    registeredExplorers: []
  };
}

function sanitizeProfile(raw: unknown): ExplorerProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<ExplorerProfile>;
  if (typeof candidate.name !== 'string' || !candidate.name.trim()) return null;
  const avatar: ExplorerAvatar =
    candidate.avatar === 'bee' ||
    candidate.avatar === 'frog' ||
    candidate.avatar === 'crab' ||
    candidate.avatar === 'biji'
      ? candidate.avatar
      : 'biji';
  return {
    name: candidate.name.trim().slice(0, 40),
    email: typeof candidate.email === 'string' ? candidate.email.trim().slice(0, 80) : 'tamu@rimbakecil.id',
    avatar,
    isGuest: Boolean(candidate.isGuest),
    joinedAt: typeof candidate.joinedAt === 'string' ? candidate.joinedAt : new Date().toISOString()
  };
}

export function loadPersistedState(): RimbaPersistedState {
  const base = createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<RimbaPersistedState> | null;
    if (parsed && typeof parsed === 'object') {
      base.bijiAwake = Boolean(parsed.bijiAwake);
      if (parsed.badges && typeof parsed.badges === 'object') {
        base.badges.canopy = Boolean(parsed.badges.canopy);
        base.badges.river = Boolean(parsed.badges.river);
        base.badges.underground = Boolean(parsed.badges.underground);
        base.badges.mangrove = Boolean(parsed.badges.mangrove);
      }
      if (parsed.sandbox && typeof parsed.sandbox === 'object') {
        if (
          parsed.sandbox.sunTime === 'pagi' ||
          parsed.sandbox.sunTime === 'siang' ||
          parsed.sandbox.sunTime === 'senja'
        ) {
          base.sandbox.sunTime = parsed.sandbox.sunTime;
        }
        base.sandbox.rainActive = Boolean(parsed.sandbox.rainActive);
        base.sandbox.xrayActive = Boolean(parsed.sandbox.xrayActive);
        base.sandbox.waveActive = Boolean(parsed.sandbox.waveActive);
      }
      base.passport = sanitizeProfile(parsed.passport);
      if (Array.isArray(parsed.registeredExplorers)) {
        base.registeredExplorers = parsed.registeredExplorers
          .map(sanitizeProfile)
          .filter((p): p is ExplorerProfile => p !== null);
      }
    }
  } catch {
    // Ignore storage blocked or corrupted JSON
  }
  return base;
}

function persistState(next: RimbaPersistedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota or privacy mode errors
  }
}

const RimbaContext = createContext<RimbaContextValue | null>(null);

export function RimbaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RimbaPersistedState>(() => loadPersistedState());
  const [activeRoute, setActiveRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? parseRouteFromHash(window.location.hash) : 'home'
  );
  const [exploreStage, setExploreStageState] = useState<ExploreStage>('canopy');
  const [activeZone, setActiveZoneState] = useState<ZoneId>('hero');
  const [toastMessage, setToastMessage] = useState('Lencana baru terbuka!');
  const [toastVisible, setToastVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [resetCounter, setResetCounter] = useState(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  const toastTimerRef = useRef<number | null>(null);
  const announceRafRef = useRef<number | null>(null);
  const pendingStageRef = useRef<ExploreStage | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = parseRouteFromHash(window.location.hash);
      setActiveRoute(nextRoute);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (activeRoute === 'jelajah') {
      setActiveZoneState(exploreStage);
    } else if (activeRoute === 'home') {
      setActiveZoneState('hero');
    }
  }, [activeRoute, exploreStage]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (announceRafRef.current !== null) {
        window.cancelAnimationFrame(announceRafRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 4200);
  }, []);

  const announce = useCallback((message: string) => {
    setAnnouncement('');
    if (announceRafRef.current !== null) {
      window.cancelAnimationFrame(announceRafRef.current);
    }
    announceRafRef.current = window.requestAnimationFrame(() => {
      setAnnouncement(message);
    });
  }, []);

  const setExploreStage = useCallback((stage: ExploreStage) => {
    setExploreStageState(stage);
    setActiveZoneState(stage);
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const navigate = useCallback(
    (route: AppRoute, options?: { stage?: ExploreStage }) => {
      if (route === 'portal' && options?.stage) {
        pendingStageRef.current = options.stage;
      } else if (route === 'jelajah') {
        const targetStage = options?.stage ?? pendingStageRef.current;
        pendingStageRef.current = null;
        if (targetStage) {
          setExploreStageState(targetStage);
          setActiveZoneState(targetStage);
        }
      } else {
        pendingStageRef.current = null;
      }

      setActiveRoute(route);
      if (typeof window !== 'undefined') {
        const targetHash = `#${route}`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
        if (typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      }
    },
    []
  );

  const setBijiAwake = useCallback((awake: boolean) => {
    setState((prev) => {
      const next: RimbaPersistedState = { ...prev, bijiAwake: Boolean(awake) };
      persistState(next);
      return next;
    });
  }, []);

  const unlockBadge = useCallback(
    (zoneId: BadgeId): boolean => {
      const wasUnlocked = Boolean(stateRef.current.badges[zoneId]);
      const isNew = !wasUnlocked;
      setState((prev) => {
        if (prev.badges[zoneId]) return prev;
        const next: RimbaPersistedState = {
          ...prev,
          badges: { ...prev.badges, [zoneId]: true }
        };
        persistState(next);
        return next;
      });
      if (isNew) {
        audioManager.playSfx('badge');
        const badge = BADGE_CATALOG.find((item) => item.id === zoneId);
        if (badge) {
          showToast(`Lencana & hadiah baru: ${badge.rewardName}!`);
          announce(`Selamat! Lencana baru terbuka: ${badge.title}. Hadiah ${badge.rewardName} kini tumbuh di Taman Hadiah.`);
        }
      }
      return isNew;
    },
    [announce, showToast]
  );

  const setActiveZone = useCallback((zoneId: ZoneId) => {
    setActiveZoneState((prev) => (prev === zoneId ? prev : zoneId));
  }, []);

  const updateSandbox = useCallback((patch: Partial<RimbaPersistedState['sandbox']>) => {
    setState((prev) => {
      const next: RimbaPersistedState = {
        ...prev,
        sandbox: { ...prev.sandbox, ...patch }
      };
      persistState(next);
      return next;
    });
  }, []);

  const registerExplorer = useCallback(
    ({ name, email, avatar }: { name: string; email: string; avatar: ExplorerAvatar }): ExplorerProfile => {
      const profile: ExplorerProfile = {
        name: name.trim().slice(0, 40),
        email: email.trim().slice(0, 80),
        avatar,
        isGuest: false,
        joinedAt: new Date().toISOString()
      };
      setState((prev) => {
        const filtered = prev.registeredExplorers.filter(
          (item) =>
            item.email.toLowerCase() !== profile.email.toLowerCase() &&
            item.name.toLowerCase() !== profile.name.toLowerCase()
        );
        const next: RimbaPersistedState = {
          ...prev,
          passport: profile,
          registeredExplorers: [profile, ...filtered].slice(0, 8)
        };
        persistState(next);
        return next;
      });
      audioManager.playSfx('wake');
      showToast(`Kartu Penjelajah aktif untuk ${profile.name}!`);
      announce(`Kartu Penjelajah berhasil dibuat untuk ${profile.name}.`);
      return profile;
    },
    [announce, showToast]
  );

  const loginExplorer = useCallback(
    ({
      identifier,
      avatar
    }: {
      identifier: string;
      avatar?: ExplorerAvatar;
    }): { ok: boolean; profile?: ExplorerProfile; error?: string } => {
      const needle = identifier.trim().toLowerCase();
      if (!needle) {
        return { ok: false, error: 'Masukkan nama panggilan atau alamat surat rimba dulu ya.' };
      }

      const existing = stateRef.current.registeredExplorers.find(
        (item) => item.name.toLowerCase() === needle || item.email.toLowerCase() === needle
      );

      const profile: ExplorerProfile = existing
        ? { ...existing, avatar: avatar ?? existing.avatar }
        : {
            name: (identifier.includes('@') ? identifier.split('@')[0] || 'Penjelajah' : identifier.trim()).slice(0, 40),
            email: (identifier.includes('@') ? identifier.trim() : `${needle.replace(/\s+/g, '')}@rimbakecil.id`).slice(0, 80),
            avatar: avatar ?? 'biji',
            isGuest: false,
            joinedAt: new Date().toISOString()
          };

      setState((prev) => {
        const filtered = prev.registeredExplorers.filter(
          (item) => item.email.toLowerCase() !== profile.email.toLowerCase()
        );
        const next: RimbaPersistedState = {
          ...prev,
          passport: profile,
          registeredExplorers: [profile, ...filtered].slice(0, 8)
        };
        persistState(next);
        return next;
      });
      audioManager.playSfx('wake');
      showToast(`Selamat datang kembali, ${profile.name}!`);
      announce(`Berhasil masuk sebagai ${profile.name}.`);
      return { ok: true, profile };
    },
    [announce, showToast]
  );

  const loginAsGuest = useCallback((): ExplorerProfile => {
    const guestProfile: ExplorerProfile = {
      name: 'Penjelajah Tamu',
      email: 'tamu@rimbakecil.id',
      avatar: 'biji',
      isGuest: true,
      joinedAt: new Date().toISOString()
    };
    setState((prev) => {
      const next: RimbaPersistedState = {
        ...prev,
        passport: guestProfile
      };
      persistState(next);
      return next;
    });
    audioManager.playSfx('wake');
    showToast('Masuk sebagai Penjelajah Tamu!');
    announce('Masuk cepat sebagai Penjelajah Tamu berhasil. Selamat menjelajah!');
    return guestProfile;
  }, [announce, showToast]);

  const logoutExplorer = useCallback(() => {
    setState((prev) => {
      const next: RimbaPersistedState = {
        ...prev,
        passport: null
      };
      persistState(next);
      return next;
    });
    announce('Kamu keluar dari Kartu Penjelajah.');
  }, [announce]);

  const resetAll = useCallback(() => {
    const fresh = createDefaultState();
    setState((prev) => {
      const next: RimbaPersistedState = {
        ...fresh,
        passport: prev.passport,
        registeredExplorers: prev.registeredExplorers
      };
      persistState(next);
      return next;
    });
    setResetCounter((c) => c + 1);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastVisible(false);
    announce('Semua catatan penemuan berhasil diulang dari awal.');
  }, [announce]);

  const unlockedCount = useMemo(
    () => Object.values(state.badges).filter(Boolean).length,
    [state.badges]
  );

  const value = useMemo<RimbaContextValue>(
    () => ({
      state,
      activeRoute,
      exploreStage,
      activeZone,
      unlockedCount,
      toastMessage,
      toastVisible,
      announcement,
      resetCounter,
      navigate,
      setExploreStage,
      setBijiAwake,
      unlockBadge,
      setActiveZone,
      updateSandbox,
      registerExplorer,
      loginExplorer,
      loginAsGuest,
      logoutExplorer,
      resetAll,
      showToast,
      announce
    }),
    [
      state,
      activeRoute,
      exploreStage,
      activeZone,
      unlockedCount,
      toastMessage,
      toastVisible,
      announcement,
      resetCounter,
      navigate,
      setExploreStage,
      setBijiAwake,
      unlockBadge,
      setActiveZone,
      updateSandbox,
      registerExplorer,
      loginExplorer,
      loginAsGuest,
      logoutExplorer,
      resetAll,
      showToast,
      announce
    ]
  );

  return <RimbaContext.Provider value={value}>{children}</RimbaContext.Provider>;
}

export function useRimba(): RimbaContextValue {
  const ctx = useContext(RimbaContext);
  if (!ctx) {
    throw new Error('useRimba must be used within RimbaProvider');
  }
  return ctx;
}
