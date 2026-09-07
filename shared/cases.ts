export type CaseKind = "service" | "product";

export type BoothCase = {
  id: string;
  kind: CaseKind;
  painTitle: string;
  hook: string;
  clues: string[];
  revealName: string;
  revealBody: string;
  url?: string;
};

export type Badge = {
  caseId: string;
  kind: CaseKind;
  revealName: string;
};

export const MIN_SERVICE_BADGES = 2;
export const MIN_PRODUCT_BADGES = 1;

export const CASES: BoothCase[] = [
  {
    id: "cto-as-a-service",
    kind: "service",
    painTitle: "Tim IT lemot banget kerjanya",
    hook: "Roadmap kami molor tiga bulan. Gak ada yang tahu kenapa.",
    clues: [
      "Prioritas berubah tiap minggu, sprint review jadi debat panjang",
      "Gak ada satu orang pun yang benar-benar pegang arah teknis",
      "Hiring CTO full-time terasa terlalu mahal dan riskan",
    ],
    revealName: "CTO-as-a-Service",
    revealBody:
      "Cocok untuk founder non-teknis / growth-stage. Hyperjump sediakan kepemimpinan IT dan eksekusi roadmap tanpa rekrut CTO full-time.",
    url: "https://hyperjump.tech/en/services/cto-as-a-service",
  },
  {
    id: "typetable",
    kind: "product",
    painTitle: "Tim copas data yang sama terus menerus",
    hook: "Tiap laporan bulanan, semua orang copas data yang itu-itu lagi.",
    clues: [
      "Data vendor dan stok tersebar di spreadsheet dan chat",
      "Typo sering lolos karena validasi datanya lemah",
      "Tiap divisi minta field baru, maintenance form jadi beban IT",
    ],
    revealName: "TypeTable",
    revealBody:
      "Ucapkan apa yang perlu dicatat, TypeTable usulkan tabel, terapkan aturan, dan biarkan tim menambah record lewat bahasa sehari-hari.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "inference-ai",
    kind: "service",
    painTitle: "Tim admin kewalahan tugas repetitif",
    hook: "Tim CS kami balas pertanyaan yang sama 200 kali sehari.",
    clues: [
      "Finance masih ekstrak data PDF manual, HR verifikasi dokumen satu per satu",
      "Vendor AI generik gak paham konteks bisnis kami",
      "Pilot project mandek di integrasi ke sistem internal",
    ],
    revealName: "Inference AI",
    revealBody:
      "Hyperjump bantu bangun dan deploy AI agent khusus yang hemat biaya, berjalan otomatis, dan mempercepat operasional tanpa beban teknis berlebih.",
    url: "https://hyperjump.tech/en/services/inference-ai",
  },
  {
    id: "hydra8",
    kind: "product",
    painTitle: "Ubah prompt AI harus redeploy aplikasi",
    hook: "Ganti satu kalimat di prompt, kami harus deploy ulang production.",
    clues: [
      "Eksperimen A/B prompt gak kelacak, gak tahu versi mana yang menang",
      "Rollback prompt lambat dan berisiko downtime",
      "Regresi kualitas jawaban baru ketahuan dari keluhan user",
    ],
    revealName: "Hydra8",
    revealBody:
      "Open-source LLM gateway untuk template prompt versi, evaluasi, dan monitoring. Kirim perubahan prompt dari satu dashboard tanpa redeploy.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "erp-implementation",
    kind: "service",
    painTitle: "Data antar divisi selalu beda angka",
    hook: "Finance, sales, dan gudang bawa tiga angka berbeda ke rapat yang sama.",
    clues: [
      "Antar sistem masih disambung lewat export-import Excel",
      "Laporan bulanan baru jadi setelah semua orang lembur",
      "Gak ada single source of truth, dashboard gak bisa dipercaya",
    ],
    revealName: "ERP Implementation",
    revealBody:
      "Integrasikan seluruh proses bisnis ke solusi ERP kelas enterprise agar laporan akurat dan keputusan bisnis bisa diambil lebih cepat.",
    url: "https://hyperjump.tech/en/services/erp-implementation",
  },
  {
    id: "avenu",
    kind: "product",
    painTitle: "Biaya API AI meledak tanpa kontrol",
    hook: "Tagihan API AI naik empat kali lipat bulan ini. Gak ada yang tahu pemakainya siapa.",
    clues: [
      "Developer pakai model paling canggih untuk tugas paling sederhana",
      "Log usage tersebar di tiap service, audit hampir mustahil",
      "Budget bulanan jebol di tengah sprint",
    ],
    revealName: "Avenu",
    revealBody:
      "AI gateway siap enterprise: buat aturan routing dan anggaran per tim agar inovasi AI tetap terkontrol dan efisien.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "software-as-a-service",
    kind: "service",
    painTitle: "Software jadi di pasar gak pas alur kerja",
    hook: "Kami beli SaaS-nya, tapi malah tim yang harus menyesuaikan diri.",
    clues: [
      "Approval bertingkat dan integrasi mesin lama gak didukung vendor",
      "Data penting jatuh di luar sistem karena tim workaround terus",
      "Build sendiri terlalu lama, tim engineering sudah overload",
    ],
    revealName: "Software as a Service",
    revealBody:
      "Bangun dan kembangkan solusi software kustom yang siap di-deploy serta di-scale sesuai kebutuhan perusahaan, tanpa paksa bisnis ikut alur software kaku.",
    url: "https://hyperjump.tech/en/services/software-as-a-service",
  },
  {
    id: "frontier-news",
    kind: "product",
    painTitle: "Gak sempat nonton semua video AI penting",
    hook: "Ratusan video AI keluar tiap hari. Kami nonton nol.",
    clues: [
      "Ringkasan manual antar anggota tim gak konsisten",
      "Insight penting kelewat, diskusi internal bahas info basi",
      "Kompetitor gerak duluan karena nangkap sinyal lebih cepat",
    ],
    revealName: "Frontier News",
    revealBody:
      "Newsletter harian berisi ringkasan kurasi video YouTube seputar AI, tersedia dalam berbagai bahasa untuk tim yang selalu ingin update.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "tech-due-diligence",
    kind: "service",
    painTitle: "Gak yakin sistem siap scale atau fundraising",
    hook: "Investor tanya soal keamanan dan skalabilitas. Kami cuma bisa diam.",
    clues: [
      "Dokumentasi arsitektur outdated, audit mendalam gak pernah jalan",
      "Ada dugaan celah keamanan yang belum pernah dicek",
      "Infrastruktur belum pernah diuji saat traffic naik tajam",
    ],
    revealName: "Tech Due Diligence",
    revealBody:
      "Audit dan evaluasi mendalam performa, arsitektur, serta kemampuan eksekusi sistem IT sebelum ekspansi atau pendanaan.",
    url: "https://hyperjump.tech/en/services/tech-due-diligence",
  },
  {
    id: "mediapulse",
    kind: "product",
    painTitle: "Berita pasar bikin bingung arah investasi",
    hook: "Ribuan artikel per hari, nol clarity buat ambil keputusan.",
    clues: [
      "Headline sensasional dan data yang saling bertentangan",
      "Info penting terkubur, respons ke pergerakan pasar selalu telat",
      "Keputusan jadi reaktif berbasis FOMO, bukan strategi",
    ],
    revealName: "MediaPulse",
    revealBody:
      "AI analyst yang selalu aktif, memotong noise pasar dan memberi clarity, konteks, serta confidence agar kamu tetap informed dan ahead.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "startgpt",
    kind: "product",
    painTitle: "Butuh asisten AI internal yang private",
    hook: "Tim mau pakai AI, tapi data perusahaan gak boleh keluar.",
    clues: [
      "Solusi on-premise yang ada terlalu generic untuk knowledge internal",
      "Deploy model sendiri butuh MLOps yang belum ada di tim",
      "Pilihannya cuma dua: gak pakai AI, atau ambil risiko compliance",
    ],
    revealName: "StartGPT",
    revealBody:
      "Deploy asisten privat mirip ChatGPT yang mendukung model kamu sendiri, proprietary atau produk Hyperjump, di cloud atau on-premises.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "neo-sense",
    kind: "product",
    painTitle: "Situs down tapi baru ketahuan dari customer",
    hook: "API kami down 40 menit. Yang kasih tahu: customer, di media sosial.",
    clues: [
      "Monitoring internal cuma cek dari satu region",
      "Alert telat masuk dan channel notifikasi terbatas",
      "SLA klien enterprise makin ketat, downtime langsung makan revenue",
    ],
    revealName: "NEO Sense",
    revealBody:
      "Layanan synthetic monitoring bersama Biznet GIO. Pantau website regional dan global, dapat notifikasi lewat Telegram, Slack, WhatsApp, dan lainnya.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "monitime",
    kind: "product",
    painTitle: "Monitoring uptime kurang cakupan regional",
    hook: "Dashboard hijau semua, tapi user di luar Jakarta gak bisa buka.",
    clues: [
      "Cakupan monitoring gak mewakili pengalaman user tiap wilayah",
      "Tim on-call kewalahan false positive",
      "Butuh partner infrastruktur lokal untuk user Indonesia dan global",
    ],
    revealName: "Monitime",
    revealBody:
      "Synthetic monitoring bersama Qwords. Pantau website regional dan global, notifikasi lewat Telegram, Slack, WhatsApp, dan channel lain.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "monika",
    kind: "product",
    painTitle: "Gak ada alert saat situs lambat tapi masih up",
    hook: "Semua endpoint balas 200. Checkout tetap gagal.",
    clues: [
      "Monitoring cuma cek status HTTP, gak ukur response time",
      "Journey kritis seperti login dan checkout gak dipantau",
      "Butuh solusi sederhana, bukan stack monitoring yang kompleks",
    ],
    revealName: "Monika",
    revealBody:
      "CLI untuk memonitor setiap bagian web app lewat file konfigurasi JSON sederhana. Alert saat down dan saat lambat.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "grule",
    kind: "product",
    painTitle: "Aturan bisnis terkubur di kode aplikasi",
    hook: "Ubah satu aturan promo, developer butuh seminggu untuk deploy.",
    clues: [
      "Business team gak bisa iterasi karena aturan hardcoded di banyak layer",
      "Bug logic bisnis sering muncul di edge case",
      "Developer baru lambat onboarding, ribuan kondisi tersebar",
    ],
    revealName: "Grule",
    revealBody:
      "Rule engine open-source untuk Go. Definisikan aturan bisnis dalam format yang mudah dibaca manusia agar aplikasi lebih fleksibel dan maintainable.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "whatsapp-chatbot-connector",
    kind: "product",
    painTitle: "Integrasi chatbot WhatsApp ribet dan bolak-balik",
    hook: "Chatbot WhatsApp belum live, glue code-nya sudah ribuan baris.",
    clues: [
      "Webhook, format pesan, dan session handling beda tiap vendor",
      "Tiap WhatsApp API update, connector rusak lagi",
      "Tim habis waktu di infrastruktur, bukan di conversation design",
    ],
    revealName: "WhatsApp Chatbot Connector",
    revealBody:
      "Backend Express.js untuk integrasi WhatsApp Business API dengan platform AI seperti Dify dan Rasa. Kurangi glue code dan percepat go-live chatbot.",
    url: "https://hyperjump.tech/en/products",
  },
];

export function getCaseById(id: string): BoothCase | undefined {
  return CASES.find((c) => c.id === id);
}

export function getCaseNumber(id: string): number {
  return CASES.findIndex((c) => c.id === id) + 1;
}

export function countKinds(badges: Badge[]): { service: number; product: number } {
  let service = 0;
  let product = 0;
  for (const b of badges) {
    if (b.kind === "service") service += 1;
    else if (b.kind === "product") product += 1;
  }
  return { service, product };
}

export function canSubmitBadges(badges: Badge[]): boolean {
  const { service, product } = countKinds(badges);
  return service >= MIN_SERVICE_BADGES && product >= MIN_PRODUCT_BADGES;
}
