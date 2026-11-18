import { useEffect, useRef, useState } from 'react';
import { ExploreStage, useRimba } from '../state/rimbaStore';
import { audioManager } from '../audio/audioManager';

type TopicCategory = 'semua' | 'penyerbukan' | 'siklus-air' | 'tanah-kompos';

interface ArticleItem {
  id: string;
  category: Exclude<TopicCategory, 'semua'>;
  categoryLabel: string;
  title: string;
  readTime: string;
  image: string;
  imageAlt: string;
  summary: string;
  storyParagraphs: string[];
  funFactQuestion: string;
  funFactAnswer: string;
  relatedStage: ExploreStage;
  relatedLabel: string;
  bg: string;
}

const ARTICLES: readonly ArticleItem[] = [
  {
    id: 'art-penyerbukan',
    category: 'penyerbukan',
    categoryLabel: 'Penyerbukan',
    title: 'Kenapa Lebah & Bunga Saling Membutuhkan?',
    readTime: '2 menit baca',
    image: '/assets/images/art-penyerbukan.png',
    imageAlt: 'Ilustrasi lebah penyerbuk menghampiri bunga matahari mekar di padang cerah',
    summary:
      'Lebah mencari nektar manis di dasar bunga, sementara serbuk sari menempel di bulu halusnya dan pindah ke bunga lain. Kerja sama ini membuat tumbuhan bisa menghasilkan buah dan biji baru.',
    storyParagraphs: [
      'Di pagi hari yang cerah, matahari menghangatkan kelopak bunga matahari sehingga terbuka lebar dan mengeluarkan nektar harum.',
      'Ketika Lulu si lebah hinggap untuk minum nektar, butiran halus bernama serbuk sari menempel di kakinya lalu terbang ikut ke bunga berikutnya.',
      'Di Indonesia juga hidup lebah kelulut (Trigona) yang tidak menyengat dan sangat rajin membantu penyerbukan buah di kebun warga.'
    ],
    funFactQuestion: 'Berapa banyak bunga dan tanaman buah yang terbantu penyerbukan oleh serangga?',
    funFactAnswer:
      'Sekitar tiga dari empat tanaman berbunga di dunia bergantung pada lebah, kupu-kupu, dan penyerbuk lain untuk berbuah!',
    relatedStage: 'canopy',
    relatedLabel: 'Coba Zona 1: Kanopi',
    bg: '#FDF6DC'
  },
  {
    id: 'art-siklus-air',
    category: 'siklus-air',
    categoryLabel: 'Siklus Air',
    title: 'Perjalanan Setetes Air di Sungai Nusantara',
    readTime: '2 menit baca',
    image: '/assets/images/art-siklus-air.png',
    imageAlt: 'Ilustrasi awan hujan, aliran sungai pegunungan jernih, dan uap air kembali ke langit',
    summary:
      'Air menguap ke langit, berkumpul menjadi awan lembut, lalu turun sebagai hujan yang mengalir ke sungai. Pepohonan di gunung menjaga air itu tetap bersih hingga ke lembah.',
    storyParagraphs: [
      'Matahari menghangatkan air sungai dan kolam hingga naik pelan ke langit sebagai uap air yang sejuk.',
      'Di atas sana, uap air berkumpul menjadi awan hujan lalu turun membasahi hutan, sawah, dan sungai tempat ikan serta katak berenang.',
      'Karena katak bernapas sebagian melalui kulitnya yang lembap, sungai yang bersih tanpa sampah plastik menjadi rumah teraman bagi mereka.'
    ],
    funFactQuestion: 'Mengapa hutan di hulu gunung menjaga sungai tetap mengalir saat kemarau?',
    funFactAnswer:
      'Akar pohon menahan air hujan seperti spons raksasa di dalam tanah lalu melepaskannya perlahan ke mata air!',
    relatedStage: 'river',
    relatedLabel: 'Coba Zona 2: Sungai',
    bg: '#D9EDE9'
  },
  {
    id: 'art-kompos',
    category: 'tanah-kompos',
    categoryLabel: 'Kompos & Tanah',
    title: 'Membedakan Sampah Kompos & Daur Ulang',
    readTime: '3 menit baca',
    image: '/assets/images/art-kompos.png',
    imageAlt: 'Ilustrasi daun kering berubah menjadi kompos subur dan botol kaca terpilah rapi',
    summary:
      'Daun kering dan ranting bisa hancur menjadi kompos subur dalam beberapa minggu, sedangkan botol plastik butuh waktu sangat lama. Memilah benda membantu sungai dan kebun tetap sehat.',
    storyParagraphs: [
      'Di lantai hutan, daun gugur dan ranting kecil yang lapuk dimakan oleh cacing tanah dan jamur baik hingga berubah menjadi tanah humus berwarna gelap.',
      'Sebaliknya, botol plastik dan kaleng tidak dapat hancur oleh tanah, jadi harus dicuci dan dimasukkan ke keranjang daur ulang agar dapat dibentuk kembali menjadi barang berguna.',
      'Dengan memisahkan kompos dan daur ulang sejak dari rumah, sampah tidak menumpuk menyumbat aliran air sungai.'
    ],
    funFactQuestion: 'Berapa lama kira-kira botol plastik bertahan di alam jika dibuang ke sungai?',
    funFactAnswer:
      'Botol plastik bisa bertahan lebih dari 400 tahun sebelum hancur menjadi serpihan kecil mikroplastik!',
    relatedStage: 'river',
    relatedLabel: 'Latih Pilah Sampah',
    bg: '#DCEEDB'
  },
  {
    id: 'art-cacing',
    category: 'tanah-kompos',
    categoryLabel: 'Kompos & Tanah',
    title: 'Lorong Rahasia Cacing Tanah & Akar Oak',
    readTime: '2 menit baca',
    image: '/assets/images/art-cacing.png',
    imageAlt: 'Ilustrasi cacing tanah di lorong gembur di samping akar pohon oak menyerap air',
    summary:
      'Cacing tanah menggali terowongan kecil di bawah rumput supaya udara dan air hujan mudah turun menuju rambut akar. Berkat terowongan itu, tunas pohon oak dapat tumbuh tinggi.',
    storyParagraphs: [
      'Tanah yang sering terinjak menjadi terlalu padat, membuat air hujan menggenang di atas dan sulit menembus biji pohon yang tertidur.',
      'Saat Cici si cacing bergerak di dalam tanah, tubuhnya membentuk lorong-lorong kecil seperti jalan rahasia bagi udara segar dan butiran air.',
      'Akar rambut pohon oak lalu menyedot air serta mineral lewat lorong tersebut dan mengirimkannya naik ke batang hingga ke daun paling atas.'
    ],
    funFactQuestion: 'Apakah cacing tanah memiliki mata seperti manusia?',
    funFactAnswer:
      'Tidak! Cacing tanah tidak punya mata, tetapi kulitnya peka merasakan cahaya terang dan getaran di dalam tanah.',
    relatedStage: 'underground',
    relatedLabel: 'Coba Zona 3: Bawah Tanah',
    bg: '#E8F3E5'
  }
];

const GALLERY_ECOSYSTEMS = [
  {
    id: 'eco-kalimantan',
    region: 'Kalimantan',
    title: 'Hutan Hujan Tropis',
    image: '/assets/images/eco-kalimantan.png',
    imageAlt: 'Hutan hujan Kalimantan dengan pohon tinggi, orangutan, dan burung enggang',
    caption: 'Kanopi pohon tinggi menjadi rumah orangutan, enggang, dan ribuan jenis anggrek hutan.'
  },
  {
    id: 'eco-mangrove',
    region: 'Pesisir Jawa & Bali',
    title: 'Hutan Mangrove Pesisir',
    image: '/assets/images/eco-mangrove.png',
    imageAlt: 'Akar bakau hutan mangrove di tepi laut biru jernih bersama ikan dan kepiting kecil',
    caption: 'Akar bakau yang rapat menahan ombak laut sekaligus menjadi tempat berlindung ikan dan kepiting kecil.'
  },
  {
    id: 'eco-sumatra',
    region: 'Pegunungan Sumatra',
    title: 'Sungai Jernih Berbatu',
    image: '/assets/images/eco-sumatra.png',
    imageAlt: 'Aliran sungai pegunungan berbatu di Sumatra dengan pakis hijau dan capung',
    caption: 'Aliran air sejuk dari hutan pegunungan menjaga populasi katak sungai, capung jarum, dan ikan air tawar.'
  },
  {
    id: 'eco-sumba',
    region: 'Nusa Tenggara Timur',
    title: 'Padang Sabana & Bunga Liar',
    image: '/assets/images/eco-sumba.png',
    imageAlt: 'Perbukitan sabana Sumba yang keemasan dengan bunga liar dan kupu-kupu',
    caption: 'Hamparan rumput keemasan di musim kemarau menjadi tempat lebah liar dan kupu-kupu mencari nektar.'
  }
];

const FILTER_OPTIONS: Array<{ id: TopicCategory; label: string }> = [
  { id: 'semua', label: 'Semua Topik' },
  { id: 'penyerbukan', label: 'Penyerbukan' },
  { id: 'siklus-air', label: 'Siklus Air' },
  { id: 'tanah-kompos', label: 'Kompos & Tanah' }
];

export function WawasanPage() {
  const { navigate } = useRimba();
  const [filter, setFilter] = useState<TopicCategory>('semua');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [modalFactOpen, setModalFactOpen] = useState(false);

  const storyDialogRef = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const visibleArticles =
    filter === 'semua' ? ARTICLES : ARTICLES.filter((a) => a.category === filter);

  const activeArticle = ARTICLES.find((a) => a.id === activeStoryId) || null;

  useEffect(() => {
    const dialog = storyDialogRef.current;
    if (!dialog) return;

    if (activeArticle) {
      setModalFactOpen(false);
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
  }, [activeArticle]);

  useEffect(() => {
    const dialog = storyDialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      setActiveStoryId(null);
      setModalFactOpen(false);
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  const openStoryModal = (id: string) => {
    audioManager.playSfx('click');
    setModalFactOpen(false);
    setActiveStoryId(id);
  };

  const closeStoryModal = () => {
    const dialog = storyDialogRef.current;
    if (dialog && dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      setActiveStoryId(null);
      setModalFactOpen(false);
    }
  };

  return (
    <section
      id="wawasan-page"
      className="pt-16 sm:pt-20 pb-20 px-5 sm:px-10 bg-gradient-to-b from-[#FAF8F0] via-[#F2F7EE] to-[#E8F3E5] scroll-mt-24"
      aria-labelledby="wawasan-title"
    >
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-extrabold uppercase tracking-wider text-[#477A59] m-0">
            Ensiklopedia &amp; Galeri Alam
          </p>
          <h1 id="wawasan-title" className="font-story text-3xl sm:text-5xl font-bold mt-2 mb-3">
            Wawasan Alam Nusantara
          </h1>
          <p className="text-base sm:text-lg text-[#293A30]/90 m-0">
            Baca cerita bergambar tentang bagaimana bunga, sungai, cacing tanah, dan hutan Indonesia bekerja bersama menjaga bumi.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2.5 mb-8" role="group" aria-label="Filter topik wawasan alam">
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                className={`touch-btn ${active ? 'btn-primary' : 'btn-paper'} px-4 py-2 text-sm sm:text-base`}
                onClick={() => {
                  audioManager.playSfx('click');
                  setFilter(opt.id);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Clean Visual Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {visibleArticles.map((article) => (
            <article
              key={article.id}
              className="field-note p-5 sm:p-6 flex flex-col justify-between gap-4"
              style={{ backgroundColor: article.bg }}
            >
              <div className="space-y-3.5">
                <div className="overflow-hidden rounded-2xl border-2 border-[#293A30]/20 aspect-[2/1] bg-[#FAF8F0]">
                  <img
                    src={article.image}
                    alt={article.imageAlt}
                    className="w-full h-full object-cover block"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF8F0] border border-[#293A30]">
                    {article.categoryLabel}
                  </span>
                  <span className="text-xs font-bold text-[#2F5C40]">{article.readTime}</span>
                </div>

                <h2 className="font-story text-2xl font-bold m-0 text-[#293A30]">{article.title}</h2>
                <p className="text-base leading-relaxed text-[#293A30]/90 m-0">{article.summary}</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="touch-btn btn-primary w-full py-2.5 text-sm sm:text-base"
                  onClick={() => openStoryModal(article.id)}
                >
                  Baca Cerita Lengkap →
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Galeri Ekosistem Nusantara (Separate Dedicated Section) */}
        <section aria-labelledby="gallery-title" className="pt-4">
          <div className="mb-6">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
              Galeri Ekosistem Nusantara
            </p>
            <h2 id="gallery-title" className="font-story text-3xl font-bold mt-1 mb-2">
              Empat Lanskap Ekosistem Indonesia
            </h2>
            <p className="text-base text-[#293A30]/85 m-0 max-w-2xl">
              Kenali keindahan hutan hujan, mangrove pesisir, sungai pegunungan, dan sabana berbunga dari berbagai pulau di Nusantara.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {GALLERY_ECOSYSTEMS.map((eco) => (
              <figure key={eco.id} className="field-note p-4 m-0 flex flex-col gap-3 bg-[#FAF8F0]">
                <div className="overflow-hidden rounded-2xl border-2 border-[#293A30]/20 aspect-[2/1] bg-[#DCEEDB]">
                  <img
                    src={eco.image}
                    alt={eco.imageAlt}
                    className="w-full h-full object-cover block"
                  />
                </div>
                <figcaption>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] m-0">
                    {eco.region}
                  </p>
                  <h3 className="font-story text-lg font-bold mt-0.5 mb-1">{eco.title}</h3>
                  <p className="text-sm leading-relaxed text-[#293A30]/90 m-0">{eco.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>

      {/* Interactive Story Reader Modal */}
      <dialog
        ref={storyDialogRef}
        id="wawasan-story-dialog"
        className="journal-dialog"
        aria-labelledby="story-reader-title"
        {...({ closedby: 'any' } as Record<string, string>)}
      >
        {activeArticle && (
          <div className="journal-paper space-y-5">
            <div className="journal-torn-top" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FDF6DC] border border-[#293A30] mb-2">
                  {activeArticle.categoryLabel} &bull; {activeArticle.readTime}
                </span>
                <h2 id="story-reader-title" className="font-story text-2xl sm:text-3xl font-bold m-0">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                ref={closeBtnRef}
                id="story-reader-close"
                type="button"
                className="touch-btn btn-paper px-4 py-2 shrink-0"
                onClick={closeStoryModal}
              >
                Tutup
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-[#293A30]/25 aspect-[2/1]">
              <img
                src={activeArticle.image}
                alt={activeArticle.imageAlt}
                className="w-full h-full object-cover block"
              />
            </div>

            <div className="space-y-3 text-lg sm:text-xl leading-relaxed text-[#293A30]">
              {activeArticle.storyParagraphs.map((para, idx) => (
                <p key={idx} className="m-0">
                  {para}
                </p>
              ))}
            </div>

            {/* Tahukah Kamu? Box */}
            <div className="rounded-2xl bg-[#FDF6DC] border-2 border-[#293A30]/25 p-4 sm:p-5 space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] m-0">
                Tahukah Kamu?
              </p>
              <p className="text-base sm:text-lg font-bold m-0 text-[#293A30]">
                {activeArticle.funFactQuestion}
              </p>
              <button
                type="button"
                aria-expanded={modalFactOpen}
                className="touch-btn btn-paper px-4 py-2 text-sm sm:text-base"
                onClick={() => {
                  audioManager.playSfx('pollinate');
                  setModalFactOpen((prev) => !prev);
                }}
              >
                {modalFactOpen ? 'Tutup Jawaban' : 'Buka Jawaban Fakta'}
              </button>
              {modalFactOpen && (
                <p className="text-base sm:text-lg font-semibold text-[#2F5C40] m-0 pt-1">
                  {activeArticle.funFactAnswer}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="touch-btn btn-forest px-5 py-2.5 text-sm sm:text-base"
                onClick={() => {
                  audioManager.playSfx('click');
                  const targetStage = activeArticle.relatedStage;
                  closeStoryModal();
                  navigate('jelajah', { stage: targetStage });
                }}
              >
                {activeArticle.relatedLabel} →
              </button>
              <button
                type="button"
                className="touch-btn btn-paper px-4 py-2 text-sm"
                onClick={closeStoryModal}
              >
                Kembali ke Wawasan
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
