import { PKSContract, FinancialSummaryKPI } from '../types/finance';

/**
 * Format number to Indonesian Rupiah standard format
 * e.g., Rp 1.500.000.000
 */
export function formatRupiah(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format numbers with comma separator matching the user's spreadsheet
 * e.g. 500,000,000 or -61,500,000
 */
export function formatNumberSpreadsheet(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return '';
  return new Intl.NumberFormat('en-US').format(val);
}

/**
 * Format number to compact Rupiah for charts and badges
 * e.g. Rp 4,5 Miliar or Rp 750 Juta
 */
export function formatRupiahCompact(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return 'Rp 0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
  }
  if (abs >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`;
  }
  return formatRupiah(value);
}

/**
 * Format date string (YYYY-MM-DD) to Indonesian formatted date
 * e.g., 18 Oktober 2026
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format relative time
 */
export function formatWaktuRelatif(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return formatTanggalIndo(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Compute summary KPIs from an array of PKS contracts
 */
export function calculateFinancialKPIs(contracts: PKSContract[]): FinancialSummaryKPI {
  let totalDanaPKS = 0;
  let totalDanaDicairkan = 0;
  let totalDanaDilaporkan = 0;
  let pksKritisCount = 0;

  for (const c of contracts) {
    totalDanaPKS += c.nilaiPKS;
    const dicairkan = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
    totalDanaDicairkan += dicairkan;

    // SPJ yang dihitung sebagai dana dilaporkan adalah yang statusnya 'Terverifikasi'
    const dilaporkan = c.laporanSPJList
      .filter((s) => s.statusVerifikasi === 'Terverifikasi')
      .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
    totalDanaDilaporkan += dilaporkan;

    // Kritis jika sisa belum dilaporkan > 50% dari yang dicairkan dan kontrak mau habis
    const sisaBelumDilapor = dicairkan - dilaporkan;
    if (dicairkan > 0 && sisaBelumDilapor > dicairkan * 0.4) {
      pksKritisCount++;
    }
  }

  const sisaDanaHarusDicairkan = Math.max(0, totalDanaPKS - totalDanaDicairkan);
  const sisaDanaBelumDilaporkan = Math.max(0, totalDanaDicairkan - totalDanaDilaporkan);
  const persentasePencairan = totalDanaPKS > 0 ? (totalDanaDicairkan / totalDanaPKS) * 100 : 0;
  const persentasePelaporan = totalDanaDicairkan > 0 ? (totalDanaDilaporkan / totalDanaDicairkan) * 100 : 0;

  return {
    totalDanaPKS,
    totalDanaDicairkan,
    totalDanaDilaporkan,
    sisaDanaHarusDicairkan,
    sisaDanaBelumDilaporkan,
    persentasePencairan,
    persentasePelaporan,
    totalPKSCount: contracts.length,
    pksKritisCount,
  };
}

/**
 * Export contracts to CSV
 */
export function exportContractsToCSV(contracts: PKSContract[]): void {
  const headers = [
    'No PKS',
    'Cabang Klinik RSB',
    'Mitra Kerjasama',
    'Kategori',
    'Judul Kerjasama',
    'Nilai PKS (IDR)',
    'Total Dicairkan (IDR)',
    'Total Dilaporkan SPJ (IDR)',
    'Sisa Harus Dicairkan (IDR)',
    'Sisa Belum Dilaporkan (IDR)',
    'Progres Pencairan (%)',
    'Progres SPJ (%)',
    'Mulai',
    'Berakhir',
    'PIC Mitra',
    'Kontak PIC',
  ];

  const rows = contracts.map((c) => {
    const dicairkan = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
    const dilaporkan = c.laporanSPJList
      .filter((s) => s.statusVerifikasi === 'Terverifikasi')
      .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
    const sisaCair = c.nilaiPKS - dicairkan;
    const sisaSPJ = dicairkan - dilaporkan;
    const pctCair = c.nilaiPKS > 0 ? ((dicairkan / c.nilaiPKS) * 100).toFixed(1) : '0';
    const pctSPJ = dicairkan > 0 ? ((dilaporkan / dicairkan) * 100).toFixed(1) : '0';

    return [
      `"${c.nomorPKS}"`,
      `"${c.cabangRSB || '-'}"`,
      `"${c.mitraNama}"`,
      `"${c.kategoriMitra}"`,
      `"${c.judulKerjasama.replace(/"/g, '""')}"`,
      c.nilaiPKS,
      dicairkan,
      dilaporkan,
      sisaCair,
      sisaSPJ,
      `${pctCair}%`,
      `${pctSPJ}%`,
      c.tanggalMulai,
      c.tanggalBerakhir,
      `"${c.picMitra}"`,
      `"${c.kontakPic}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `laporan-monitoring-piutang-pks-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
