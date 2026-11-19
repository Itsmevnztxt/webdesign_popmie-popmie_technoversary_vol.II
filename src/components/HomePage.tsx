import { useState } from 'react';
import { ExploreStage, useRimba } from '../state/rimbaStore';
import { HeroSection } from './HeroSection';
import { HeroToStoryDivider, StoryToSpotlightDivider } from './WaveDividers';
import { ExplorerAvatarSvg } from './AvatarIcon';
import { audioManager } from '../audio/audioManager';

const ENVIRONMENTAL_STORIES = [
  {
    id: 'pollinator',
    title: 'Penyerbuk Kehilangan Bunga',
    tag: 'Kanopi Hutan',
    image: '/assets/images/art-penyerbukan.png',
    imageAlt: 'Ilustrasi lebah penyerbuk dan bunga matahari yang menunggu sinar matahari pagi',
    mascotImg: '/assets/images/mascot-biji-worried.png',
    mascotLine: 'Awan gelap bikin bunga layu, Lulu jadi bingung mencari nektar!',
    description:
      'Ketika langit tertutup awan gelap dan bunga jarang disinari matahari, lebah kesulitan menemukan nektar untuk memindahkan serbuk sari ke bunga lain.'
  },
  {
    id: 'river',
    title: 'Sungai Tersumbat Sampah',
    tag: 'Aliran Sungai',
    image: '/assets/images/art-siklus-air.png',
    imageAlt: 'Ilustrasi siklus air bersih dari awan hujan menuju sungai hutan yang jernih',
    mascotImg: '/assets/images/mascot-biji-hint.png',
    mascotLine: 'Air jernih adalah rumah nyaman bagi Kiko si katak dan ikan-ikan sungai.',
    description:
      'Botol plastik dan kaleng yang jatuh ke sungai tidak bisa membusuk. Air menjadi keruh sehingga ikan dan katak kecil sulit bernapas dan berenang.'
  },
  {
    id: 'soil',
    title: 'Tanah Keras & Kurang Udara',
    tag: 'Dunia Bawah Tanah',
    image: '/assets/images/art-cacing.png',
    imageAlt: 'Ilustrasi cacing tanah menggali terowongan udara di dekat akar pohon oak',
    mascotImg: '/assets/images/mascot-biji-worried.png',
    mascotLine: 'Biji pohon oak butuh lorong udara dari Cici agar akarnya bisa minum air hujan.',
    description:
      'Tanah yang mengeras menahan air hujan di permukaan. Tanpa terowongan cacing tanah, akar pohon muda kekurangan air dan mineral untuk tumbuh.'
  },
  {
    id: 'mangrove',
    title: 'Pesisir Rawan Ombak & Sampah Laut',
    tag: 'Pesisir Mangrove',
    image: '/assets/images/eco-mangrove.png',
    imageAlt: 'Ilustrasi hutan bakau pesisir dengan akar tunjang menjaga pantai dan kepiting kecil',
    mascotImg: '/assets/images/mascot-biji-hint.png',
    mascotLine: 'Akar bakau yang kuat menjadi benteng alami pantai dan rumah bagi Bako si kepiting!',
    description:
      'Jaring dan plastik yang tersangkut di pantai menghambat tunas bakau tumbuh. Tanpa hutan mangrove, ombak besar mudah mengikis garis pantai.'
  }
];

const ROLEPLAY_ANIMALS: Array<{
  stage: ExploreStage;
  avatar: 'bee' | 'frog' | 'worm' | 'crab';
  shortName: string;
  name: string;
  role: string;
  zone: string;
  reward: string;
  taskSummary: string;
  quote: string;
  accent: string;
}> = [
  {
    stage: 'canopy',
    avatar: 'bee',
    shortName: 'Lulu Lebah',
    name: 'Lulu si Lebah Penyerbuk',
    role: 'Zona 1: Kanopi Hutan',
    zone: 'Kanopi & Padang Bunga',
    reward: 'Bibit Bunga Matahari',
    taskSummary:
      'Singkirkan awan kelabu yang menghalangi matahari, lalu bantu Lulu hinggap ke bunga matahari agar padang bunga mekar kembali!',
    quote: 'Bzz! Ayo buka langit supaya bungaku mekar dan kupu-kupu datang berkunjung!',
    accent: '#FDF6DC'
  },
  {
    stage: 'river',
    avatar: 'frog',
    shortName: 'Kiko Katak',
    name: 'Kiko si Katak Penjaga Sungai',
    role: 'Zona 2: Aliran Sungai',
    zone: 'Tepi Sungai & Kolam Teratai',
    reward: 'Teratai Biru',
    taskSummary:
      'Pilah botol plastik ke keranjang daur ulang dan ranting daun ke tumpukan kompos supaya air sungai kembali bening menyegarkan.',
    quote: 'Kwek! Sungai yang bersih membuat teratai mekar dan temanku ikan berenang gembira.',
    accent: '#D9EDE9'
  },
  {
    stage: 'underground',
    avatar: 'worm',
    shortName: 'Cici Cacing',
    name: 'Cici si Cacing & Tunas Oak',
    role: 'Zona 3: Dunia Bawah Tanah',
    zone: 'Lapisan Humus & Akar',
    reward: 'Pohon Oak Rimba',
    taskSummary:
      'Gemburkan gumpalan tanah keras, gali terowongan udara bersama Cici, lalu siram biji oak sampai akarnya tumbuh kuat.',
    quote: 'Wuss! Lorong gembur di bawah tanah membantu pohon oak tumbuh tinggi menjulang!',
    accent: '#DCEEDB'
  },
  {
    stage: 'mangrove',
    avatar: 'crab',
    shortName: 'Bako Kepiting',
    name: 'Bako si Kepiting Bakau',
    role: 'Zona 4: Pesisir Mangrove',
    zone: 'Teluk Pesisir Bakau',
    reward: 'Hutan Bakau Pesisir',
    taskSummary:
      'Angkat jaring dan botol plastik di pesisir surut, lalu tanam bibit bakau supaya akar tunjangnya mampu meredam ombak pasang!',
    quote: 'Krak! Ayo tanam bibit mangrove supaya pantai kita kuat menahan ombak laut!',
    accent: '#D9EDE9'
  }
];

export function HomePage() {
  const { state, navigate } = useRimba();
  const [selectedStage, setSelectedStage] = useState<'canopy' | 'river' | 'underground' | 'mangrove'>('canopy');

  const selectedAnimal =
    ROLEPLAY_ANIMALS.find((animal) => animal.stage === selectedStage) || ROLEPLAY_ANIMALS[0];
  const isSelectedCompleted = Boolean(
    state.badges[selectedAnimal.stage as 'canopy' | 'river' | 'underground' | 'mangrove']
  );

  const handlePreviewExplore = (stage: ExploreStage) => {
    audioManager.playSfx('click');
    if (state.passport) {
      navigate('jelajah', { stage });
    } else {
      navigate('portal', { stage });
    }
  };

  return (
    <div>
      <HeroSection />
      <HeroToStoryDivider />

      {/* Section 2: Alternating Asymmetric Zig-Zag Storybook Layout */}
      <section
        className="relative py-12 sm:py-16 px-5 sm:px-10 bg-[#FAF8F0] overflow-hidden"
        aria-labelledby="story-problems-title"
      >
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#477A59] m-0">
              Kisah Lembah Hari Ini
            </p>
            <h2 id="story-problems-title" className="font-story text-3xl sm:text-4xl font-bold mt-2 mb-3">
              Empat Sudut Alam yang Menunggu Tanganmu
            </h2>
            <p className="text-base sm:text-lg text-[#293A30]/90 m-0">
              Setiap bagian alam dari kanopi hutan, sungai, akar bawah tanah, hingga pesisir bakau saling terhubung seperti halaman buku cerita.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {ENVIRONMENTAL_STORIES.map((story, idx) => {
              const imageRight = idx % 2 === 1;
              return (
                <article
                  key={story.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center"
                >
                  {/* Illustration in organic frame */}
                  <div
                    className={`md:col-span-6 ${imageRight ? 'md:order-2' : 'md:order-1'}`}
                  >
                    <div
                      className={`overflow-hidden border-2 border-[#293A30]/80 shadow-[0_8px_0_rgba(41,58,48,0.16)] aspect-[16/9] ${
                        imageRight
                          ? 'rounded-[28px_46px_26px_44px]'
                          : 'rounded-[46px_26px_44px_28px]'
                      }`}
                    >
                      <img
                        src={story.image}
                        alt={story.imageAlt}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  </div>

                  {/* Editorial narrative + Pico storytelling sidekick */}
                  <div
                    className={`md:col-span-6 space-y-3.5 ${imageRight ? 'md:order-1' : 'md:order-2'}`}
                  >
                    <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-[#293A30] bg-[#FDF6DC] text-[#293A30]">
                      0{idx + 1} — {story.tag}
                    </span>
                    <h3 className="font-story text-2xl sm:text-3xl font-bold m-0 text-[#293A30]">
                      {story.title}
                    </h3>
                    <p className="text-base sm:text-lg leading-relaxed text-[#293A30]/90 m-0">
                      {story.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={story.mascotImg}
                        alt=""
                        aria-hidden="true"
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
                      />
                      <p className="text-sm sm:text-base font-semibold italic text-[#2F5C40] bg-[#DCEEDB]/75 border border-[#293A30]/20 rounded-2xl px-4 py-2 m-0">
                        &ldquo;{story.mascotLine}&rdquo; — Pico
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </section>

      <StoryToSpotlightDivider />

      {/* Section 3: Interactive Character Spotlight Stage */}
      <section
        className="relative py-12 sm:py-16 pb-20 sm:pb-24 px-5 sm:px-10 bg-[#E8F3E5] overflow-hidden"
        aria-labelledby="animals-preview-title"
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
                Bermain Peran Satwa
              </p>
              <h2 id="animals-preview-title" className="font-story text-3xl sm:text-4xl font-bold mt-2 mb-2">
                Pilih Empat Sahabat Penjaga TamanPico
              </h2>
              <p className="text-base sm:text-lg text-[#293A30]/90 m-0">
                Ketuk salah satu sahabat satwa untuk berkenalan dan melihat misi seru di zonanya!
              </p>
            </div>
            <button
              type="button"
              className="touch-btn btn-paper px-5 py-3 self-start md:self-auto shrink-0"
              onClick={() => {
                audioManager.playSfx('click');
                navigate('portal');
              }}
            >
              Buka Kartu Penjelajah →
            </button>
          </div>

          {/* Clickable Animal Guardian Selector Bar */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
            role="group"
            aria-label="Pilih sahabat penjaga rimba"
          >
            {ROLEPLAY_ANIMALS.map((animal) => {
              const active = selectedAnimal.stage === animal.stage;
              const completed = Boolean(
                state.badges[animal.stage as 'canopy' | 'river' | 'underground' | 'mangrove']
              );
              return (
                <button
                  key={animal.stage}
                  id={`spotlight-select-${animal.stage}`}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    audioManager.playSfx('click');
                    setSelectedStage(animal.stage as 'canopy' | 'river' | 'underground' | 'mangrove');
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-3xl border-2 text-left transition-all duration-300 ${
                    active
                      ? 'bg-[#FAF8F0] border-[#293A30] shadow-[0_5px_0_#293A30] -translate-y-0.5'
                      : 'bg-[#FAF8F0]/65 border-[#293A30]/25 hover:bg-[#FAF8F0] hover:border-[#293A30]/60'
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-[#293A30] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: animal.accent }}
                  >
                    <ExplorerAvatarSvg avatar={animal.avatar} size={52} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
                      {animal.role}
                    </p>
                    <p className="font-story text-lg font-bold text-[#293A30] m-0 truncate">
                      {animal.shortName}
                    </p>
                    <p className="text-xs font-bold text-[#477A59] m-0">
                      {completed ? 'Misi Selesai ✓' : animal.zone}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Spotlight Stage */}
          <div
            key={selectedAnimal.stage}
            id="animal-spotlight-stage"
            className="field-note p-6 sm:p-8 bg-[#FAF8F0] route-stage-enter"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-[34px] border-2 border-[#293A30] flex items-center justify-center shrink-0 shadow-[0_5px_0_rgba(41,58,48,0.18)]"
                style={{ backgroundColor: selectedAnimal.accent }}
              >
                <ExplorerAvatarSvg avatar={selectedAnimal.avatar} size={112} />
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#DCEEDB] border border-[#293A30]">
                    {selectedAnimal.role}
                  </span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#F5D77D] border border-[#293A30]">
                    Hadiah Ekosistem: {selectedAnimal.reward}
                  </span>
                  {isSelectedCompleted && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#477A59] text-[#FAF8F0] border border-[#293A30]">
                      Taman Pulih ✓
                    </span>
                  )}
                </div>

                <h3 className="font-story text-2xl sm:text-3xl font-bold m-0 text-[#293A30]">
                  {selectedAnimal.name}
                </h3>

                <p className="text-base sm:text-lg leading-relaxed text-[#293A30]/90 m-0">
                  {selectedAnimal.taskSummary}
                </p>

                <p className="text-sm sm:text-base font-semibold italic text-[#477A59] m-0">
                  &ldquo;{selectedAnimal.quote}&rdquo;
                </p>

                <div className="pt-2">
                  <button
                    id="spotlight-play-btn"
                    type="button"
                    className="touch-btn btn-primary px-6 py-3.5 text-base sm:text-lg"
                    onClick={() => handlePreviewExplore(selectedAnimal.stage)}
                  >
                    Mainkan Peran {selectedAnimal.name} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
