import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { STORAGE_KEY } from './state/rimbaStore';
import { audioManager } from './audio/audioManager';

beforeEach(() => {
  window.location.hash = '';
  audioManager.setEnabled(false);
  vi.restoreAllMocks();
});

describe('TamanPico Multi-View Refactored Application', () => {
  it('renders #home landing page with sleeping Biji, environmental stories, and navigates to #portal on Mulai Petualangan', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'TamanPico' })).toBeInTheDocument();
    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();
    expect(screen.getByText(/Tiga Sudut Alam yang Menunggu Tanganmu/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Lulu si Lebah Penyerbuk/i })).toBeInTheDocument();

    const heroBijiSvg = document.getElementById('hero-biji-svg');
    expect(heroBijiSvg).toHaveAttribute('data-state', 'sleeping');
    expect(document.getElementById('hero-biji-bubble')).toHaveTextContent(
      /Zzz\.\.\. ketuk Pico di bawah pohon/i
    );

    const heroBijiBtn = document.getElementById('hero-biji-btn')!;
    await user.click(heroBijiBtn);

    expect(heroBijiSvg).toHaveAttribute('data-state', 'happy');
    expect(document.getElementById('hero-biji-bubble')).toHaveTextContent(/Hoaaam\.\.\. halo, Penjelajah!/i);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.bijiAwake).toBe(true);

    await user.click(screen.getByRole('button', { name: /Mulai Petualangan/i }));
    expect(window.location.hash).toBe('#portal');
    expect(screen.getByRole('heading', { name: /Buat Kartu Penjelajah Alammu!/i })).toBeInTheDocument();
  });

  it('supports #portal simulated register, login, validation, and quick guest entry', async () => {
    const user = userEvent.setup();
    window.location.hash = '#portal';
    render(<App />);

    // Submit empty form -> focuses #reg-name and shows error
    await user.click(document.getElementById('portal-register-submit')!);
    expect(document.getElementById('reg-name-error')).toBeInTheDocument();
    expect(document.getElementById('reg-name')).toHaveFocus();

    // Fill nickname & invalid email without @
    await user.type(document.getElementById('reg-name')!, 'Bima');
    await user.type(document.getElementById('reg-email')!, 'bimatanpaat');
    await user.click(document.getElementById('portal-register-submit')!);
    expect(document.getElementById('reg-email-error')).toBeInTheDocument();

    // Fix email with playful domain and select frog avatar
    await user.clear(document.getElementById('reg-email')!);
    await user.type(document.getElementById('reg-email')!, 'bima@rimba.id');
    await user.click(screen.getByLabelText(/Kiko Katak/i));
    await user.click(document.getElementById('portal-register-submit')!);

    expect(window.location.hash).toBe('#jelajah');
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.passport.name).toBe('Bima');
    expect(saved.passport.avatar).toBe('frog');
    expect(saved.passport.isGuest).toBe(false);

    // Go back to #portal, logout, and test Main Sebagai Tamu Rimba
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Penjelajah' }));
    expect(document.getElementById('active-passport-card')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ganti Penjelajah/i }));
    expect(document.getElementById('active-passport-card')).not.toBeInTheDocument();

    // Test Login tab with previously registered explorer
    await user.click(screen.getByRole('tab', { name: 'Masuk' }));
    await user.type(document.getElementById('login-identifier')!, 'Bima');
    await user.click(document.getElementById('portal-login-submit')!);
    expect(window.location.hash).toBe('#jelajah');

    // Test quick guest entry
    await user.click(within(primaryNav).getByRole('link', { name: 'Penjelajah' }));
    await user.click(document.getElementById('guest-login-btn')!);
    expect(window.location.hash).toBe('#jelajah');
    const guestSaved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(guestSaved.passport.isGuest).toBe(true);
    expect(guestSaved.passport.name).toBe('Penjelajah Tamu');
  });

  it('completes Zona 1 (Canopy) roleplay quest and operates Sunlight Time Dial sandbox', async () => {
    const user = userEvent.setup();
    window.location.hash = '#jelajah';
    render(<App />);

    // Zones are separated into stages, so River/Underground should NOT be mounted simultaneously
    expect(document.getElementById('zona-kanopi')).toBeInTheDocument();
    expect(document.getElementById('zona-sungai')).not.toBeInTheDocument();
    expect(document.getElementById('zona-bawah-tanah')).not.toBeInTheDocument();
    expect(screen.getByText(/Kamu berperan sebagai Lulu si Lebah Penyerbuk/i)).toBeInTheDocument();

    const cloud1 = document.getElementById('storm-cloud-1')!;
    const cloud2 = document.getElementById('storm-cloud-2')!;
    const bee = document.getElementById('canopy-bee')!;

    // Trying to pollinate before clouds are cleared should show visible warning and not unlock badge
    await user.click(bee);
    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();
    expect(document.getElementById('canopy-quest-status')).toHaveTextContent(
      /Singkirkan dulu 2 awan kelabu/i
    );

    // Clear clouds (1 via click, 1 via Enter key)
    await user.click(cloud1);
    expect(screen.getByText(/Geser atau klik 1 awan kelabu/i)).toBeInTheDocument();

    cloud2.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Langkah 2 dari 2/i)).toBeInTheDocument();
    expect(document.getElementById('sunflower-pollination-target')).toBeInTheDocument();

    // Pollinate via bee
    await user.click(bee);
    expect(screen.getByText('1/4 Penemuan')).toBeInTheDocument();
    expect(document.getElementById('discovery-toast')).toHaveClass('is-visible');

    // Sandbox unlocked
    const pagiRadio = screen.getByRole('radio', { name: 'Pagi' });
    const senjaRadio = screen.getByRole('radio', { name: 'Senja' });
    await user.click(pagiRadio);
    expect(pagiRadio).toHaveAttribute('aria-checked', 'true');
    expect(document.getElementById('zona-kanopi')).toHaveAttribute('data-sun-time', 'pagi');
    expect(screen.getByText(/menyambut matahari terbit/i)).toBeInTheDocument();

    await user.click(senjaRadio);
    expect(senjaRadio).toHaveAttribute('aria-checked', 'true');
    expect(document.getElementById('zona-kanopi')).toHaveAttribute('data-sun-time', 'senja');

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.badges.canopy).toBe(true);
    expect(saved.sandbox.sunTime).toBe('senja');
  });

  it('completes Zona 2 (River) sorting with wrong-bin guidance and Rain Trigger sandbox', async () => {
    const user = userEvent.setup();
    window.location.hash = '#jelajah';
    render(<App />);

    // Switch stage to Zona 2
    await user.click(document.getElementById('stage-btn-river')!);
    expect(document.getElementById('zona-sungai')).toBeInTheDocument();
    expect(document.getElementById('zona-kanopi')).not.toBeInTheDocument();
    expect(screen.getByText(/Kamu berperan sebagai Kiko si Katak Penjaga Sungai/i)).toBeInTheDocument();

    const bottleBtn = screen.getByRole('button', { name: 'Botol Plastik' });
    const canBtn = screen.getByRole('button', { name: 'Kaleng Bekas' });
    const branchBtn = screen.getByRole('button', { name: 'Ranting Patah' });
    const leafBtn = screen.getByRole('button', { name: 'Daun Kering' });

    const recycleBin = screen.getByRole('button', { name: /Keranjang Daur Ulang/i });
    const compostBin = screen.getByRole('button', { name: /Tumpukan Kompos/i });

    // Wrong bin for bottle -> educational hint
    await user.click(bottleBtn);
    expect(bottleBtn).toHaveAttribute('aria-pressed', 'true');
    await user.click(compostBin);
    expect(document.getElementById('river-feedback')).toHaveTextContent(
      /Plastik dan kaleng tidak membusuk/i
    );
    expect(screen.getByText('0/4 Benda Dipilah')).toBeInTheDocument();

    // Wrong bin for leaf -> educational hint
    await user.click(leafBtn);
    await user.click(recycleBin);
    expect(document.getElementById('river-feedback')).toHaveTextContent(
      /Benda alam seperti daun dan ranting/i
    );

    // Sort all 4 items properly
    await user.click(bottleBtn);
    await user.click(recycleBin);
    expect(screen.getByText('1/4 Benda Dipilah')).toBeInTheDocument();
    expect(bottleBtn).toBeDisabled();

    await user.click(canBtn);
    await user.click(recycleBin);

    await user.click(branchBtn);
    await user.click(compostBin);

    await user.click(leafBtn);
    await user.click(compostBin);

    expect(screen.getByText('4/4 Benda Dipilah')).toBeInTheDocument();
    expect(screen.getByText('1/4 Penemuan')).toBeInTheDocument();
    expect(document.querySelector('.river-water')).toHaveAttribute('fill', '#D9EDE9');

    // Rain sandbox unlocked
    const rainBtn = screen.getByRole('button', { name: /Turunkan Hujan/i });
    await user.click(rainBtn);
    expect(rainBtn).toHaveAttribute('aria-pressed', 'true');
    expect(rainBtn).toHaveTextContent('Hentikan Hujan');

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(saved.badges.river).toBe(true);
    expect(saved.sandbox.rainActive).toBe(true);
  });

  it('completes Zona 3 (Underground) quest, moves X-Ray lens via keyboard arrows, and grows Taman Hadiah', async () => {
    const user = userEvent.setup();
    window.location.hash = '#jelajah';
    render(<App />);

    await user.click(document.getElementById('stage-btn-underground')!);
    expect(document.getElementById('zona-bawah-tanah')).toBeInTheDocument();
    expect(screen.getByText(/Kamu berperan sebagai Cici si Cacing & Tunas Oak/i)).toBeInTheDocument();

    const wormBtn = screen.getByRole('button', { name: /Panggil Cacing Tanah/i });
    const waterBtn = screen.getByRole('button', { name: /Siram Biji Oak/i });

    expect(wormBtn).toBeDisabled();
    expect(waterBtn).toBeDisabled();

    await user.click(document.getElementById('soil-clump-1')!);
    await user.click(document.getElementById('soil-clump-2')!);
    await user.click(document.getElementById('soil-clump-3')!);

    expect(wormBtn).toBeEnabled();
    await user.click(wormBtn);

    expect(waterBtn).toBeEnabled();
    await user.click(waterBtn);

    expect(screen.getByText('1/4 Penemuan')).toBeInTheDocument();
    const slider = screen.getByRole('slider', { name: /Kaca Pembesar Akar/i });
    expect(slider).toBeInTheDocument();
    expect(screen.getByText(/Jaringan Akar Bawah Tanah/i)).toBeInTheDocument();

    // Move lens up into trunk & leaves region via ArrowUp
    slider.focus();
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(screen.getByText(/Bagian Batang Pohon/i)).toBeInTheDocument();

    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(screen.getByText(/Bagian Daun & Cabang/i)).toBeInTheDocument();

    // Toggle X-ray off
    const xrayToggle = screen.getByRole('button', { name: /Tutup Kaca Pembesar Akar/i });
    await user.click(xrayToggle);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nyalakan Kaca Pembesar Akar/i })).toBeInTheDocument();

    // Visit Taman Hadiah (Reward Sanctuary) and verify Oak tree is grown!
    await user.click(document.getElementById('stage-btn-sanctuary')!);
    expect(document.getElementById('taman-hadiah')).toBeInTheDocument();
    expect(screen.getByText('1/4 Hadiah Tumbuh Bersama')).toBeInTheDocument();
    const oakEl = document.getElementById('sanctuary-oak');
    expect(oakEl).toBeInTheDocument();
    await user.click(oakEl!);
    expect(screen.getByText(/Akar Pohon Oak menyerap air hujan/i)).toBeInTheDocument();
  });

  it('opens Field Journal dialog, restores persisted state, and supports 2-step reset', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: true,
        badges: { canopy: true, river: true, underground: false },
        sandbox: { sunTime: 'pagi', rainActive: true, xrayActive: false }
      })
    );

    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('2/4 Penemuan')).toBeInTheDocument();
    expect(screen.getByText('2 dari 4 penemuan tercatat')).toBeInTheDocument();

    // Open Field Journal
    await user.click(document.getElementById('journal-open-btn')!);
    const dialog = document.getElementById('journal-dialog')!;
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('Bunga Matahari & Lebah Penyerbuk')).toBeInTheDocument();
    expect(within(dialog).getByText('Katak Hijau & Sungai Jernih')).toBeInTheDocument();
    expect(within(dialog).getAllByText('Spesimen Belum Terbuka')).toHaveLength(2);

    // 2-step reset: cancel first, then confirm
    await user.click(within(dialog).getByRole('button', { name: 'Ulangi Petualangan' }));
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));
    expect(screen.getByText('2/4 Penemuan')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Ulangi Petualangan' }));
    await user.click(within(dialog).getByRole('button', { name: 'Ya, Ulangi' }));

    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();
    expect(within(dialog).getByText(/Belum ada lencana di buku ini/i)).toBeInTheDocument();
    expect(document.getElementById('hero-biji-svg')).toHaveAttribute('data-state', 'sleeping');
  });

  it('handles corrupted localStorage gracefully and updates Companion Biji & Kompas Lembah across stages', async () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken-json');
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();
    const companion = document.getElementById('biji-companion')!;
    expect(companion).toHaveClass('is-hidden');

    // Navigate to #jelajah
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Jelajah' }));
    expect(companion).not.toHaveClass('is-hidden');
    expect(document.getElementById('companion-biji-svg')).toHaveAttribute('data-state', 'worried');

    const canopyNavBtn = screen.getByRole('button', { name: /Buka Zona 1: Kanopi/i });
    expect(canopyNavBtn).toHaveAttribute('aria-current', 'true');

    // Toggle hint
    await user.click(screen.getByRole('button', { name: 'Butuh petunjuk?' }));
    expect(document.getElementById('companion-biji-svg')).toHaveAttribute('data-state', 'hint');

    // Switch stage via Kompas Lembah
    const riverNavBtn = screen.getByRole('button', { name: /Buka Zona 2: Tepi Sungai/i });
    await user.click(riverNavBtn);
    expect(riverNavBtn).toHaveAttribute('aria-current', 'true');
    expect(document.getElementById('zona-sungai')).toBeInTheDocument();
  });

  it('keeps SVG positioning transforms on separate parent <g> from CSS transform/animation', () => {
    window.location.hash = '#jelajah';
    const { unmount } = render(<App />);

    const sunflowerHead = document.getElementById('sunflower-head')!;
    expect(sunflowerHead).not.toHaveAttribute('transform');
    expect(sunflowerHead.parentElement).toHaveAttribute('transform', 'translate(390, 212)');

    for (const id of ['canopy-butterfly-1', 'canopy-butterfly-2', 'canopy-butterfly-3']) {
      const el = document.getElementById(id)!;
      expect(el).not.toHaveAttribute('transform');
      expect(el.parentElement?.getAttribute('transform')).toMatch(/^translate\(/);
    }

    document.querySelectorAll('.anim-butterfly, .anim-sway').forEach((el) => {
      expect(el).not.toHaveAttribute('transform');
      expect(el.parentElement?.getAttribute('transform')).toMatch(/^translate\(/);
    });

    fireEvent.click(document.getElementById('stage-btn-underground')!);
    const normalImg = document
      .getElementById('underground-svg')!
      .querySelector('img[src="/assets/images/zone3-scene-normal.png"]');
    const earlyImg = document.getElementById('ug-early-scene') as HTMLImageElement;
    const xrayImg = document.getElementById('ug-xray-layer') as HTMLImageElement;
    expect(normalImg).toBeInTheDocument();
    expect(earlyImg).toHaveAttribute('src', '/assets/images/zone3-scene-early.png');
    expect(xrayImg).toHaveAttribute('src', '/assets/images/zone3-scene-xray.png');
    expect(xrayImg.style.clipPath).toBe('circle(0px at 50% 50%)');
    unmount();
  });

  it('handles Zona 1 short drag, pointercancel, full drag, and bee drop target accurately', async () => {
    window.location.hash = '#jelajah';
    render(<App />);

    const canopySvg = document.getElementById('canopy-svg')!;
    vi.spyOn(canopySvg, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 410,
      right: 800,
      bottom: 410,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    const cloud1 = document.getElementById('storm-cloud-1')!;
    const cloud2 = document.getElementById('storm-cloud-2')!;
    const bee = document.getElementById('canopy-bee')!;

    // Short drag (30px < 55px) + browser click should NOT clear cloud1
    fireEvent.pointerDown(cloud1, { clientX: 330, clientY: 90, pointerId: 1 });
    fireEvent.pointerMove(cloud1, { clientX: 360, clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(cloud1, { clientX: 360, clientY: 90, pointerId: 1 });
    fireEvent.click(cloud1);
    expect(cloud1).not.toHaveClass('is-cleared');

    // pointercancel should NOT clear cloud1
    fireEvent.pointerDown(cloud1, { clientX: 330, clientY: 90, pointerId: 1 });
    fireEvent.pointerCancel(cloud1, { pointerId: 1 });
    expect(cloud1).not.toHaveClass('is-cleared');

    // Full drag (>= 55px) clears cloud1
    fireEvent.pointerDown(cloud1, { clientX: 330, clientY: 90, pointerId: 1 });
    fireEvent.pointerMove(cloud1, { clientX: 250, clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(cloud1, { clientX: 250, clientY: 90, pointerId: 1 });
    expect(cloud1).toHaveClass('is-cleared');

    // Clear cloud2 via full drag too
    fireEvent.pointerDown(cloud2, { clientX: 410, clientY: 110, pointerId: 1 });
    fireEvent.pointerMove(cloud2, { clientX: 490, clientY: 110, pointerId: 1 });
    fireEvent.pointerUp(cloud2, { clientX: 490, clientY: 110, pointerId: 1 });
    expect(cloud2).toHaveClass('is-cleared');

    // Drag bee away from flower + click should NOT pollinate
    fireEvent.pointerDown(bee, { clientX: 585, clientY: 210, pointerId: 2 });
    fireEvent.pointerMove(bee, { clientX: 650, clientY: 210, pointerId: 2 });
    fireEvent.pointerUp(bee, { clientX: 650, clientY: 210, pointerId: 2 });
    fireEvent.click(bee);
    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();

    // Drag bee onto flower center (390, 210) -> pollinates!
    fireEvent.pointerDown(bee, { clientX: 585, clientY: 210, pointerId: 2 });
    fireEvent.pointerMove(bee, { clientX: 395, clientY: 212, pointerId: 2 });
    fireEvent.pointerUp(bee, { clientX: 395, clientY: 212, pointerId: 2 });
    expect(screen.getByText('1/4 Penemuan')).toBeInTheDocument();
  });

  it('handles Zona 2 deselect & pointer drag-and-drop and Zona 3 X-ray bounds + Home/End + reset focus', async () => {
    const user = userEvent.setup();
    window.location.hash = '#jelajah';
    render(<App />);

    await user.click(document.getElementById('stage-btn-river')!);

    // Zona 2: click to select, click again to deselect
    const bottleBtn = screen.getByRole('button', { name: 'Botol Plastik' });
    await user.click(bottleBtn);
    expect(bottleBtn).toHaveAttribute('aria-pressed', 'true');
    await user.click(bottleBtn);
    expect(bottleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.getElementById('river-feedback')).toHaveTextContent(
      /Seret benda di sungai ke wadah yang tepat/i
    );

    // Zona 2: pointer drag-and-drop bottle onto Keranjang Daur Ulang
    const recycleBin = screen.getByRole('button', { name: /Keranjang Daur Ulang/i });
    vi.spyOn(recycleBin, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 400,
      width: 200,
      height: 80,
      right: 250,
      bottom: 480,
      x: 50,
      y: 400,
      toJSON: () => ({})
    });
    fireEvent.pointerDown(bottleBtn, { clientX: 100, clientY: 200, pointerId: 3 });
    fireEvent.pointerMove(bottleBtn, { clientX: 120, clientY: 430, pointerId: 3 });
    fireEvent.pointerUp(bottleBtn, { clientX: 120, clientY: 430, pointerId: 3 });
    expect(screen.getByText('1/4 Benda Dipilah')).toBeInTheDocument();

    // Zona 3: unlock X-ray and test Home/End + synthetic click guard
    await user.click(document.getElementById('stage-btn-underground')!);
    await user.click(document.getElementById('soil-clump-1')!);
    await user.click(document.getElementById('soil-clump-2')!);
    await user.click(document.getElementById('soil-clump-3')!);
    await user.click(screen.getByRole('button', { name: /Panggil Cacing Tanah/i }));
    await user.click(screen.getByRole('button', { name: /Siram Biji Oak/i }));

    const slider = screen.getByRole('slider', { name: /Kaca Pembesar Akar/i });
    const xrayLayer = document.getElementById('ug-xray-layer') as HTMLImageElement;
    expect(xrayLayer.style.clipPath).toMatch(/^circle\(95px at 50% /);
    expect(slider).toHaveAttribute('aria-valuemin', '75');
    expect(slider).toHaveAttribute('aria-valuemax', '335');

    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '335');

    // Synthetic click with detail === 0 must not move lens to (75, 75)
    fireEvent.click(document.getElementById('underground-svg')!, { detail: 0, clientX: 0, clientY: 0 });
    expect(slider).toHaveAttribute('aria-valuenow', '335');

    // Dialog closedby="any" and focus restoration after reset
    const dialog = document.getElementById('journal-dialog')!;
    expect(dialog).toHaveAttribute('closedby', 'any');
    await user.click(document.getElementById('journal-open-btn')!);
    await user.click(within(dialog).getByRole('button', { name: 'Ulangi Petualangan' }));
    await user.click(within(dialog).getByRole('button', { name: 'Ya, Ulangi' }));
    expect(screen.getByText('0/4 Penemuan')).toBeInTheDocument();
  });

  it('filters #wawasan articles, reveals fun facts, and submits #tentang contact form with validation', async () => {
    const user = userEvent.setup();
    window.location.hash = '#wawasan';
    render(<App />);

    expect(screen.getByRole('heading', { name: /Wawasan Alam Nusantara/i })).toBeInTheDocument();
    expect(screen.getByText(/Galeri Ekosistem Nusantara/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Empat Lanskap Ekosistem Indonesia/i })).toBeInTheDocument();

    // Filter by Siklus Air
    await user.click(screen.getByRole('button', { name: 'Siklus Air' }));
    expect(screen.getByText(/Perjalanan Setetes Air di Sungai Nusantara/i)).toBeInTheDocument();
    expect(screen.queryByText(/Kenapa Lebah & Bunga Saling Membutuhkan/i)).not.toBeInTheDocument();

    // Open Story Reader Modal and reveal fun fact answer
    await user.click(screen.getByRole('button', { name: /Baca Cerita Lengkap/i }));
    const storyDialog = document.getElementById('wawasan-story-dialog')!;
    expect(storyDialog).toHaveAttribute('open');
    await user.click(within(storyDialog).getByRole('button', { name: /Buka Jawaban Fakta/i }));
    expect(within(storyDialog).getByText(/Akar pohon menahan air hujan/i)).toBeInTheDocument();
    await user.click(document.getElementById('story-reader-close')!);

    // Navigate to #tentang
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Tentang & Kontak' }));
    expect(screen.getByRole('heading', { name: /Mengenal Misi TamanPico/i })).toBeInTheDocument();

    // Validate empty submit
    await user.click(document.getElementById('contact-submit-btn')!);
    expect(document.getElementById('contact-name-error')).toBeInTheDocument();
    expect(document.getElementById('contact-name')).toHaveFocus();

    // Fill invalid email and short message
    await user.type(document.getElementById('contact-name')!, 'Ibu Sari');
    await user.type(document.getElementById('contact-email')!, 'salah-email');
    await user.type(document.getElementById('contact-message')!, 'Pendek');
    await user.click(document.getElementById('contact-submit-btn')!);
    expect(document.getElementById('contact-email-error')).toBeInTheDocument();

    // Fix email & message -> valid submit
    await user.clear(document.getElementById('contact-email')!);
    await user.type(document.getElementById('contact-email')!, 'ibu.sari@sekolah.id');
    await user.clear(document.getElementById('contact-message')!);
    await user.type(
      document.getElementById('contact-message')!,
      'Anak-anak kelas 3 sangat antusias mencoba permainan memilah sampah sungai.'
    );
    await user.click(document.getElementById('contact-submit-btn')!);

    expect(document.getElementById('contact-success-banner')).toHaveTextContent(
      /Terima kasih, Ibu Sari/i
    );
  });

  it('toggles AudioManager safely even when external /assets/audio/*.mp3 files are missing', async () => {
    const user = userEvent.setup();
    render(<App />);

    const audioBtn = document.getElementById('audio-toggle-btn')!;
    expect(audioBtn).toHaveAttribute('aria-pressed', 'false');
    expect(audioBtn).toHaveTextContent('Suara: Mati');

    await user.click(audioBtn);
    expect(audioBtn).toHaveAttribute('aria-pressed', 'true');
    expect(audioBtn).toHaveTextContent('Suara: Hidup');

    // Triggering SFX without mp3 files present must not throw
    expect(() => audioManager.playSfx('pollinate')).not.toThrow();
    expect(() => audioManager.playSfx('badge')).not.toThrow();

    await user.click(audioBtn);
    expect(audioBtn).toHaveAttribute('aria-pressed', 'false');
    expect(audioBtn).toHaveTextContent('Suara: Mati');
  });

  it('preserves intended animal zone across #home -> #portal -> #jelajah, renders mini-sanctuary in passport, and supports keyboard tabs & Escape menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Mobile menu toggle + Escape closes and restores focus
    const menuToggle = screen.getByRole('button', { name: /Menu/i });
    await user.click(menuToggle);
    expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    expect(menuToggle).toHaveFocus();

    // Select Kiko on Interactive Character Spotlight from #home and click play CTA -> goes to #portal
    await user.click(document.getElementById('spotlight-select-river')!);
    expect(document.getElementById('animal-spotlight-stage')).toHaveTextContent(
      /Kiko si Katak Penjaga Sungai/i
    );
    await user.click(document.getElementById('spotlight-play-btn')!);
    expect(window.location.hash).toBe('#portal');

    // Keyboard ArrowRight switches tab from Daftar Baru to Masuk
    const registerTab = screen.getByRole('tab', { name: 'Daftar Baru' });
    const loginTab = screen.getByRole('tab', { name: 'Masuk' });
    registerTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(loginTab).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('portal-tabpanel-login')).toBeInTheDocument();

    // Guest login enters directly into Zona 2 (Kiko) as chosen on #home
    await user.click(document.getElementById('guest-login-btn')!);
    expect(window.location.hash).toBe('#jelajah');
    expect(document.getElementById('zona-sungai')).toBeInTheDocument();

    // Check explorer card shows mini-sanctuary collection
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Penjelajah' }));
    const passportCard = document.getElementById('active-passport-card')!;
    expect(
      within(passportCard).getByText(/TANAMAN & SATWA YANG SUDAH KAMU SELAMATKAN/i)
    ).toBeInTheDocument();
    expect(within(passportCard).getByText('Bibit Bunga Matahari')).toBeInTheDocument();
    expect(within(passportCard).getByText('Teratai Biru')).toBeInTheDocument();
    expect(within(passportCard).getByText('Pohon Oak Rimba')).toBeInTheDocument();
  });

  it('recovers from non-array contact storage and supports keyboard inspection in Taman Hadiah', async () => {
    window.localStorage.setItem('TamanPico_contact_messages_v1', '{"corrupted":true}');
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: true,
        badges: { canopy: false, river: false, underground: true },
        sandbox: { sunTime: 'siang', rainActive: false, xrayActive: true }
      })
    );

    const user = userEvent.setup();
    window.location.hash = '#tentang';
    render(<App />);

    await user.type(document.getElementById('contact-name')!, 'Pak Budi');
    await user.type(document.getElementById('contact-email')!, 'budi@rimba.id');
    await user.type(
      document.getElementById('contact-message')!,
      'Simulasi ekosistem sangat mudah dipahami oleh siswa kelas 4.'
    );
    await user.click(document.getElementById('contact-submit-btn')!);
    expect(document.getElementById('contact-success-banner')).toHaveTextContent(/Terima kasih, Pak Budi/i);
    const storedMsgs = JSON.parse(window.localStorage.getItem('TamanPico_contact_messages_v1')!);
    expect(Array.isArray(storedMsgs)).toBe(true);
    expect(storedMsgs[0].name).toBe('Pak Budi');

    // Keyboard Enter on #sanctuary-oak in Taman Hadiah
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Jelajah' }));
    await user.click(document.getElementById('stage-btn-sanctuary')!);
    const oak = document.getElementById('sanctuary-oak')!;
    oak.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Akar Pohon Oak menyerap air hujan/i)).toBeInTheDocument();
  });

  it('renames mascot to Pico across Hero, Portal, Companion, and Field Journal and allows minimizing Pico bubble', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Ikuti jejak Pico/i)).toBeInTheDocument();
    await user.click(document.getElementById('hero-biji-btn')!);
    expect(screen.getByText('Sapaan Pico')).toBeInTheDocument();

    // Journal uses Pico across all 4 zones
    await user.click(document.getElementById('journal-open-btn')!);
    expect(screen.getAllByText(/Bantu Pico menyelesaikan misi kecil/i).length).toBe(4);
    await user.click(document.getElementById('journal-close-btn')!);

    // Portal avatar card uses Pico Tunas
    const primaryNav = screen.getByRole('navigation', { name: 'Navigasi Utama' });
    await user.click(within(primaryNav).getByRole('link', { name: 'Penjelajah' }));
    expect(screen.getByLabelText(/Pico Tunas/i)).toBeInTheDocument();

    // Companion uses Pico and can minimize & reopen bubble
    await user.click(within(primaryNav).getByRole('link', { name: 'Jelajah' }));
    expect(screen.getByRole('complementary', { name: 'Pemandu Pico' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sembunyikan pesan Pico' }));
    expect(document.getElementById('companion-biji-bubble')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tampilkan pesan Pico' }));
    expect(document.getElementById('companion-biji-bubble')).toBeInTheDocument();
  });

  it('uses unified clean/dirty river scenes in Zona 2, smooth synced sunbeam in Zona 1, and clean vector lens in Zona 3', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: true,
        badges: { canopy: true, river: false, underground: true },
        sandbox: { sunTime: 'siang', rainActive: false, xrayActive: true }
      })
    );
    window.location.hash = '#jelajah';
    render(<App />);

    // Zona 1: sun and sunbeams share coordinates and move smoothly toward Pagi when reduced-motion is set
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }));

    const sunGroupBefore = document.getElementById('canopy-sun-group')!.getAttribute('style');
    const beamBefore = document.getElementById('canopy-sunbeams')!.getAttribute('points');
    const sunflowerStem = document.getElementById('sunflower-stem')!;
    expect(sunflowerStem.contains(document.getElementById('sunflower-head'))).toBe(true);
    await user.click(screen.getByRole('radio', { name: 'Pagi' }));
    const sunGroupAfter = document.getElementById('canopy-sun-group')!.getAttribute('style');
    const beamAfter = document.getElementById('canopy-sunbeams')!.getAttribute('points');
    expect(sunGroupAfter).not.toBe(sunGroupBefore);
    expect(beamAfter).not.toBe(beamBefore);
    matchMediaSpy.mockRestore();

    // Zona 2: unified dirty and clean scenes crossfade without separated river props
    await user.click(document.getElementById('stage-btn-river')!);
    const dirtyScene = document.getElementById('river-scene-dirty')!;
    const cleanScene = document.getElementById('river-scene-clean')!;
    expect(dirtyScene).toHaveAttribute('href', '/assets/images/zone2-river-dirty.png');
    expect(cleanScene).toHaveAttribute('href', '/assets/images/zone2-river-clean.png');
    expect(cleanScene).toHaveStyle({ opacity: '0' });
    expect(document.getElementById('river-fish-group')).not.toBeInTheDocument();
    expect(document.getElementById('river-blue-lotus')).not.toBeInTheDocument();

    const recycleBin = screen.getByRole('button', { name: /Keranjang Daur Ulang/i });
    const compostBin = screen.getByRole('button', { name: /Tumpukan Kompos/i });
    await user.click(screen.getByRole('button', { name: 'Botol Plastik' }));
    await user.click(recycleBin);
    await user.click(screen.getByRole('button', { name: 'Kaleng Bekas' }));
    await user.click(recycleBin);
    await user.click(screen.getByRole('button', { name: 'Ranting Patah' }));
    await user.click(compostBin);
    await user.click(screen.getByRole('button', { name: 'Daun Kering' }));
    await user.click(compostBin);

    expect(cleanScene).toHaveStyle({ opacity: '1' });

    // Zona 3: crisp vector SVG lens centered concentrically with synced transition & drag suppression
    await user.click(document.getElementById('stage-btn-underground')!);
    const lensVisual = document.getElementById('xray-lens-visual')!;
    const lensHandle = document.getElementById('xray-lens-handle')!;
    const xrayLayer = document.getElementById('ug-xray-layer')!;
    expect(lensVisual.tagName.toLowerCase()).toBe('svg');
    expect(lensVisual).toHaveAttribute('viewBox', '0 0 200 200');
    expect(lensVisual.style.transform).toBe('translate(-50%, -50%)');
    expect(lensVisual.style.left).toBe(lensHandle.style.left);
    expect(lensVisual.style.top).toBe(lensHandle.style.top);
    expect(xrayLayer.style.transition).toContain('clip-path 480ms');

    // While dragging, transitions turn off for zero-lag tracking
    fireEvent.pointerDown(lensHandle, { clientX: 400, clientY: 272, pointerId: 9 });
    expect(xrayLayer.style.transition).toBe('none');
    expect(lensVisual.style.transition).toBe('none');
    fireEvent.pointerUp(lensHandle, { clientX: 400, clientY: 272, pointerId: 9 });
    expect(xrayLayer.style.transition).toContain('clip-path 480ms');

    // Toggling X-ray off collapses clip-path concentrically at current lens position
    await user.click(screen.getByRole('button', { name: /Tutup Kaca Pembesar Akar/i }));
    expect(xrayLayer.style.clipPath).toMatch(/^circle\(0px at 50% 66\./);
  });

  it('renders HeroSection as a single full-bleed canvas without mid-sky clipping and supports keyboard/celebrate Pico interactions', async () => {
    const user = userEvent.setup();
    render(<App />);

    const heroSection = document.getElementById('gerbang-lembah')!;
    const sceneCanvas = document.getElementById('hero-scene-canvas')!;
    expect(heroSection).not.toHaveClass('overflow-hidden');
    expect(sceneCanvas).toHaveClass('overflow-visible');
    expect(document.getElementById('hero-valley-stage')).not.toBeInTheDocument();

    // Backdrop hills, sun, clouds, oak tree, butterflies, grass, and Pico share one unified canvas
    const hillsBackdrop = sceneCanvas.querySelector('img[src="/assets/images/hero-valley-hills.png"]');
    expect(hillsBackdrop).toBeInTheDocument();
    expect(hillsBackdrop).toHaveClass('object-cover', 'object-bottom');
    expect(sceneCanvas.querySelector('img[src="/assets/images/hero-butterfly-1.png"]')).toBeInTheDocument();
    expect(sceneCanvas.querySelector('img[src="/assets/images/hero-butterfly-2.png"]')).toBeInTheDocument();
    expect(sceneCanvas.querySelector('img[src="/assets/images/hero-story-tree.png"]')).toBeInTheDocument();
    expect(sceneCanvas.contains(document.getElementById('hero-biji-btn'))).toBe(true);

    // Overlay copy, CTA, and Sapaan Pico sit cleanly above the canvas
    expect(document.getElementById('hero-cta-wrap')).toBeInTheDocument();
    expect(document.getElementById('hero-start-btn')).toBeInTheDocument();
    expect(document.getElementById('hero-nap-cue')).toBeInTheDocument();
    expect(document.getElementById('hero-biji-text')).toHaveTextContent(/Zzz\.\.\. ketuk Pico/i);

    // Wake Pico via Space key and verify nap cue disappears and second greet updates speech
    const picoBtn = document.getElementById('hero-biji-btn')!;
    picoBtn.focus();
    await user.keyboard(' ');
    expect(document.getElementById('hero-nap-cue')).not.toBeInTheDocument();
    expect(document.getElementById('hero-biji-svg')).toHaveAttribute('data-state', 'happy');
    expect(document.getElementById('hero-biji-text')).toHaveTextContent(/Hoaaam\.\.\. halo, Penjelajah!/i);

    await user.keyboard('{Enter}');
    expect(document.getElementById('hero-biji-text')).toHaveTextContent(/Yuk buka Kartu Penjelajah dulu/i);
  });

  it('shows celebrate state with grounded sprite & sparkles in HeroSection when passport and all 4 badges are present', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: true,
        passport: { name: 'Rani', email: 'rani@rimba.id', avatar: 'biji', isGuest: false },
        badges: { canopy: true, river: true, underground: true, mangrove: true },
        sandbox: { sunTime: 'pagi', rainActive: true, xrayActive: true, waveActive: false }
      })
    );
    const user = userEvent.setup();
    render(<App />);

    const heroBijiSvg = document.getElementById('hero-biji-svg')!;
    expect(heroBijiSvg).toHaveAttribute('data-state', 'celebrate');
    expect(heroBijiSvg.querySelector('image')).toHaveAttribute(
      'href',
      '/assets/images/mascot-biji-happy.png'
    );
    expect(document.getElementById('hero-pico-sparkles')).toBeInTheDocument();
    expect(document.getElementById('hero-nap-cue')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lanjut ke Dunia Jelajah' })).toBeInTheDocument();
    expect(document.getElementById('hero-biji-text')).toHaveTextContent(/Keempat sudut lembah telah pulih/i);

    // Quick-explore CTA navigates directly to #jelajah
    await user.click(screen.getByRole('button', { name: 'Lanjut ke Dunia Jelajah' }));
    expect(window.location.hash).toBe('#jelajah');
  });

  it('operates Hero sky cycle selector (#hero-time-controls) through Pagi, Senja, and Malam with moon and fireflies', async () => {
    const user = userEvent.setup();
    render(<App />);

    const controls = document.getElementById('hero-time-controls')!;
    const heroSection = document.getElementById('gerbang-lembah')!;

    await user.click(within(controls).getByRole('button', { name: 'Senja' }));
    expect(heroSection).toHaveAttribute('data-hero-phase', 'senja');

    await user.click(within(controls).getByRole('button', { name: 'Malam' }));
    expect(heroSection).toHaveAttribute('data-hero-phase', 'malam');
    expect(Number(document.getElementById('hero-fireflies')!.style.opacity)).toBeGreaterThan(0.5);
    expect(Number(document.getElementById('hero-night-sky')!.style.opacity)).toBeGreaterThan(0.5);

    await user.click(within(controls).getByRole('button', { name: 'Otomatis' }));
    expect(within(controls).getByRole('button', { name: 'Otomatis' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('completes Zona 4 (Mangrove) quest, operates tidal wave sandbox, and unlocks Sertifikat Penjaga TamanPico at 4/4', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: true,
        passport: { name: 'Sinta', email: 'sinta@rimba.id', avatar: 'crab', isGuest: false },
        badges: { canopy: true, river: true, underground: true, mangrove: false },
        sandbox: { sunTime: 'siang', rainActive: false, xrayActive: false, waveActive: false }
      })
    );
    window.location.hash = '#jelajah';
    const user = userEvent.setup();
    render(<App />);

    await user.click(document.getElementById('stage-btn-mangrove')!);
    expect(document.getElementById('zona-mangrove')).toBeInTheDocument();
    expect(document.getElementById('mangrove-bg-img')).toHaveAttribute(
      'src',
      '/assets/images/zone4-mangrove-bg.png'
    );

    // Step 1: Clean fishing net and plastic bottle
    await user.click(document.getElementById('mangrove-trash-net')!);
    await user.click(document.getElementById('mangrove-trash-bottle')!);

    // Step 2: Plant all 3 mangrove spots
    await user.click(document.getElementById('mangrove-spot-0')!);
    await user.click(document.getElementById('mangrove-spot-1')!);
    await user.click(document.getElementById('mangrove-spot-2')!);

    expect(screen.getByText('4/4 Penemuan')).toBeInTheDocument();
    expect(document.getElementById('mangrove-sandbox-panel')).toBeInTheDocument();

    // Activate tidal wave sandbox
    await user.click(document.getElementById('mangrove-wave-toggle')!);
    expect(document.getElementById('mangrove-wave-layer')!.style.opacity).toBe('0.92');

    // Navigate to Taman Hadiah and verify 4/4 Certificate appears for Sinta
    await user.click(document.getElementById('stage-btn-sanctuary')!);
    const cert = document.getElementById('rimba-certificate-card')!;
    expect(cert).toBeInTheDocument();
    expect(cert).toHaveTextContent('Sertifikat Penjaga TamanPico');
    expect(cert).toHaveTextContent('Sinta');
    expect(document.getElementById('certificate-download-btn')).toBeInTheDocument();
    expect(document.getElementById('certificate-print-btn')).toBeInTheDocument();
  });

  it('hides explorer passport name below md breakpoint to avoid 640px header overflow and keeps companion hidden off #jelajah', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        bijiAwake: false,
        passport: { name: 'Penjelajah Panjang', email: 'a@b.id', avatar: 'biji', isGuest: false },
        badges: { canopy: false, river: false, underground: false },
        sandbox: { sunTime: 'siang', rainActive: false, xrayActive: false }
      })
    );
    render(<App />);

    const passportChip = screen.getByRole('link', { name: /Kartu Penjelajah: Penjelajah Panjang/i });
    const nameSpan = within(passportChip).getByText('Penjelajah Panjang');
    expect(nameSpan).toHaveClass('hidden', 'md:inline');

    const companion = document.getElementById('biji-companion')!;
    expect(companion).toHaveClass('is-hidden');
    expect(companion).toHaveAttribute('aria-hidden', 'true');
  });
});
