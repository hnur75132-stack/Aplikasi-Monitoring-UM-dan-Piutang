import { PKSContract, MonthlyTrendData, RealTimeEvent, PKSTermin, PencairanRecord, LaporanSPJ } from '../types/finance';
import { RSB_SPREADSHEET_DATA } from './rsbSpreadsheetData';

/**
 * Generate full PKS contract objects directly from the user's exact spreadsheet data
 */
export const INITIAL_PKS_CONTRACTS: PKSContract[] = RSB_SPREADSHEET_DATA.map((row) => {
  const code = row.rsb.toUpperCase().slice(0, 3);
  const pksNumber = `PKS/RSB-${code}/2026/01/0${row.no.toString().padStart(2, '0')}`;
  
  // Extract all tahap records
  const tahaps: { ke: number; nominal: number; status: 'green' | 'orange' | 'plain' }[] = [];
  if (row.tahap1) tahaps.push({ ke: 1, nominal: row.tahap1.nominal, status: row.tahap1.status });
  if (row.tahap2) tahaps.push({ ke: 2, nominal: row.tahap2.nominal, status: row.tahap2.status });
  if (row.tahap3) tahaps.push({ ke: 3, nominal: row.tahap3.nominal, status: row.tahap3.status });
  if (row.tahap4) tahaps.push({ ke: 4, nominal: row.tahap4.nominal, status: row.tahap4.status });
  if (row.tahap5) tahaps.push({ ke: 5, nominal: row.tahap5.nominal, status: row.tahap5.status });
  if (row.tahap6) tahaps.push({ ke: 6, nominal: row.tahap6.nominal, status: row.tahap6.status });

  // Build termin list
  const terminList: PKSTermin[] = tahaps.map((t) => ({
    terminKe: t.ke,
    namaTermin: `Tahap ${t.ke}`,
    persentase: Number(((t.nominal / row.totalDanaPKS) * 100).toFixed(2)),
    nilaiTermin: t.nominal,
    jadwalBulan: `Tahap ${t.ke} 2026`,
    status: t.status === 'plain' ? 'Ditagih' : 'Dicairkan',
  }));

  // Build pencairan list
  const pencairanList: PencairanRecord[] = tahaps.map((t) => ({
    id: `cair-${row.no}-${t.ke}`,
    terminKe: t.ke,
    nomorSPP: `SPP/RSB-${code}/2026/0${t.ke}`,
    jumlahCair: t.nominal,
    tanggalCair: `2026-0${Math.min(9, t.ke + 1)}-15`,
    bankTujuan: 'Bank BSI / Bank Rekening RSB',
    nomorRekening: `700-0${row.no}-99182`,
    catatan: `Pencairan Tahap ${t.ke} untuk operasional Klinik RSB ${row.rsb}`,
  }));

  // Build SPJ list (green tahaps are verified, orange tahaps are pending verification)
  const laporanSPJList: LaporanSPJ[] = tahaps
    .filter((t) => t.status === 'green' || t.status === 'orange')
    .map((t) => ({
      id: `spj-${row.no}-${t.ke}`,
      nomorLaporan: `SPJ/RSB-${code}/2026/0${t.ke}`,
      tanggalLapor: `2026-0${Math.min(9, t.ke + 2)}-10`,
      periodeKegiatan: `Pelaksanaan Tahap ${t.ke}`,
      nilaiRealisasi: t.nominal,
      persentaseFisik: t.status === 'green' ? 100 : 75,
      statusVerifikasi: t.status === 'green' ? 'Terverifikasi' : 'Menunggu Verifikasi',
      catatanVerifikasi: t.status === 'green' 
        ? `Laporan SPJ Tahap ${t.ke} telah diverifikasi lengkap dan sah.`
        : `Laporan SPJ Tahap ${t.ke} sedang dalam proses verifikasi tim keuangan BAZNAS.`,
      dokumenLampiranNama: `SPJ_RSB_${row.rsb}_Tahap${t.ke}.pdf`,
    }));

  const isSelindo = row.jenisKelolaan === 'selindo';
  const kategoriMitra = isSelindo ? 'BAZNAS RI (Pusat)' : 'BAZNAS Daerah';
  const mitraNama = isSelindo 
    ? `RSB Selindo ${row.rsb} (Kelolaan BAZNAS RI)` 
    : `Klinik Rumah Sehat BAZNAS (RSB) Cabang ${row.rsb}`;
  const judulKerjasama = isSelindo
    ? `Penyaluran Program Layanan Kesehatan Mustahik RSB Selindo ${row.rsb} (Kelolaan BAZNAS RI)`
    : `Penyaluran Program Layanan Kesehatan Mustahik & Operasional Klinik RSB ${row.rsb}`;
  const keterangan = isSelindo
    ? `Penyaluran dana operasional dan pelayanan kesehatan RSB Selindo ${row.rsb} di bawah kelolaan BAZNAS RI Pusat.`
    : `Penyaluran dana kesehatan mustahik 6 tahap RSB ${row.rsb} (Kemitraan BAZNAS Daerah).`;

  return {
    id: `pks-rsb-${row.no}`,
    nomorPKS: pksNumber,
    cabangRSB: row.rsb,
    jenisKelolaan: row.jenisKelolaan,
    judulKerjasama,
    mitraNama,
    kategoriMitra,
    nilaiPKS: row.totalDanaPKS,
    tanggalMulai: '2026-01-01',
    tanggalBerakhir: '2026-12-31',
    picMitra: isSelindo ? `Kepala RSB Selindo ${row.rsb}` : `Kepala Klinik RSB ${row.rsb}`,
    kontakPic: `+62 812-${(1000 + row.no * 77).toString()}-9900`,
    emailMitra: `rsb.${row.rsb.toLowerCase().replace(/\s+/g, '')}@baznas.go.id`,
    keterangan,
    terminList,
    pencairanList,
    laporanSPJList,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: new Date().toISOString(),
  };
});

export const INITIAL_MONTHLY_TRENDS: MonthlyTrendData[] = [
  {
    bulanKey: '2026-01',
    bulanNama: 'Januari',
    singkatan: 'Jan',
    tahun: 2026,
    penagihan: 500000000,
    pencairan: 500000000,
    pelaporan: 500000000,
    jumlahPKSBaru: 2,
    kolektibilitasRate: 100.0,
  },
  {
    bulanKey: '2026-02',
    bulanNama: 'Februari',
    singkatan: 'Feb',
    tahun: 2026,
    penagihan: 450000000,
    pencairan: 420000000,
    pelaporan: 400000000,
    jumlahPKSBaru: 1,
    kolektibilitasRate: 93.3,
  },
  {
    bulanKey: '2026-03',
    bulanNama: 'Maret',
    singkatan: 'Mar',
    tahun: 2026,
    penagihan: 600000000,
    pencairan: 580000000,
    pelaporan: 550000000,
    jumlahPKSBaru: 2,
    kolektibilitasRate: 96.7,
  },
  {
    bulanKey: '2026-04',
    bulanNama: 'April',
    singkatan: 'Apr',
    tahun: 2026,
    penagihan: 520000000,
    pencairan: 500000000,
    pelaporan: 480000000,
    jumlahPKSBaru: 2,
    kolektibilitasRate: 96.1,
  },
  {
    bulanKey: '2026-05',
    bulanNama: 'Mei',
    singkatan: 'Mei',
    tahun: 2026,
    penagihan: 650000000,
    pencairan: 620000000,
    pelaporan: 590000000,
    jumlahPKSBaru: 1,
    kolektibilitasRate: 95.4,
  },
  {
    bulanKey: '2026-06',
    bulanNama: 'Juni',
    singkatan: 'Jun',
    tahun: 2026,
    penagihan: 700000000,
    pencairan: 680000000,
    pelaporan: 630000000,
    jumlahPKSBaru: 2,
    kolektibilitasRate: 97.1,
  },
  {
    bulanKey: '2026-07',
    bulanNama: 'Juli',
    singkatan: 'Jul',
    tahun: 2026,
    penagihan: 580000000,
    pencairan: 550000000,
    pelaporan: 510000000,
    jumlahPKSBaru: 1,
    kolektibilitasRate: 94.8,
  },
  {
    bulanKey: '2026-08',
    bulanNama: 'Agustus',
    singkatan: 'Agu',
    tahun: 2026,
    penagihan: 480000000,
    pencairan: 460000000,
    pelaporan: 420000000,
    jumlahPKSBaru: 1,
    kolektibilitasRate: 95.8,
  },
  {
    bulanKey: '2026-09',
    bulanNama: 'September',
    singkatan: 'Sep',
    tahun: 2026,
    penagihan: 520000000,
    pencairan: 480000000,
    pelaporan: 450000000,
    jumlahPKSBaru: 0,
    kolektibilitasRate: 92.3,
  },
  {
    bulanKey: '2026-10',
    bulanNama: 'Oktober (Berjalan)',
    singkatan: 'Okt',
    tahun: 2026,
    penagihan: 550000000,
    pencairan: 480000000,
    pelaporan: 410000000,
    jumlahPKSBaru: 0,
    kolektibilitasRate: 87.2,
  },
  {
    bulanKey: '2026-11',
    bulanNama: 'November (Proyeksi)',
    singkatan: 'Nov',
    tahun: 2026,
    penagihan: 600000000,
    pencairan: 520000000,
    pelaporan: 480000000,
    jumlahPKSBaru: 0,
    kolektibilitasRate: 86.6,
  },
  {
    bulanKey: '2026-12',
    bulanNama: 'Desember (Proyeksi)',
    singkatan: 'Des',
    tahun: 2026,
    penagihan: 650000000,
    pencairan: 600000000,
    pelaporan: 550000000,
    jumlahPKSBaru: 0,
    kolektibilitasRate: 92.3,
  },
];

export const INITIAL_REALTIME_EVENTS: RealTimeEvent[] = [
  {
    id: 'evt-001',
    waktu: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    tipe: 'spj_masuk',
    judul: 'Laporan SPJ Tahap 5 Diterima',
    deskripsi: 'Klinik RSB Lampung Tengah menyerahkan berkas pertanggungjawaban fisik Tahap 5.',
    nilaiRupiah: 70000000,
    nomorPKS: 'PKS/RSB-LAM/2026/01/005',
    mitraNama: 'Klinik RSB Lampung Tengah',
    cabangRSB: 'Lampung Tengah',
  },
  {
    id: 'evt-002',
    waktu: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    tipe: 'spj_diverifikasi',
    judul: 'Verifikasi SPJ Tahap 4 Lolos Audit',
    deskripsi: 'Auditor Keuangan menyatakan berkas SPJ Tahap 4 RSB Kendal valid 100%.',
    nilaiRupiah: 66000000,
    nomorPKS: 'PKS/RSB-KEN/2026/01/002',
    mitraNama: 'Klinik RSB Kendal',
    cabangRSB: 'Kendal',
  },
  {
    id: 'evt-003',
    waktu: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    tipe: 'pencairan',
    judul: 'Dana Tahap 1 Berhasil Dicairkan',
    deskripsi: 'Pencairan dana penyaluran Tahap 1 Rp 500.000.000 ke rekening RSB Brebes telah selesai.',
    nilaiRupiah: 500000000,
    nomorPKS: 'PKS/RSB-BRE/2026/01/001',
    mitraNama: 'Klinik RSB Brebes',
    cabangRSB: 'Brebes',
  },
  {
    id: 'evt-004',
    waktu: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    tipe: 'penagihan',
    judul: 'Pengajuan Pencairan Tahap 2 RSB Bogor',
    deskripsi: 'Klinik RSB Bogor mengajukan berkas pencairan Tahap 2 senilai Rp 60.000.000.',
    nilaiRupiah: 60000000,
    nomorPKS: 'PKS/RSB-BOG/2026/01/011',
    mitraNama: 'Klinik RSB Bogor',
    cabangRSB: 'Bogor',
  },
];
