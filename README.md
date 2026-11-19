# TamanPico — Ruang Jelajah Alam Anak Indonesia

TamanPico adalah website edukasi lingkungan interaktif bergaya buku cerita untuk anak usia **7–10 tahun**. Anak diajak berperan sebagai sahabat satwa untuk memulihkan empat sudut ekosistem alam Indonesia, mengumpulkan lencana di Buku Catatan, menumbuhkan Taman Hadiah, dan memperoleh **Sertifikat Penjaga TamanPico** yang dapat diunduh sebagai PNG maupun dicetak rapi dalam format A4 landscape.

> Website ini hadir dengan identitas resmi **TamanPico** (sebelumnya *RimbaKecil*), dilengkapi ilustrasi *gouache* kustom di seluruh 4 zona dan dukungan audio interaktif.

## ✨ Fitur Utama

| Halaman / Fitur | Deskripsi |
| --- | --- |
| **Beranda (`#home`)** | Peta lembah TamanPico beranimasi siklus langit (*Otomatis, Pagi, Siang, Senja, Malam*), maskot **Pico** interaktif, empat kisah ekosistem, dan panel kenalan sahabat satwa. |
| **Portal Penjelajah (`#portal`)** | Registrasi & masuk penjelajah cilik, pilih avatar (**Lulu Lebah**, **Kiko Katak**, **Bako Kepiting**, **Pico Tunas**), atau masuk cepat sebagai Tamu. Progres tersimpan otomatis di `localStorage`. |
| **Jelajah 4 Zona (`#jelajah`)** | 1) **Kanopi Hutan** (Lulu & bunga matahari + pengatur waktu matahari)<br>2) **Aliran Sungai** (Kiko, pilah sampah kompos/daur ulang + pemicu hujan)<br>3) **Dunia Bawah Tanah** (Cici, gemburkan tanah + kaca pembesar akar X-Ray)<br>4) **Pesisir Mangrove** (Bako, bersih pantai, tanam bakau + uji gelombang ombak laut). |
| **Taman Hadiah** | Taman panorama yang tumbuh bertahap 0/4 hingga 4/4 sesuai zona yang diselesaikan, lengkap dengan 4 kartu lencana dan **Sertifikat Penjaga TamanPico**. |
| **Wawasan (`#wawasan`)** | Ensiklopedia cerita bergambar (penyerbukan, siklus air, kompos, cacing tanah), modal pembaca interaktif dengan fakta unik, serta Galeri 4 Ekosistem Nusantara. |
| **Tentang & Kontak (`#tentang`)** | Informasi karya dan formulir Kotak Surat Rimba dengan validasi aksesibel. |
| **Buku Catatan & Audio** | Dialog modal berisi koleksi cap lencana, reset 2 langkah aman, serta kontrol BGM & SFX (`AudioManager` + fallback Web Audio). |

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (build & dev server)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **Vitest** + **Testing Library** + **jsdom**
- Hash routing + state global berbasis React Context (`src/state/rimbaStore.tsx`)
- **Firebase Hosting** (`firebase.json` & `.firebaserc` -> `tamanpico-id`)

## 📁 Struktur Proyek

```text
.
├─ public/
│  └─ assets/
│     ├─ audio/      # BGM (bgm-rimba.mp3) & 6 efek suara SFX (.mp3)
│     └─ images/     # Ilustrasi gouache PNG (maskot, 4 zona, properti, lencana, galeri)
├─ src/
│  ├─ audio/         # audioManager.ts (BGM, SFX, fallback Web Audio)
│  ├─ components/    # Halaman, 4 zona interaktif, Taman Hadiah, Sertifikat, Dialog
│  ├─ state/         # rimbaStore.tsx (context, progres, badge, auth lokal)
│  ├─ styles/        # index.css (Tailwind CSS v4, container queries, @media print A4)
│  ├─ App.tsx
│  ├─ App.test.tsx   # Suite pengujian Vitest + Testing Library
│  └─ main.tsx
├─ ASSET_MANIFEST.md # Pemetaan aset & daftar aset opsional tambahan
├─ firebase.json
├─ .firebaserc
├─ index.html
└─ vite.config.ts
```

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan mode pengembangan
npm run dev

# 3. Jalankan unit & integration tests
npm test

# 4. Build produksi
npm run build

# 5. Pratinjau hasil build produksi
npm run preview
```

## 🖨️ Sertifikat & Cetak

Saat keempat zona tuntas (**4/4**), **Sertifikat Penjaga TamanPico** terbuka di Taman Hadiah:
1. **Unduh Sertifikat (PNG)** — dirender ke `<canvas>` `1400×990` beresolusi tinggi dengan crest tunas, ornamen garis emas, 4 medali zona, tanggal terbit, dan cap status resmi.
2. **Cetak Sertifikat** — memakai aturan `@media print` khusus (`@page { size: A4 landscape; margin: 10mm; }`) yang menyembunyikan seluruh navigasi, header, footer, dan pratinjau taman agar hanya sertifikat yang tercetak rapi dalam **1 halaman A4 landscape**.

## 📱 Responsif Multi-Perangkat

Tata letak diuji dan dirancang agar nyaman di seluruh ukuran layar:
- **HP Kecil (320–430 px)** & **HP Besar (430–639 px)**: header ringkas, grid tombol 2 kolom dengan spasi aman untuk kontrol audio & maskot mengambang.
- **Tablet & iPad (640–1023 px & 1024 px)**: navigasi penuh mulai `1024px`, grid artikel & ekosistem adaptif.
- **Laptop & Desktop (1120–1440 px+)**: Kompas Lembah di sisi kiri panggung jelajah dan tipografi cair berbasis `@container` + `clamp()`.

## ☁️ Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

- Proyek Firebase: `tamanpico-id`
- URL Produksi: `https://tamanpico-id.web.app`

## 📄 Lisensi

Dibuat untuk Kompetisi Web Design **EcoDigital For Environment**. Seluruh ilustrasi dan audio digunakan untuk kebutuhan edukasi dan demonstrasi proyek TamanPico.
