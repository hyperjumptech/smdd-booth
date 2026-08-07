export type Choice = "A" | "B" | "C" | "D" | "E";

export type Question = {
  id: string;
  prompt: string;
  options: Record<Choice, string>;
};

export type ResultContent = {
  service: string;
  url: string;
  tagline: string;
  diagnosis: string;
  solution: string;
};

export type Answer = { questionId: string; choice: Choice };

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt:
      "Apa \"sakit kepala\" terbesar di operasional bisnis kamu saat ini?",
    options: {
      A: "Tim kecapekan ngerjain tugas rutin/manual yang itu-itu aja tiap hari.",
      B: "Data operasional dan laporan antar divisi (Finance, Sales, Stock) masih berantakan.",
      C: "Pusing nyari, ngatur, dan menahan engineer IT supaya gak sering keluar-masuk.",
      D: "Butuh software khusus buat bisnis, tapi gak ada produk jadi (off-the-shelf) yang pas.",
      E: "Ragu apakah fondasi sistem IT sekarang aman dan siap buat scale up atau fundraising.",
    },
  },
  {
    id: "q2",
    prompt:
      "Kalau dikasih \"tongkat ajaib\" buat selesain 1 masalah esok hari, kamu mau apa?",
    options: {
      A: "Bikin asisten pintar yang bisa otomatisasi tugas berulang 24/7.",
      B: "Punya satu dashboard rapi yang bisa memantau seluruh proses bisnis dari ujung ke ujung.",
      C: "Punya petinggi IT berpengalaman yang langsung siap eksekusi tech roadmap tanpa ribet rekrutmen.",
      D: "Bikin aplikasi kustom yang fiturnya 100% nurut sama alur kerja unik perusahaan.",
      E: "Dapet audit komprehensif tentang kesehatan dan keamanan sistem IT saat ini.",
    },
  },
  {
    id: "q3",
    prompt: "Kalimat apa yang paling sering kamu dengar dari tim kamu?",
    options: {
      A: "\"Duh, kerjaan kita cuma copas data dan balesin pesan yang sama terus nih!\"",
      B: "\"Kok data stok di gudang beda ya sama catatan tim finance?\"",
      C: "\"Kita bingung mau bikin arsitektur sistemnya kayak gimana, gak ada yang ngarahin.\"",
      D: "\"Tools yang kita pakai sekarang kaku banget, gak fleksibel buat nambah fitur baru.\"",
      E: "\"Sistem kita sering lemot kalau user naik, tapi gak tahu bocornya di mana.\"",
    },
  },
  {
    id: "q4",
    prompt:
      "Sektor mana di bisnis kamu yang rasanya paling banyak pemborosan waktu/biaya?",
    options: {
      A: "Pekerjaan administratif harian yang harusnya bisa dikerjakan mesin.",
      B: "Proses sinkronisasi data manual yang makan waktu antar departemen.",
      C: "Gaji tim IT mahal tapi eksekusinya sering lambat dan kurang terarah.",
      D: "Langganan berbagai software bulanan yang cuma terpakai separuh fiturnya.",
      E: "Perbaikan bug atau masalah sistem yang terus timbul tanpa tahu akar masalahnya.",
    },
  },
  {
    id: "q5",
    prompt:
      "Apa ketakutan terbesar kamu saat bisnis mulai membesar (scaling)?",
    options: {
      A: "Operasional makin lambat karena tim kewalahan nanganin volume tugas harian.",
      B: "Kontrol operasional lepas karena data makin kompleks dan tercecer di mana-mana.",
      C: "Produk IT gagal rilis tepat waktu karena tim engineering kurang berpengalaman.",
      D: "Aplikasi yang dipakai saat ini gak mampu menampung lonjakan pengguna/kebutuhan baru.",
      E: "Sistem IT mendadak crash atau ketahuan punya celah keamanan di depan investor/klien besar.",
    },
  },
  {
    id: "q6",
    prompt:
      "Kalau ada proyek digital baru, kendala apa yang paling sering bikin tersendat?",
    options: {
      A: "Makan waktu lama buat melatih staf cuma untuk ngerjain proses-proses dasar.",
      B: "Sulit mengintegrasikan sistem baru dengan sistem lama yang udah berjalan.",
      C: "Tidak ada sosok leader teknis yang bisa mengarahkan para developer.",
      D: "Mengembangkan aplikasinya dari nol makan waktu terlalu lama kalau pakai resource internal.",
      E: "Khawatir hasilnya tidak memenuhi standar keamanan dan kualitas teknis yang baik.",
    },
  },
  {
    id: "q7",
    prompt: "Apa fokus/target utama bisnis kamu dalam 6 bulan ke depan?",
    options: {
      A: "Efisiensi biaya dan waktu kerja lewat otomatisasi cerdas.",
      B: "Merapikan alur kerja antar divisi supaya operasional lebih ramping.",
      C: "Membangun produk digital tanpa perlu pusing urusan manajemen tim IT.",
      D: "Meluncurkan platform digital kustom yang stabil dan siap tumbuh.",
      E: "Meyakinkan investor atau stakeholder bahwa fondasi teknologi perusahaan solid dan siap ekspansi.",
    },
  },
];

export const RESULTS: Record<Choice, ResultContent> = {
  A: {
    service: "Inference AI",
    url: "https://hyperjump.tech/en/services/inference-ai",
    tagline: "Saatnya Bebaskan Tim Kamu dari Tugas Manual!",
    diagnosis: "Bisnis kamu butuh efisiensi ekstra!",
    solution:
      "Saatnya lepas tugas manual yang menguras waktu. Kami bantu bangun dan deploy AI agent khusus yang hemat biaya, berjalan otomatis, dan bikin operasional kamu jauh lebih cepat tanpa pusing urusan teknis.",
  },
  B: {
    service: "ERP Implementation",
    url: "https://hyperjump.tech/en/services/erp-implementation",
    tagline: "Saatnya Rapikan & Integrasikan Seluruh Operasional!",
    diagnosis: "Operasional kamu butuh kerapian dan transparansi!",
    solution:
      "Katakan selamat tinggal pada data berantakan. Kami bantu integrasikan seluruh proses bisnis kamu ke dalam solusi ERP kelas enterprise agar laporan akurat dan keputusan bisnis bisa diambil lebih cepat.",
  },
  C: {
    service: "CTO-as-a-Service",
    url: "https://hyperjump.tech/en/services/cto-as-a-service",
    tagline: "Saatnya Punya Kepemimpinan IT Tanpa Pusing Rekrutmen!",
    diagnosis: "Kamu butuh kepemimpinan teknologi yang solid!",
    solution:
      "Gak perlu pusing rekrut dan kelola tim engineering dari nol. Kami sediakan kepemimpinan IT berpengalaman beserta manajemen tim software yang siap mengeksekusi ide bisnis kamu.",
  },
  D: {
    service: "Software as a Service",
    url: "https://hyperjump.tech/en/services/software-as-a-service",
    tagline: "Saatnya Punya Software Kustom yang Pas dengan Bisnis Kamu!",
    diagnosis: "Kamu butuh software yang benar-benar pas dengan bisnis kamu!",
    solution:
      "Jangan paksa bisnis kamu ikutan alur software kaku. Kami bangun dan kembangkan solusi software kustom yang siap di-deploy serta di-scale sesuai kebutuhan perusahaan.",
  },
  E: {
    service: "Tech Due Diligence",
    url: "https://hyperjump.tech/en/services/tech-due-diligence",
    tagline: "Saatnya Pastikan Fondasi Sistem IT Kamu Aman & Ready to Scale!",
    diagnosis: "Kamu butuh kepastian dan keamanan fondasi teknis!",
    solution:
      "Sebelum melangkah lebih jauh untuk ekspansi atau pendanaan, mari kita audit dan evaluasi performa, arsitektur, serta kemampuan eksekusi sistem IT kamu secara mendalam.",
  },
};

export function emptyTallies(): Record<Choice, number> {
  return { A: 0, B: 0, C: 0, D: 0, E: 0 };
}

export function tallyAnswers(answers: Answer[]): Record<Choice, number> {
  const t = emptyTallies();
  for (const a of answers) t[a.choice] += 1;
  return t;
}

export function leadingChoices(tallies: Record<Choice, number>): Choice[] {
  const max = Math.max(...Object.values(tallies));
  return (Object.keys(tallies) as Choice[]).filter((k) => tallies[k] === max);
}

export function resolveResultKey(
  answers: Answer[],
  tiebreaker?: Choice,
): Choice {
  const leaders = leadingChoices(tallyAnswers(answers));
  if (leaders.length === 1) return leaders[0];
  if (!tiebreaker || !leaders.includes(tiebreaker)) {
    throw new Error("Tiebreaker required");
  }
  return tiebreaker;
}
