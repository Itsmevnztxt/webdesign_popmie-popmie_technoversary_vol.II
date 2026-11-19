# Daftar Aset Ilustrasi & Audio — TamanPico

Seluruh aset visual menggunakan gaya *gouache* & *paper-cutout* buku cerita anak (palet `#FAF8F0`, `#477A59`, `#A8C99A`, `#C8DEA4`, `#DCEEDB`, `#D9EDE9`, `#F5D77D`, `#E9A58E`, garis tepi `#293A30`).

## 1. Status Aset Terbaru (Hasil Pemetaan `69.png`–`78.png` & Audio)

| File Input Baru | Dipetakan Menjadi | Kegunaan di Aplikasi |
| :--- | :--- | :--- |
| `69.png` | `public/assets/images/zone4-mangrove-bg.png` | Latar teluk pesisir Zona 4 (Mangrove) |
| `70.png` | `public/assets/images/art-cacing.png` | Ilustrasi kisah beranda & artikel Cici si Cacing (`Wawasan`) |
| `71.png` | `public/assets/images/prop-crab-bako.png` | Karakter Bako si Kepiting di Zona 4 & Taman Hadiah |
| `72.png` | `public/assets/images/prop-sea-net.png` | Sampah jaring nelayan di Zona 4 (Mangrove) |
| `73.png` | `public/assets/images/prop-mangrove-seedling.png` | Bibit bakau tertanam di Zona 4 (Mangrove) |
| `74.png` | `public/assets/images/prop-mangrove-tree.png` | Pohon mangrove berakar tunjang di Zona 4 & Taman Hadiah |
| `75.png` | `public/assets/images/sticker-badge-mangrove.png` | Stiker lencana Zona 4 di Buku Catatan & Sertifikat |
| `76.png` | `public/assets/images/avatar-crab.png` | Avatar Bako Kepiting di Portal, Header, dan Roleplay |
| `77.png` | `public/assets/images/art-penyerbukan.png` | Ilustrasi kisah beranda & artikel Penyerbukan (`Wawasan`) |
| `78.png` | `public/assets/images/eco-mangrove.png` | Ilustrasi ekosistem mangrove di Beranda & Galeri `Wawasan` |
| `Suara Remahan Tanah.mp3` | `public/assets/audio/sfx-soil-crumble.mp3` | Efek suara remahan tanah di Zona 3 & penanaman bakau |

## 2. Aset yang Masih Bersifat Opsional / Memakai Fallback Bersama

Aplikasi sudah berjalan penuh tanpa error 404 (semua path yang dipakai di kode ada di disk). Namun jika ingin membuat setiap properti & efek suara memiliki file unik tersendiri, berikut daftar aset yang saat ini masih memakai fallback SVG atau berbagi file audio:

### Aset Gambar Opsional (Saat Ini Memakai Inline SVG)
| Nama File Disarankan | Lokasi Pakai | Status Saat Ini |
| :--- | :--- | :--- |
| `prop-waste-branch.png` (`240x240px`, RGBA) | `src/components/RiverZone.tsx` (Ranting Patah) | Memakai ikon SVG vektor inline |
| `prop-bin-recycle.png` (`240x240px`, RGBA) | `src/components/RiverZone.tsx` (Keranjang Daur Ulang) | Memakai ikon SVG vektor inline |

### Aset Audio Opsional (Saat Ini Berbagi MP3 + Web Audio Fallback)
| Nama File Disarankan | Slot `SfxName` (`src/audio/audioManager.ts`) | Status Saat Ini |
| :--- | :--- | :--- |
| `sfx-pollinate.mp3` | `'pollinate'` (Zona 1 penyerbukan & klik Taman Hadiah) | Memakai `sfx-water-drop.mp3` |
| `sfx-sort-err.mp3` | `'sort-err'` (Salah wadah di Zona 2 / peringatan Zona 1) | Memakai `sfx-whoosh.mp3` |
| `sfx-badge.mp3` | `'badge'` (Lencana terbuka & unduh sertifikat) | Memakai `sfx-biji-wake.mp3` |
| `sfx-wave.mp3` | `'wave'` (Uji gelombang ombak laut di Zona 4) | Memakai `sfx-rain.mp3` + fallback nada Web Audio |
| `sfx-click.mp3` | `'click'` (Klik UI ringan) | Memakai `sfx-wood-tap.mp3` |
