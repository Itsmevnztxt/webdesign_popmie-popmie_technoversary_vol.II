import React, { useRef, useState } from 'react';
import { BADGE_CATALOG, ExplorerAvatar, useRimba } from '../state/rimbaStore';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

type PortalTab = 'register' | 'login';

const AVATAR_OPTIONS: Array<{
  id: ExplorerAvatar;
  label: string;
  subtitle: string;
  bg: string;
}> = [
  { id: 'bee', label: 'Lulu Lebah', subtitle: 'Penjaga Kanopi', bg: '#FDF6DC' },
  { id: 'frog', label: 'Kiko Katak', subtitle: 'Penjaga Sungai', bg: '#D9EDE9' },
  { id: 'crab', label: 'Bako Kepiting', subtitle: 'Penjaga Mangrove', bg: '#D9EDE9' },
  { id: 'biji', label: 'Pico Tunas', subtitle: 'Sahabat Tanah', bg: '#DCEEDB' }
];

export function PortalPage() {
  const {
    state,
    unlockedCount,
    registerExplorer,
    loginExplorer,
    loginAsGuest,
    logoutExplorer,
    navigate
  } = useRimba();

  const [tab, setTab] = useState<PortalTab>('register');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAvatar, setRegAvatar] = useState<ExplorerAvatar>('bee');
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string }>({});
  const regNameRef = useRef<HTMLInputElement | null>(null);
  const regEmailRef = useRef<HTMLInputElement | null>(null);
  const tabRegisterRef = useRef<HTMLButtonElement | null>(null);
  const tabLoginRef = useRef<HTMLButtonElement | null>(null);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const loginIdRef = useRef<HTMLInputElement | null>(null);

  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Tulis nama panggilanmu dulu ya.';
    if (trimmed.length < 2) return 'Nama panggilan minimal 2 huruf ya.';
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return 'Tulis alamat surat rimba apa saja, contoh: bima@rimba.id.';
    if (!trimmed.includes('@')) return 'Tambahkan tanda @ pada alamat surat rimbamu, contoh: bima@rimba.id.';
    return undefined;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(regName);
    const emailErr = validateEmail(regEmail);
    setRegErrors({ name: nameErr, email: emailErr });

    if (nameErr) {
      regNameRef.current?.focus();
      return;
    }
    if (emailErr) {
      regEmailRef.current?.focus();
      return;
    }

    registerExplorer({ name: regName, email: regEmail, avatar: regAvatar });
    navigate('jelajah');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setLoginError('Masukkan nama panggilan atau alamat surat rimbamu dulu ya.');
      loginIdRef.current?.focus();
      return;
    }
    const res = loginExplorer({ identifier: loginId });
    if (!res.ok) {
      setLoginError(res.error);
      loginIdRef.current?.focus();
      return;
    }
    setLoginError(undefined);
    navigate('jelajah');
  };

  const handleGuestEnter = () => {
    loginAsGuest();
    navigate('jelajah');
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      audioManager.playSfx('click');
      const nextTab: PortalTab = tab === 'register' ? 'login' : 'register';
      setTab(nextTab);
      if (nextTab === 'register') {
        tabRegisterRef.current?.focus();
      } else {
        tabLoginRef.current?.focus();
      }
    }
  };

  const rankTitle =
    unlockedCount === BADGE_CATALOG.length
      ? 'Penjaga Utama Rimba'
      : unlockedCount >= 1
        ? 'Sahabat Alam Muda'
        : 'Penjelajah Baru';

  return (
    <section
      id="portal-page"
      className="min-h-[calc(100svh-80px)] pt-12 sm:pt-16 pb-20 px-5 sm:px-10 bg-gradient-to-b from-[#FAF8F0] via-[#F2F7EE] to-[#DCEEDB]"
      aria-labelledby="portal-title"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#477A59] m-0">
            Kartu Penjelajah di Perangkatmu
          </p>
          <h1 id="portal-title" className="font-story text-3xl sm:text-5xl font-bold mt-2 mb-3">
            Buat Kartu Penjelajah Alammu!
          </h1>
          <p className="text-base sm:text-lg text-[#293A30]/90 m-0">
            Pilih teman satwamu dan tulis nama panggilanmu untuk menyimpan lencana serta merawat Taman Hadiah.
          </p>
        </div>

        {/* Active Explorer Card if signed in */}
        {state.passport && (
          <div id="active-passport-card" className="field-note-mint p-6 sm:p-7 mb-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-[#FAF8F0] border-2 border-[#293A30] flex items-center justify-center shrink-0">
                  <ExplorerAvatarSvg avatar={state.passport.avatar} size={64} />
                </div>
                <div>
                  <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5D77D] border border-[#293A30]">
                    {state.passport.isGuest ? 'Tamu Rimba' : rankTitle}
                  </span>
                  <h2 className="font-story text-2xl sm:text-3xl font-bold mt-1 mb-0">
                    {state.passport.name}
                  </h2>
                  <p className="text-sm font-medium text-[#293A30]/85 mt-0.5 mb-0">
                    {state.passport.email} &ndash; {unlockedCount}/4 Lencana Terkumpul
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="touch-btn btn-primary px-5 py-2.5"
                  onClick={() => {
                    audioManager.playSfx('click');
                    navigate('jelajah');
                  }}
                >
                  Masuk ke Panggung Jelajah →
                </button>
                <button
                  type="button"
                  className="touch-btn btn-forest px-4 py-2.5 text-sm"
                  onClick={() => {
                    audioManager.playSfx('click');
                    navigate('jelajah', { stage: 'sanctuary' });
                  }}
                >
                  Lihat Taman Hadiah
                </button>
                <button
                  type="button"
                  className="touch-btn btn-paper px-4 py-2.5 text-sm"
                  onClick={logoutExplorer}
                >
                  Ganti Penjelajah
                </button>
              </div>
            </div>

            {/* Mini Reward Sanctuary Preview inside Explorer Card */}
            <div className="pt-4 border-t border-[#293A30]/15">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] mt-0 mb-2.5">
                TANAMAN &amp; SATWA YANG SUDAH KAMU SELAMATKAN
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BADGE_CATALOG.map((item) => {
                  const unlocked = Boolean(state.badges[item.id]);
                  const avatarType =
                    item.id === 'canopy'
                      ? 'bee'
                      : item.id === 'river'
                        ? 'frog'
                        : item.id === 'underground'
                          ? 'worm'
                          : 'crab';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`text-left rounded-2xl border-2 px-3.5 py-2.5 flex items-center gap-3 transition-transform hover:-translate-y-0.5 ${
                        unlocked
                          ? 'bg-[#FAF8F0] border-[#293A30]'
                          : 'bg-[#FAF8F0]/60 border-dashed border-[#293A30]/35 opacity-80'
                      }`}
                      onClick={() => {
                        audioManager.playSfx('click');
                        navigate('jelajah', { stage: unlocked ? 'sanctuary' : item.id });
                      }}
                    >
                      <ExplorerAvatarSvg avatar={avatarType} size={36} />
                      <span className="min-w-0">
                        <span className="block font-bold text-sm truncate text-[#293A30]">
                          {item.rewardName}
                        </span>
                        <span className="block text-xs font-semibold text-[#2F5C40]">
                          {unlocked ? 'Sudah Tumbuh ✓' : 'Belum Terbuka'}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Registration / Switch Card */}
          <div className="lg:col-span-8 field-note p-6 sm:p-8">
            <div
              className="portal-tabs"
              role="tablist"
              aria-label="Pilihan Kartu Penjelajah"
              onKeyDown={handleTabKeyDown}
            >
              <button
                ref={tabRegisterRef}
                id="tab-register"
                type="button"
                role="tab"
                aria-selected={tab === 'register'}
                aria-controls="portal-tabpanel-register"
                tabIndex={tab === 'register' ? 0 : -1}
                className="portal-tab-btn"
                onClick={() => {
                  audioManager.playSfx('click');
                  setTab('register');
                }}
              >
                Daftar Baru
              </button>
              <button
                ref={tabLoginRef}
                id="tab-login"
                type="button"
                role="tab"
                aria-selected={tab === 'login'}
                aria-controls="portal-tabpanel-login"
                tabIndex={tab === 'login' ? 0 : -1}
                className="portal-tab-btn"
                onClick={() => {
                  audioManager.playSfx('click');
                  setTab('login');
                }}
              >
                Masuk
              </button>
            </div>

            {tab === 'register' ? (
              <div
                key="tab-register"
                id="portal-tabpanel-register"
                role="tabpanel"
                aria-labelledby="tab-register"
                className="route-stage-enter"
              >
                <form
                  id="portal-register-form"
                  className="mt-6 space-y-5"
                  noValidate
                  onSubmit={handleRegisterSubmit}
                >
                  <div>
                    <label htmlFor="reg-name" className="block font-bold text-base mb-1.5">
                      Nama Panggilan Penjelajah
                    </label>
                    <p id="reg-name-hint" className="text-sm text-[#293A30]/75 mt-0 mb-2">
                      Boleh nama depan atau julukan alam favoritmu.
                    </p>
                    <input
                      ref={regNameRef}
                      id="reg-name"
                      name="nickname"
                      type="text"
                      required
                      minLength={2}
                      autoComplete="nickname"
                      placeholder="Contoh: Bima"
                      value={regName}
                      aria-invalid={regErrors.name ? 'true' : 'false'}
                      aria-describedby={regErrors.name ? 'reg-name-hint reg-name-error' : 'reg-name-hint'}
                      className={`rimba-input${regErrors.name ? ' is-invalid' : ''}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegName(val);
                        if (regErrors.name && !validateName(val)) {
                          setRegErrors((prev) => ({ ...prev, name: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (regName) {
                          setRegErrors((prev) => ({ ...prev, name: validateName(regName) }));
                        }
                      }}
                    />
                    {regErrors.name && (
                      <p id="reg-name-error" className="rimba-error-msg">
                        <span role="img" aria-label="Error">!</span> {regErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block font-bold text-base mb-1.5">
                      Alamat Surat Rimba (Boleh karanganmu sendiri, contoh: bima@rimba.id)
                    </label>
                    <p id="reg-email-hint" className="text-sm text-[#293A30]/75 mt-0 mb-2">
                      Tidak perlu surat elektronik asli. Cukup buat alamat seru sendiri!
                    </p>
                    <input
                      ref={regEmailRef}
                      id="reg-email"
                      name="email"
                      type="text"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      placeholder="contoh: bima@rimba.id"
                      value={regEmail}
                      aria-invalid={regErrors.email ? 'true' : 'false'}
                      aria-describedby={regErrors.email ? 'reg-email-hint reg-email-error' : 'reg-email-hint'}
                      className={`rimba-input${regErrors.email ? ' is-invalid' : ''}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegEmail(val);
                        if (regErrors.email && !validateEmail(val)) {
                          setRegErrors((prev) => ({ ...prev, email: undefined }));
                        }
                      }}
                      onBlur={() => {
                        if (regEmail) {
                          setRegErrors((prev) => ({ ...prev, email: validateEmail(regEmail) }));
                        }
                      }}
                    />
                    {regErrors.email && (
                      <p id="reg-email-error" className="rimba-error-msg">
                        <span role="img" aria-label="Error">!</span> {regErrors.email}
                      </p>
                    )}
                  </div>

                  <fieldset className="border-0 p-0 m-0">
                    <legend className="font-bold text-base mb-3">Pilih Teman Satwamu</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map((opt) => {
                        const selected = regAvatar === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`avatar-choice-card${selected ? ' is-selected' : ''}`}
                            style={{ backgroundColor: selected ? opt.bg : '#FAF8F0' }}
                          >
                            <input
                              type="radio"
                              name="avatar"
                              value={opt.id}
                              checked={selected}
                              className="visually-hidden"
                              onChange={() => {
                                audioManager.playSfx('click');
                                setRegAvatar(opt.id);
                              }}
                            />
                            <ExplorerAvatarSvg avatar={opt.id} size={52} />
                            <span className="font-story font-bold text-base mt-1">{opt.label}</span>
                            <span className="text-xs font-semibold text-[#2F5C40]">{opt.subtitle}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <button
                    id="portal-register-submit"
                    type="submit"
                    className="touch-btn btn-primary w-full py-3.5 text-lg"
                  >
                    Buat Kartu &amp; Mulai Bertualang →
                  </button>
                </form>
              </div>
            ) : (
              <div
                key="tab-login"
                id="portal-tabpanel-login"
                role="tabpanel"
                aria-labelledby="tab-login"
                className="route-stage-enter"
              >
                <form
                  id="portal-login-form"
                  className="mt-6 space-y-5"
                  noValidate
                  onSubmit={handleLoginSubmit}
                >
                  <div>
                    <label htmlFor="login-identifier" className="block font-bold text-base mb-1.5">
                      Nama Panggilan atau Alamat Surat Rimba
                    </label>
                    <p id="login-id-hint" className="text-sm text-[#293A30]/75 mt-0 mb-2">
                      Masukkan nama atau alamat surat rimba yang pernah kamu buat di perangkat ini.
                    </p>
                    <input
                      ref={loginIdRef}
                      id="login-identifier"
                      name="identifier"
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      required
                      placeholder="Contoh: Bima atau bima@rimba.id"
                      value={loginId}
                      aria-invalid={loginError ? 'true' : 'false'}
                      aria-describedby={loginError ? 'login-id-hint login-id-error' : 'login-id-hint'}
                      className={`rimba-input${loginError ? ' is-invalid' : ''}`}
                      onChange={(e) => {
                        setLoginId(e.target.value);
                        if (loginError && e.target.value.trim()) {
                          setLoginError(undefined);
                        }
                      }}
                    />
                    {loginError && (
                      <p id="login-id-error" className="rimba-error-msg">
                        <span role="img" aria-label="Error">!</span> {loginError}
                      </p>
                    )}
                  </div>

                  {state.registeredExplorers.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-[#477A59] mb-2">
                        Kartu Penjelajah tersimpan di perangkat ini:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {state.registeredExplorers.map((profile) => (
                          <button
                            key={`${profile.name}-${profile.email}`}
                            type="button"
                            className="touch-btn btn-paper px-3.5 py-2 text-sm"
                            onClick={() => {
                              loginExplorer({ identifier: profile.email || profile.name });
                              navigate('jelajah');
                            }}
                          >
                            <ExplorerAvatarSvg avatar={profile.avatar} size={24} />
                            <span>{profile.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    id="portal-login-submit"
                    type="submit"
                    className="touch-btn btn-forest w-full py-3.5 text-lg"
                  >
                    Masuk ke Kartuku →
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Friendly Quick Play Card without registration */}
          <aside className="lg:col-span-4 field-note p-6 bg-[#FDF6DC]">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
              BELUM MAU MENULIS NAMA?
            </p>
            <h2 className="font-story text-2xl font-bold mt-2 mb-2">
              Langsung Main Sekarang!
            </h2>
            <p className="text-base leading-relaxed text-[#293A30]/90 mb-5">
              Ingin langsung membantu Lulu si Lebah, Kiko si Katak, dan Cici si Cacing menumbuhkan Taman Hadiah? Klik tombol di bawah untuk langsung bertualang.
            </p>
            <button
              id="guest-login-btn"
              type="button"
              className="touch-btn btn-forest w-full py-3.5 px-4 text-base"
              onClick={handleGuestEnter}
            >
              Main Sebagai Tamu Rimba →
            </button>
            <p className="text-xs text-[#293A30]/80 mt-3 mb-0">
              Semua lencana dan tanamanmu otomatis tersimpan rapi di perangkat ini.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
