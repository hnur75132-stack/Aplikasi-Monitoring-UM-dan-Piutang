export const CABANG_RSB_DAERAH_LIST = [
  'Brebes',
  'Kendal',
  'Bima',
  'Cirebon',
  'Lampung Tengah',
  'Pesawaran',
  'Sambas',
  'Sragen',
  'Kepulauan Riau',
  'Pohuwato',
  'Bogor',
  'Sarolangun',
] as const;

export const CABANG_RSB_SELINDO_LIST = [
  'Jakarta Pusat',
  'Yogyakarta',
  'Sigi (Palu)',
  'Makassar',
  'Papua (Jayapura)',
  'Berau',
  'Karo',
  'Pangkalpinang',
] as const;

export const CABANG_RSB_LIST = [
  ...CABANG_RSB_DAERAH_LIST,
  ...CABANG_RSB_SELINDO_LIST,
] as const;

export type CabangRSB = string;

export type JenisKelolaanRSB = 'semua' | 'daerah' | 'selindo';

export type TahapStatusColor = 'green' | 'orange' | 'plain';

export interface RSBTahapItem {
  nominal: number;
  status: TahapStatusColor;
}

export interface RSBMatrixRow {
  no: number;
  rsb: string;
  jenisKelolaan: 'daerah' | 'selindo';
  totalDanaPKS: number;
  totalDanaPencairan: number;
  tahap1?: RSBTahapItem;
  tahap2?: RSBTahapItem;
  tahap3?: RSBTahapItem;
  tahap4?: RSBTahapItem;
  tahap5?: RSBTahapItem;
  tahap6?: RSBTahapItem;
  jumlah: number;
  sisa: number;
  persentase: number;
}

export type KategoriMitra = 'BUMN' | 'Pemerintah' | 'Swasta' | 'Pendidikan' | 'BAZNAS Daerah' | 'BAZNAS RI (Pusat)';

export type StatusPKS = 'Berjalan' | 'Menunggu SPJ' | 'Kritis / Terlambat' | 'Selesai';

export type StatusVerifikasiSPJ = 'Terverifikasi' | 'Menunggu Verifikasi' | 'Perlu Revisi';

export interface PKSTermin {
  terminKe: number;
  namaTermin: string;
  persentase: number;
  nilaiTermin: number;
  jadwalBulan: string;
  status: 'Belum Ditagih' | 'Ditagih' | 'Dicairkan';
}

export interface PencairanRecord {
  id: string;
  terminKe: number;
  nomorSPP: string; // Surat Permintaan Pembayaran / SP2D
  jumlahCair: number;
  tanggalCair: string;
  bankTujuan: string;
  nomorRekening: string;
  catatan?: string;
}

export interface LaporanSPJ {
  id: string;
  nomorLaporan: string;
  tanggalLapor: string;
  periodeKegiatan: string;
  nilaiRealisasi: number;
  persentaseFisik: number;
  statusVerifikasi: StatusVerifikasiSPJ;
  catatanVerifikasi: string;
  dokumenLampiranNama?: string;
}

export interface PKSContract {
  id: string;
  nomorPKS: string;
  cabangRSB: CabangRSB;
  jenisKelolaan?: 'daerah' | 'selindo';
  judulKerjasama: string;
  mitraNama: string;
  kategoriMitra: KategoriMitra;
  nilaiPKS: number;
  tanggalMulai: string;
  tanggalBerakhir: string;
  picMitra: string;
  kontakPic: string;
  emailMitra: string;
  keterangan: string;
  terminList: PKSTermin[];
  pencairanList: PencairanRecord[];
  laporanSPJList: LaporanSPJ[];
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyTrendData {
  bulanKey: string; // '2026-01'
  bulanNama: string; // 'Januari'
  singkatan: string; // 'Jan'
  tahun: number;
  penagihan: number; // Nilai invoice/tagihan yang diterbitkan
  pencairan: number; // Nilai dana yang dicairkan
  pelaporan: number; // Nilai SPJ yang diverifikasi
  jumlahPKSBaru: number;
  kolektibilitasRate: number; // % pencairan / penagihan
}

export interface RealTimeEvent {
  id: string;
  waktu: string;
  tipe: 'pencairan' | 'spj_masuk' | 'spj_diverifikasi' | 'pks_baru' | 'penagihan';
  judul: string;
  deskripsi: string;
  nilaiRupiah?: number;
  nomorPKS: string;
  mitraNama: string;
  cabangRSB?: CabangRSB;
}

export interface FinancialSummaryKPI {
  totalDanaPKS: number;
  totalDanaDicairkan: number;
  totalDanaDilaporkan: number;
  sisaDanaHarusDicairkan: number;
  sisaDanaBelumDilaporkan: number;
  persentasePencairan: number;
  persentasePelaporan: number;
  totalPKSCount: number;
  pksKritisCount: number;
}
