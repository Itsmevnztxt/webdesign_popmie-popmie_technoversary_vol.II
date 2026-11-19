import React, { useRef, useState } from 'react';
import { useRimba } from '../state/rimbaStore';
import { audioManager } from '../audio/audioManager';

const CONTACT_STORAGE_KEY = 'TamanPico_contact_messages_v1';

interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function AboutContactPage() {
  const { announce, navigate } = useRimba();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('masukan');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);

  const validateField = (field: keyof ContactErrors, value: string): string | undefined => {
    const trimmed = value.trim();
    if (field === 'name') {
      if (!trimmed) return 'Tuliskan nama panggilan atau nama lengkapmu.';
      if (trimmed.length < 2) return 'Nama minimal 2 huruf ya.';
      return undefined;
    }
    if (field === 'email') {
      if (!trimmed) return 'Tuliskan alamat surat elektronik untuk balasan pesan.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Gunakan format surat elektronik seperti nama@contoh.id.';
      }
      return undefined;
    }
    if (field === 'message') {
      if (!trimmed) return 'Tuliskan pesan atau ceritamu terlebih dahulu.';
      if (trimmed.length < 10) return 'Pesan minimal 10 huruf supaya mudah dibaca dengan jelas.';
      return undefined;
    }
    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: ContactErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      message: validateField('message', message)
    };
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.message) {
      messageRef.current?.focus();
      return;
    }

    try {
      const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const entry = {
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        sentAt: new Date().toISOString()
      };
      window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify([entry, ...list].slice(0, 5)));
    } catch {
      // Safe fallback if browser storage unavailable
    }

    audioManager.playSfx('badge');
    const notice = `Terima kasih, ${name.trim()}! Pesanmu sudah tersimpan di Kotak Surat Rimba.`;
    setSubmittedNotice(notice);
    announce(notice);
    setName('');
    setEmail('');
    setTopic('masukan');
    setMessage('');
    setErrors({});
  };

  return (
    <section
      id="tentang-page"
      className="pt-14 sm:pt-16 pb-20 px-5 sm:px-10 bg-gradient-to-b from-[#FAF8F0] via-[#F2F7EE] to-[#DCEEDB]"
      aria-labelledby="about-title"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        {/* About TamanPico & Warm Family Story Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 field-note p-6 sm:p-8 space-y-4">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#477A59] m-0">
              Kisah &amp; Tujuan TamanPico
            </p>
            <h1 id="about-title" className="font-story text-3xl sm:text-5xl font-bold mt-1 mb-2">
              Mengenal Misi TamanPico
            </h1>
            <p className="text-base sm:text-lg leading-relaxed m-0">
              TamanPico dirancang untuk anak usia 7–10 tahun agar mereka belajar merawat lingkungan melalui eksperimen langsung dan cerita bergambar.
            </p>
            <p className="text-base leading-relaxed text-[#293A30]/90 m-0">
              Anak-anak berperan sebagai Lulu si Lebah, Kiko si Katak, Cici si Cacing, dan Bako si Kepiting untuk melihat hubungan nyata antara sinar matahari, air sungai yang bersih, tanah yang gembur, dan pesisir bakau. Semua kemajuan belajar disimpan langsung di perangkatmu supaya bisa dilanjutkan kapan saja.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="field-note-mint p-4">
                <h2 className="font-story text-lg font-bold mt-0 mb-1">Belajar Lewat Bermain</h2>
                <p className="text-sm leading-relaxed m-0">
                  Anak-anak mencoba langsung menjaga bunga, sungai, dan tanah bersama sahabat satwa.
                </p>
              </div>
              <div className="field-note-mint p-4">
                <h2 className="font-story text-lg font-bold mt-0 mb-1">Ramah untuk Anak &amp; Keluarga</h2>
                <p className="text-sm leading-relaxed m-0">
                  Tampilan lembut bergaya buku cerita yang mudah dimainkan di ponsel maupun komputer.
                </p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 field-note p-6 sm:p-7 bg-[#FDF6DC] space-y-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#477A59] m-0">
              TENTANG KARYA INI
            </p>
            <h2 className="font-story text-2xl font-bold mt-0 mb-1">
              TamanPico — Ruang Jelajah Alam Anak Indonesia
            </h2>
            <dl className="space-y-3 text-sm sm:text-base m-0">
              <div>
                <dt className="font-bold text-[#477A59]">Judul Karya</dt>
                <dd className="m-0 font-semibold">TamanPico — Ruang Jelajah Alam Anak Indonesia</dd>
              </div>
              <div>
                <dt className="font-bold text-[#477A59]">Kategori</dt>
                <dd className="m-0 font-semibold">Kompetisi Web Design EcoDigital For Environment</dd>
              </div>
              <div>
                <dt className="font-bold text-[#477A59]">Untuk Siapa</dt>
                <dd className="m-0 font-semibold">Anak Usia 7–10 Tahun, Orang Tua, dan Guru</dd>
              </div>
            </dl>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                className="touch-btn btn-primary px-4 py-2.5 text-sm"
                onClick={() => navigate('portal')}
              >
                Buat Kartu Penjelajah
              </button>
              <button
                type="button"
                className="touch-btn btn-paper px-4 py-2.5 text-sm"
                onClick={() => navigate('jelajah')}
              >
                Coba Panggung Jelajah
              </button>
            </div>
          </aside>
        </div>

        {/* Kotak Surat Rimba with Pico companion side illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 field-note p-6 sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#477A59] m-0">
              Kotak Surat Rimba
            </p>
            <h2 id="contact-form-title" className="font-story text-2xl sm:text-3xl font-bold mt-1 mb-2">
              Kirim Pesan atau Cerita Serumu
            </h2>
            <p className="text-base text-[#293A30]/85 mt-0 mb-6">
              Punya ide cerita satwa baru, saran untuk guru, atau cerita seru saat menjelajahi alam? Tulis suratmu di bawah ini!
            </p>

            {submittedNotice && (
              <div
                id="contact-success-banner"
                role="status"
                aria-live="polite"
                className="field-note-mint p-4 mb-6 font-bold text-[#293A30]"
              >
                {submittedNotice}
              </div>
            )}

            <form
              id="contact-form"
              aria-labelledby="contact-form-title"
              className="space-y-5"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block font-bold text-base mb-1.5">
                    Nama Pengirim
                  </label>
                  <input
                    ref={nameRef}
                    id="contact-name"
                    name="senderName"
                    type="text"
                    required
                    minLength={2}
                    autoComplete="name"
                    placeholder="Nama kamu atau guru pendamping"
                    value={name}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={`rimba-input${errors.name ? ' is-invalid' : ''}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (errors.name && !validateField('name', val)) {
                        setErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (name) {
                        setErrors((prev) => ({ ...prev, name: validateField('name', name) }));
                      }
                    }}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="rimba-error-msg">
                      <span role="img" aria-label="Error">!</span> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-email" className="block font-bold text-base mb-1.5">
                    Alamat Surat Elektronik
                  </label>
                  <input
                    ref={emailRef}
                    id="contact-email"
                    name="senderEmail"
                    type="email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="contoh: ibu.sari@sekolah.id"
                    value={email}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    className={`rimba-input${errors.email ? ' is-invalid' : ''}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      if (errors.email && !validateField('email', val)) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (email) {
                        setErrors((prev) => ({ ...prev, email: validateField('email', email) }));
                      }
                    }}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="rimba-error-msg">
                      <span role="img" aria-label="Error">!</span> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="contact-topic" className="block font-bold text-base mb-1.5">
                  Topik Surat
                </label>
                <select
                  id="contact-topic"
                  name="topic"
                  value={topic}
                  className="rimba-input"
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="masukan">Ide Cerita &amp; Satwa Baru</option>
                  <option value="sekolah">Saran untuk Guru &amp; Kelas</option>
                  <option value="petualangan">Cerita Seru Jelajah Rimba</option>
                  <option value="lainnya">Sapaan untuk Pico &amp; Sahabat</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block font-bold text-base mb-1.5">
                  Pesanmu untuk TamanPico
                </label>
                <textarea
                  ref={messageRef}
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Tuliskan pesan, ide zona baru, atau pengalaman bermainmu..."
                  value={message}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  className={`rimba-input min-h-[120px] resize-y${errors.message ? ' is-invalid' : ''}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMessage(val);
                    if (errors.message && !validateField('message', val)) {
                      setErrors((prev) => ({ ...prev, message: undefined }));
                    }
                  }}
                  onBlur={() => {
                    if (message) {
                      setErrors((prev) => ({ ...prev, message: validateField('message', message) }));
                    }
                  }}
                />
                {errors.message && (
                  <p id="contact-message-error" className="rimba-error-msg">
                    <span role="img" aria-label="Error">!</span> {errors.message}
                  </p>
                )}
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="touch-btn btn-forest px-6 py-3 text-base sm:text-lg"
              >
                Kirim Pesan ke TamanPico →
              </button>
            </form>
          </div>

          {/* Pico Mailbox Illustration Sidekick */}
          <aside className="lg:col-span-4 field-note-mint p-6 text-center space-y-4">
            <div className="w-36 h-36 mx-auto rounded-full bg-[#FAF8F0] border-2 border-[#293A30] flex items-center justify-center shadow-[0_5px_0_rgba(41,58,48,0.16)]">
              <img
                src="/assets/images/mascot-biji-happy.png"
                alt="Pico tersenyum menunggu surat dari para penjelajah cilik"
                className="w-28 h-28 object-contain"
              />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#2F5C40] m-0">
              Sahabat Suratmu
            </p>
            <h3 className="font-story text-2xl font-bold m-0 text-[#293A30]">
              Pico Senang Membaca Ceritamu!
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-[#293A30]/90 m-0">
              Setiap pesan yang kamu kirim di sini tersimpan rapi bersama catatan penjelajahanmu agar guru atau orang tuamu bisa membacanya bersama.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
