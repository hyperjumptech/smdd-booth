export type CaseKind = "service" | "product";

export type BoothCase = {
  id: string;
  kind: CaseKind;
  painTitle: string;
  story: string;
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
    story:
      "Kamu punya tim engineering, tapi roadmap molor terus. Prioritas berubah tiap minggu, sprint review jadi debat panjang, dan gak ada yang benar-benar pegang arah teknis. Founder sibuk urus bisnis, product manager bingung mau minta apa ke dev, dan engineer capek karena tugas mereka sering berubah tanpa konteks jelas. Hiring CTO full-time terasa terlalu berat dan riskan, tapi tanpa kepemimpinan teknis yang solid, produk digital kamu gak akan naik level. Tim butuh sosok yang bisa ngarahin arsitektur, review kode, dan memastikan eksekusi selaras dengan target bisnis.",
    revealName: "CTO-as-a-Service",
    revealBody:
      "Cocok untuk founder non-teknis / growth-stage. Hyperjump sediakan kepemimpinan IT dan eksekusi roadmap tanpa rekrut CTO full-time.",
    url: "https://hyperjump.tech/en/services/cto-as-a-service",
  },
  {
    id: "typetable",
    kind: "product",
    painTitle: "Tim copas data yang sama terus menerus",
    story:
      "Setiap hari tim operasional ngetik data yang mirip-mirip: nama vendor, jumlah stok, catatan pengiriman, dan detail transaksi kecil. Format beda-beda, ada yang di spreadsheet, ada yang di chat, dan saat butuh laporan semua orang sibuk copas ulang. Validasi data lemah, typo sering lolos, dan onboarding staf baru jadi lama karena harus hafal kolom mana yang wajib diisi. Kamu sudah coba bikin form, tapi tiap departemen minta field baru dan maintenance form jadi beban IT. Yang dibutuhkan adalah cara cepat mendefinisikan struktur data dan mengisi record tanpa ribet format teknis.",
    revealName: "TypeTable",
    revealBody:
      "Ucapkan apa yang perlu dicatat — TypeTable usulkan tabel, terapkan aturan, dan biarkan tim menambah record lewat bahasa sehari-hari.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "inference-ai",
    kind: "service",
    painTitle: "Tim admin kewalahan tugas repetitif",
    story:
      "Staf customer service habiskan jam kerja membalas pertanyaan yang sama, tim finance bolak-balik ekstrak data dari PDF, dan tim HR sibuk verifikasi dokumen manual. Semua tahu banyak pekerjaan ini bisa diotomatisasi, tapi gak ada yang punya waktu atau keahlian bangun solusi AI yang reliable. Vendor AI generik sering gak paham konteks bisnis kamu, dan pilot project mandek karena integrasi ke sistem internal rumit. Produktivitas tim turun, biaya operasional naik, dan moral tim ikut terpengaruh karena kerjaan repetitif menguras energi. Bisnis butuh asisten pintar yang benar-benar jalan di alur kerja mereka, bukan cuma demo keren.",
    revealName: "Inference AI",
    revealBody:
      "Hyperjump bantu bangun dan deploy AI agent khusus yang hemat biaya, berjalan otomatis, dan mempercepat operasional tanpa beban teknis berlebih.",
    url: "https://hyperjump.tech/en/services/inference-ai",
  },
  {
    id: "hydra8",
    kind: "product",
    painTitle: "Ubah prompt AI harus redeploy aplikasi",
    story:
      "Tim produk ingin iterasi prompt LLM cepat, tapi setiap perubahan kecil butuh deploy ulang ke production. Developer jadi bottleneck, eksperimen A/B prompt sulit dilacak, dan gak ada visibilitas mana versi prompt yang performa terbaik. Saat model di production bermasalah, rollback prompt butuh waktu dan risiko downtime tinggi. Monitoring kualitas respons AI minim, jadi regresi baru ketahuan dari keluhan user. Kamu butuh gateway yang memisahkan lifecycle prompt dari aplikasi utama: versioning, evaluasi, dan monitoring dari satu dashboard tanpa ganggu release cycle.",
    revealName: "Hydra8",
    revealBody:
      "Open-source LLM gateway untuk template prompt versi, evaluasi, dan monitoring — kirim perubahan prompt dari satu dashboard tanpa redeploy.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "erp-implementation",
    kind: "service",
    painTitle: "Data antar divisi selalu beda angka",
    story:
      "Finance bilang revenue segini, sales bilang segitu, dan gudang punya angka stok yang beda lagi. Setiap rapat jadi debat data, bukan strategi. Integrasi antar sistem lemah, banyak proses masih manual lewat export-import Excel, dan laporan bulanan baru jadi setelah semua orang kerja overtime rapikan angka. Decision maker gak bisa percaya dashboard karena histori data berantakan. Scaling operasional makin berat karena setiap departemen punya cara kerja sendiri tanpa single source of truth. Kamu butuh fondasi ERP yang merapikan alur dari penjualan, inventory, finance, hingga laporan eksekutif dalam satu ekosistem yang konsisten.",
    revealName: "ERP Implementation",
    revealBody:
      "Integrasikan seluruh proses bisnis ke solusi ERP kelas enterprise agar laporan akurat dan keputusan bisnis bisa diambil lebih cepat.",
    url: "https://hyperjump.tech/en/services/erp-implementation",
  },
  {
    id: "avenu",
    kind: "product",
    painTitle: "Biaya API AI meledak tanpa kontrol",
    story:
      "Tim engineering mulai pakai berbagai model AI untuk fitur berbeda, tapi tagihan API naik drastis tanpa transparansi siapa pakai apa. Gak ada kebijakan routing yang jelas, developer pilih model paling canggih untuk tugas sederhana, dan budget bulanan sering jebol di tengah sprint. Audit usage sulit karena log tersebar di tiap service. Kamu butuh gerbang terpusat yang bisa atur routing model, batasi budget per tim, dan tetap memberi fleksibilitas developer tanpa micromanage tiap request. Tanpa governance, inovasi AI justru jadi risiko finansial yang gak terkontrol.",
    revealName: "Avenu",
    revealBody:
      "AI gateway siap enterprise: buat aturan routing dan anggaran per tim agar inovasi AI tetap terkontrol dan efisien.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "software-as-a-service",
    kind: "service",
    painTitle: "Software jadi di pasar gak pas alur kerja",
    story:
      "Kamu sudah coba beberapa SaaS populer, tapi alur kerja internal kamu dipaksa menyesuaikan fitur vendor. Tim operasional bolak-balik workaround, data penting jatuh di luar sistem, dan customisasi vendor mahal atau gak memungkinkan. Produk digital yang kamu butuh punya logika bisnis unik — dari approval bertingkat, integrasi mesin lama, hingga laporan regulasi spesifik industri. Build from scratch internal terasa terlalu lama dan tim engineering sudah overload. Kamu butuh partner yang bisa deliver software kustom yang siap di-deploy, di-maintain, dan di-scale sesuai pertumbuhan bisnis tanpa mengorbankan fleksibilitas.",
    revealName: "Software as a Service",
    revealBody:
      "Bangun dan kembangkan solusi software kustom yang siap di-deploy serta di-scale sesuai kebutuhan perusahaan — tanpa paksa bisnis ikut alur software kaku.",
    url: "https://hyperjump.tech/en/services/software-as-a-service",
  },
  {
    id: "frontier-news",
    kind: "product",
    painTitle: "Gak sempat nonton semua video AI penting",
    story:
      "Setiap hari ratusan video tentang AI, produk baru, dan tren teknologi bermunculan di YouTube. Tim kamu harus tetap update, tapi nonton semuanya tidak realistis. Ringkasan manual dari anggota tim tidak konsisten, insight penting terlewat, dan diskusi internal sering basa-basi soal info yang sudah basi. Kamu butuh kurasi harian yang ringkas, multibahasa, dan fokus pada sinyal penting — bukan noise. Tanpa ritme informasi yang terstruktur, keputusan produk dan strategi AI bisa tertinggal dari kompetitor yang lebih cepat menangkap peluang.",
    revealName: "Frontier News",
    revealBody:
      "Newsletter harian berisi ringkasan kurasi video YouTube seputar AI, tersedia dalam berbagai bahasa untuk tim yang selalu ingin update.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "tech-due-diligence",
    kind: "service",
    painTitle: "Gak yakin sistem siap scale atau fundraising",
    story:
      "Bisnis tumbuh, investor mulai bertanya soal fondasi teknologi, dan kamu gak punya jawaban pasti soal keamanan, skalabilitas, dan debt teknis. Tim engineering sibuk deliver fitur, audit mendalam jarang dilakukan, dan dokumentasi arsitektur outdated. Kamu khawatir ada celah keamanan yang belum terlihat, atau infrastruktur yang akan jebol saat traffic naik tajam. Due diligence teknis yang asal-asalan bisa merusak negosiasi funding atau deal strategis. Sebelum melangkah besar, kamu butuh evaluasi independen yang jujur tentang performa, arsitektur, dan kemampuan eksekusi tim IT kamu.",
    revealName: "Tech Due Diligence",
    revealBody:
      "Audit dan evaluasi mendalam performa, arsitektur, serta kemampuan eksekusi sistem IT sebelum ekspansi atau pendanaan.",
    url: "https://hyperjump.tech/en/services/tech-due-diligence",
  },
  {
    id: "mediapulse",
    kind: "product",
    painTitle: "Berita pasar bikin bingung arah investasi",
    story:
      "Feed berita finansial penuh noise: headline sensasional, data yang bertentangan, dan analisis yang gak relevan dengan konteks portofolio kamu. Tim kecil gak punya waktu menyaring ribuan artikel per hari, tapi keputusan investasi butuh clarity cepat. Kamu sering telat merespons pergerakan pasar karena informasi penting terkubur di tumpukan berita umum. Butuh analis yang selalu on — menggabungkan sinyal pasar, memberi konteks, dan membantu kamu fokus pada apa yang benar-benar berdampak. Tanpa itu, keputusan jadi reaktif dan berbasis FOMO, bukan strategi.",
    revealName: "MediaPulse",
    revealBody:
      "AI analyst yang selalu aktif — memotong noise pasar, memberi clarity, konteks, dan confidence agar kamu tetap informed dan ahead.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "startgpt",
    kind: "product",
    painTitle: "Butuh asisten AI internal yang private",
    story:
      "Tim ingin pakai kemampuan ChatGPT untuk produktivitas, tapi data sensitif perusahaan tidak boleh masuk ke layanan publik. Solusi on-premise yang ada sering terlalu generic atau sulit dikustom untuk knowledge internal. Deploy model sendiri butuh expertise MLOps yang belum ada di tim. Kamu butuh assistant privat dengan UX familiar, mendukung model proprietary atau produk Hyperjump, dan bisa jalan di cloud atau on-premises sesuai kebijakan keamanan. Tanpa itu, tim either avoid AI totally atau ambil risiko compliance yang tidak perlu.",
    revealName: "StartGPT",
    revealBody:
      "Deploy asisten privat mirip ChatGPT yang mendukung model kamu sendiri — proprietary atau produk Hyperjump — di cloud atau on-premises.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "neo-sense",
    kind: "product",
    painTitle: "Situs down tapi baru ketahuan dari customer",
    story:
      "Website atau API kamu tiba-tiba lambat atau down, tapi tim engineering baru sadar setelah user complain di social media. Monitoring internal cuma cek dari satu region, alert telat masuk, dan channel notifikasi terbatas. SLA dengan klien enterprise makin ketat, dan downtime langsung berdampak revenue dan reputasi. Kamu butuh synthetic monitoring regional dan global dengan notifikasi cepat lewat Telegram, Slack, atau WhatsApp — dipartnerkan infrastruktur yang reliable. Deteksi proaktif adalah syarat, bukan luxury, untuk bisnis yang bergantung pada availability digital.",
    revealName: "NEO Sense",
    revealBody:
      "Layanan synthetic monitoring bersama Biznet GIO — pantau website regional dan global, dapat notifikasi lewat Telegram, Slack, WhatsApp, dan lainnya.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "monitime",
    kind: "product",
    painTitle: "Monitoring uptime kurang cakupan regional",
    story:
      "Kamu sudah punya tool monitoring, tapi cakupannya terbatas dan tidak merepresentasikan pengalaman user di berbagai wilayah. Incident di region tertentu sering tidak terdeteksi sampai traffic lokal drop signifikan. Konfigurasi alert rumit, tim on-call kewalahan false positive, dan integrasi ke workflow tim masih manual. Partner infrastruktur lokal penting untuk bisnis yang serve user Indonesia dan global. Kamu butuh synthetic monitoring yang bisa watch dari banyak titik, dengan notifikasi fleksibel ke channel yang tim sudah pakai sehari-hari.",
    revealName: "Monitime",
    revealBody:
      "Synthetic monitoring bersama Qwords — pantau website regional dan global, notifikasi lewat Telegram, Slack, WhatsApp, dan channel lain.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "monika",
    kind: "product",
    painTitle: "Gak ada alert saat situs lambat tapi masih up",
    story:
      "Uptime checker bilang situs hijau, tapi user sebenarnya mengeluh loading lambat dan transaksi gagal sesekali. Monitoring kamu cuma cek HTTP 200, tidak mengukur response time threshold atau journey kritis seperti login dan checkout. Konfigurasi monitoring yang powerful biasanya butuh stack kompleks, sementara tim butuh solusi sederhana dengan file konfigurasi jelas. Kamu perlu alert tidak hanya saat down, tapi saat performa degradasi — sebelum customer churn. Open-source tool yang battle-tested dan mudah dioperasikan jadi pilihan pragmatis untuk tim yang ingin reliability tanpa overhead besar.",
    revealName: "Monika",
    revealBody:
      "CLI untuk memonitor setiap bagian web app lewat file konfigurasi JSON sederhana — alert saat down dan saat lambat.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "grule",
    kind: "product",
    painTitle: "Aturan bisnis terkubur di kode aplikasi",
    story:
      "Setiap kali policy pricing, eligibility promo, atau workflow approval berubah, developer harus deploy ulang dan regression test panjang. Business team tidak bisa iterasi cepat karena aturan bisnis hardcoded di banyak layer aplikasi. Technical debt menumpuk, bug logic bisnis sering muncul di edge case, dan onboarding developer baru lambat karena harus paham ribuan kondisi tersebar. Kamu butuh rule engine yang memisahkan business rules dari kode — human-readable, bisa diubah lebih cepat, dan maintainable. Terutama untuk sistem Go yang butuh fleksibilitas tanpa mengorbankan performa.",
    revealName: "Grule",
    revealBody:
      "Rule engine open-source untuk Go — definisikan aturan bisnis dalam format yang mudah dibaca manusia agar aplikasi lebih fleksibel dan maintainable.",
    url: "https://hyperjump.tech/en/products",
  },
  {
    id: "whatsapp-chatbot-connector",
    kind: "product",
    painTitle: "Integrasi chatbot WhatsApp ribet dan bolak-balik",
    story:
      "Kamu mau layani customer lewat WhatsApp Business API, tapi integrasi ke platform AI seperti Dify atau Rasa butuh banyak custom glue code. Tim bolak-balik debug webhook, format pesan, dan session handling yang berbeda-beda tiap vendor. Maintenance connector jadi beban terus-menerus setiap API WhatsApp atau platform AI update. Kamu butuh backend siap pakai berbasis Express.js yang fokus pada integrasi WhatsApp Business API dengan berbagai platform AI — supaya tim bisa fokus pada conversation design dan kualitas respons, bukan infrastruktur messaging.",
    revealName: "WhatsApp Chatbot Connector",
    revealBody:
      "Backend Express.js untuk integrasi WhatsApp Business API dengan platform AI seperti Dify dan Rasa — kurangi glue code dan percepat go-live chatbot.",
    url: "https://hyperjump.tech/en/products",
  },
];

export function getCaseById(id: string): BoothCase | undefined {
  return CASES.find((c) => c.id === id);
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
