# TamanPico — Ruang Jelajah Alam Anak Indonesia

TamanPico adalah website edukasi lingkungan interaktif untuk anak usia 7–10 tahun. Anak diajak menjelajahi empat zona alam, menyelesaikan misi, mengumpulkan lencana, dan akhirnya mendapatkan **Sertifikat Penjaga TamanPico** yang bisa diunduh (PNG) maupun dicetak.

> Sebelumnya proyek ini bernama *RimbaKecil*. Seluruh branding, judul halaman, dan sertifikat kini memakai nama **TamanPico**.

## ✨ Fitur Utama

| Halaman / Fitur | Deskripsi |
| --- | --- |
| **Beranda** | Peta besar TamanPico dengan ilustrasi bukit, maskot Pico, dan ajakan mulai menjelajah. |
| **Portal Penjelajah** | Registrasi / login penjelajah cilik, pilih avatar (Lulu Lebah, Kiko Katak, Bako Kepiting, Pico Tunas), atau masuk sebagai tamu. Progres tersimpan di `localStorage`. |
| **Jelajah (4 Zona)** | **Kanopi Hutan** (penyerbukan & bunga matahari), **Sungai** (pemilahan sampah & siklus air), **Bawah Tanah** (tanah, kompos, akar), **Mangrove** (pesisir & gelombang). Setiap zona punya sandbox interaktif. |
| **Taman Hadiah** | Taman yang “tumbuh” sesuai zona yang diselesaikan, lengkap dengan 4 lencana dan **sertifikat** resmi. |
| **Wawasan** | Artikel bergambar: penyerbukan, siklus air, tanah & kompos, dengan kuis fakta unik. |
| **Tentang & Kontak** | Cerita di balik TamanPico serta formulir pesan (disimpan lokal). |
| **Jurnal Lapangan** | Dialog jurnal berisi cap/lencana yang sudah dikumpulkan anak. |
| **Audio** | BGM lembut + efek suara, dapat dimatikan lewat tombol audio. |

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** (build & dev server)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **Vitest** + Testing Library (unit test)
- Routing berbasis hash + state global lewat React Context (`src/state/rimbaStore.tsx`)
- Firebase Hosting (opsional, konfigurasi di `firebase.json`)

## 📁 Struktur Proyek

```text
.
├─ public/
│  └─ assets/
│     ├─ audio/      # BGM & efek suara
│     └─ images/     # ±94 ilustrasi PNG (maskot, zona, properti, lencana)
├─ src/
│  ├─ audio/         # audioManager (BGM, SFX, fallback Web Audio)
│  ├─ components/    # halaman & komponen UI
│  ├─ state/         # rimbaStore (context, progres, badge, auth lokal)
│  ├─ styles/        # index.css (Tailwind + style kustom + aturan cetak)
│  ├─ App.tsx
│  └─ main.tsx
├─ index.html
├─ vite.config.ts
└─ firebase.json
```

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Mode pengembangan
npm run dev

# 3. Build produksi
npm run build

# 4. Pratinjau hasil build
npm run preview

# 5. Jalankan test
npm test
```

## 🖨️ Sertifikat

Sertifikat terbuka otomatis setelah keempat zona selesai (4/4). Tersedia dua aksi:

1. **Unduh Sertifikat (PNG)** — dibuat langsung di `<canvas>` (1400×990) dengan tata letak rapi: judul, nama penjelajah (otomatis menyesuaikan panjang nama), empat cap zona, tanggal terbit, dan status.
2. **Cetak Sertifikat** — hanya kartu sertifikat yang dicetak, otomatis **A4 landscape** tanpa elemen navigasi.

## 📱 Responsif

Antarmuka dioptimalkan untuk:
- HP kecil (320–430 px)
- HP besar & tablet lipat (430–640 px)
- Tablet / iPad (768–1024 px, portrait & landscape)
- Laptop & desktop (1280 px ke atas)

Sertifikat memakai `clamp()` untuk tipografi, grid cap 4 kolom di layar lebar dan 2 kolom di HP.

## 🎨 Palet & Tipografi

- Krim `#FAF8F0`, Hijau Hutan `#293A30`, Daun `#477A59`, Sage `#A8C99A`, Meadow `#C8DEA4`, Mint `#DCEEDB`, Langit `#D9EDE9`, Mentega `#F5D77D`, Coral `#E9A58E`
- **Fraunces** (judul) & **Plus Jakarta Sans** (antarmuka)

## ☁️ Deploy

```bash
npm run build
npx firebase-tools deploy --only hosting
```

Proyek Firebase default: `tamanpico-id` (lihat `.firebaserc`). Bisa juga di-deploy ke Vercel/Netlify dengan build command `npm run build` dan output `dist`.

## 📄 Lisensi

Dibuat untuk keperluan pembelajaran / kompetisi desain web. Aset ilustrasi dan audio digunakan untuk kebutuhan demo proyek.
