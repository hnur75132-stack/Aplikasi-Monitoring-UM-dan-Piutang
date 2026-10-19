import { RSBMatrixRow, PKSContract, CabangRSB, JenisKelolaanRSB, PKSTermin, PencairanRecord, LaporanSPJ } from '../types/finance';
import { RSB_SPREADSHEET_DATA } from '../data/rsbSpreadsheetData';

export const STORAGE_KEY_MATRIX = 'sim_pks_matrix_v5_divisi_kesehatan';
export const STORAGE_KEY_AUTOSYNC = 'sim_pks_autosync_active';
export const STORAGE_KEY_LAST_SYNC = 'sim_pks_last_sync_timestamp';

export const SYNC_CHANNEL_NAME = 'rsb_divisi_kesehatan_sync_channel';

/**
 * Broadcast an update event across browser tabs/windows
 */
export function broadcastDataUpdate(payload: { type: string; timestamp: number; summary?: string }): void {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }
}

/**
 * Convert RSBMatrixRow array to full PKSContract array
 */
export function matrixRowsToContracts(rows: RSBMatrixRow[]): PKSContract[] {
  return rows.map((row) => {
    const code = row.rsb.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'RSB';
    const pksNumber = `PKS/RSB-${code}/2026/01/0${row.no.toString().padStart(2, '0')}`;

    // Extract all tahap records
    const tahaps: { ke: number; nominal: number; status: 'green' | 'orange' | 'plain' }[] = [];
    if (row.tahap1 && row.tahap1.nominal > 0) tahaps.push({ ke: 1, nominal: row.tahap1.nominal, status: row.tahap1.status });
    if (row.tahap2 && row.tahap2.nominal > 0) tahaps.push({ ke: 2, nominal: row.tahap2.nominal, status: row.tahap2.status });
    if (row.tahap3 && row.tahap3.nominal > 0) tahaps.push({ ke: 3, nominal: row.tahap3.nominal, status: row.tahap3.status });
    if (row.tahap4 && row.tahap4.nominal > 0) tahaps.push({ ke: 4, nominal: row.tahap4.nominal, status: row.tahap4.status });
    if (row.tahap5 && row.tahap5.nominal > 0) tahaps.push({ ke: 5, nominal: row.tahap5.nominal, status: row.tahap5.status });
    if (row.tahap6 && row.tahap6.nominal > 0) tahaps.push({ ke: 6, nominal: row.tahap6.nominal, status: row.tahap6.status });

    // Termin list
    const terminList: PKSTermin[] = tahaps.map((t) => ({
      terminKe: t.ke,
      namaTermin: `Tahap ${t.ke}`,
      persentase: row.totalDanaPKS > 0 ? Number(((t.nominal / row.totalDanaPKS) * 100).toFixed(2)) : 0,
      nilaiTermin: t.nominal,
      jadwalBulan: `Tahap ${t.ke} 2026`,
      status: t.status === 'plain' ? 'Ditagih' : 'Dicairkan',
    }));

    // Pencairan list
    const pencairanList: PencairanRecord[] = tahaps.map((t) => ({
      id: `cair-${row.no}-${t.ke}`,
      terminKe: t.ke,
      nomorSPP: `SPP/RSB-${code}/2026/0${t.ke}`,
      jumlahCair: t.nominal,
      tanggalCair: `2026-0${Math.min(9, t.ke + 1)}-15`,
      bankTujuan: 'Bank BSI / Rekening RSB',
      nomorRekening: `700-0${row.no}-99182`,
      catatan: `Pencairan Tahap ${t.ke} untuk Klinik RSB ${row.rsb}`,
    }));

    // SPJ list (green = terverifikasi, orange = proses verifikasi)
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
        catatanVerifikasi:
          t.status === 'green'
            ? `Laporan SPJ Tahap ${t.ke} terverifikasi sah dan lengkap oleh Divisi Kesehatan.`
            : `Laporan SPJ Tahap ${t.ke} dalam proses verifikasi tim keuangan BAZNAS.`,
        dokumenLampiranNama: `SPJ_RSB_${row.rsb.replace(/\s+/g, '_')}_Tahap${t.ke}.pdf`,
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
      ? `Penyaluran dana operasional dan pelayanan kesehatan RSB Selindo ${row.rsb} kelolaan BAZNAS RI Pusat.`
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
      emailMitra: `rsb.${row.rsb.toLowerCase().replace(/[^a-z0-9]/g, '')}@baznas.go.id`,
      keterangan,
      terminList,
      pencairanList,
      laporanSPJList,
      createdAt: '2026-01-01T08:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Clean and parse currency/number from CSV cells
 * Handles formats like: "Rp 500.000.000", "500,000,000", "500000000", "-61.500.000", "89.25%"
 */
export function parseCSVNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  let str = String(val).trim();
  if (!str || str === '-' || str === 'null') return 0;

  // Check if negative
  const isNegative = str.startsWith('-') || (str.startsWith('(') && str.endsWith(')'));

  // Remove currency signs, parens, spaces, percent
  str = str.replace(/[Rp.\s,%()]/gi, '');
  // If dot was used for thousands, clean it
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isNegative ? -Math.abs(num) : num;
}

/**
 * Parse CSV or TSV string into RSBMatrixRow[]
 */
export function parseDivisiKesehatanCSV(rawText: string): RSBMatrixRow[] {
  if (!rawText || !rawText.trim()) return [];

  // Split lines
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Detect delimiter: comma, semicolon, or tab
  const sample = lines[0];
  let delimiter = ',';
  if (sample.includes('\t')) delimiter = '\t';
  else if (sample.includes(';') && (sample.match(/;/g)?.length || 0) > (sample.match(/,/g)?.length || 0)) delimiter = ';';

  // Helper to split CSV line safely with quoted strings
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parsedRows: RSBMatrixRow[] = [];
  let headerFound = false;
  let colIndexMap: { [key: string]: number } = {};

  for (let idx = 0; idx < lines.length; idx++) {
    const cols = parseLine(lines[idx]);
    if (cols.length < 3) continue;

    const lowerCols = cols.map((c) => c.toLowerCase());

    // Check if this is the header row
    if (!headerFound && (lowerCols.some((c) => c.includes('rsb') || c.includes('cabang')))) {
      headerFound = true;
      lowerCols.forEach((col, cIdx) => {
        if (col.includes('no')) colIndexMap['no'] = cIdx;
        else if (col.includes('rsb') || col.includes('cabang') || col.includes('klinik')) colIndexMap['rsb'] = cIdx;
        else if (col.includes('kelolaan') || col.includes('tipe') || col.includes('kategori')) colIndexMap['kelolaan'] = cIdx;
        else if (col.includes('total dana pks') || (col.includes('pks') && col.includes('dana'))) colIndexMap['totalDanaPKS'] = cIdx;
        else if (col.includes('pencairan dana') || col.includes('total pencairan')) colIndexMap['totalDanaPencairan'] = cIdx;
        else if (col.includes('tahap 1') || col === 't1') colIndexMap['tahap1'] = cIdx;
        else if (col.includes('tahap 2') || col === 't2') colIndexMap['tahap2'] = cIdx;
        else if (col.includes('tahap 3') || col === 't3') colIndexMap['tahap3'] = cIdx;
        else if (col.includes('tahap 4') || col === 't4') colIndexMap['tahap4'] = cIdx;
        else if (col.includes('tahap 5') || col === 't5') colIndexMap['tahap5'] = cIdx;
        else if (col.includes('tahap 6') || col === 't6') colIndexMap['tahap6'] = cIdx;
        else if (col.includes('jumlah')) colIndexMap['jumlah'] = cIdx;
        else if (col.includes('sisa')) colIndexMap['sisa'] = cIdx;
        else if (col.includes('persen') || col.includes('%')) colIndexMap['persentase'] = cIdx;
      });
      continue;
    }

    // Process data row
    const rsbName = (cols[colIndexMap['rsb'] ?? 1] || cols[1] || '').replace(/['"]/g, '').trim();
    if (!rsbName || rsbName.toLowerCase().startsWith('total') || rsbName.toLowerCase().startsWith('jumlah')) {
      continue;
    }

    const kelolaanRaw = (cols[colIndexMap['kelolaan'] ?? 2] || '').toLowerCase();
    const isSelindo = kelolaanRaw.includes('selindo') || kelolaanRaw.includes('ri') || kelolaanRaw.includes('pusat');
    const jenisKelolaan: JenisKelolaanRSB = isSelindo ? 'selindo' : 'daerah';

    const getNum = (colKey: string, fallbackIdx?: number): number => {
      const colI = colIndexMap[colKey] !== undefined ? colIndexMap[colKey] : fallbackIdx;
      if (colI !== undefined && colI < cols.length) {
        return parseCSVNumber(cols[colI]);
      }
      return 0;
    };

    const totalDanaPKS = getNum('totalDanaPKS', 2) || 500000000;
    const totalDanaPencairan = getNum('totalDanaPencairan', 3);

    const t1Nom = getNum('tahap1', 4);
    const t2Nom = getNum('tahap2', 5);
    const t3Nom = getNum('tahap3', 6);
    const t4Nom = getNum('tahap4', 7);
    const t5Nom = getNum('tahap5', 8);
    const t6Nom = getNum('tahap6', 9);

    const calculatedJumlah = t1Nom + t2Nom + t3Nom + t4Nom + t5Nom + t6Nom;
    const jumlah = getNum('jumlah', 10) || (calculatedJumlah > 0 ? calculatedJumlah : totalDanaPencairan);
    const sisa = getNum('sisa', 11) || (totalDanaPKS - jumlah);
    const persentase = totalDanaPKS > 0 ? Number(((jumlah / totalDanaPKS) * 100).toFixed(2)) : 0;

    const rowObj: RSBMatrixRow = {
      no: parsedRows.length + 1,
      rsb: rsbName as CabangRSB,
      jenisKelolaan,
      totalDanaPKS,
      totalDanaPencairan: totalDanaPencairan || jumlah,
      tahap1: t1Nom > 0 ? { nominal: t1Nom, status: 'green' } : undefined,
      tahap2: t2Nom > 0 ? { nominal: t2Nom, status: 'green' } : undefined,
      tahap3: t3Nom > 0 ? { nominal: t3Nom, status: 'green' } : undefined,
      tahap4: t4Nom > 0 ? { nominal: t4Nom, status: 'green' } : undefined,
      tahap5: t5Nom > 0 ? { nominal: t5Nom, status: 'orange' } : undefined,
      tahap6: t6Nom > 0 ? { nominal: t6Nom, status: 'plain' } : undefined,
      jumlah,
      sisa,
      persentase,
    };

    parsedRows.push(rowObj);
  }

  return parsedRows;
}

/**
 * Export RSBMatrixRow[] in the exact "Monitoring Data Piutang Penyaluran Divisi Kesehatan" CSV format
 */
export function exportDivisiKesehatanCSV(data: RSBMatrixRow[], filename = 'Monitoring_Data_Piutang_Penyaluran_Divisi_Kesehatan.csv'): void {
  const headers = [
    'No',
    'RSB',
    'Kelolaan',
    'TOTAL DANA PKS',
    'PENCAIRAN DANA',
    'Tahap 1',
    'Tahap 2',
    'Tahap 3',
    'Tahap 4',
    'Tahap 5',
    'Tahap 6',
    'JUMLAH',
    'SISA',
    'PERSENTASE',
  ];

  const rows = data.map((r) => [
    r.no,
    `"${r.rsb}"`,
    r.jenisKelolaan === 'selindo' ? '"RSB Selindo (BAZNAS RI)"' : '"RSB Daerah"',
    r.totalDanaPKS,
    r.totalDanaPencairan,
    r.tahap1 ? r.tahap1.nominal : '',
    r.tahap2 ? r.tahap2.nominal : '',
    r.tahap3 ? r.tahap3.nominal : '',
    r.tahap4 ? r.tahap4.nominal : '',
    r.tahap5 ? r.tahap5.nominal : '',
    r.tahap6 ? r.tahap6.nominal : '',
    r.jumlah,
    r.sisa,
    `"${r.persentase.toFixed(2)}%"`,
  ]);

  // Add Totals row
  const totalPKS = data.reduce((a, b) => a + b.totalDanaPKS, 0);
  const totalPencairan = data.reduce((a, b) => a + b.totalDanaPencairan, 0);
  const totalT1 = data.reduce((a, b) => a + (b.tahap1?.nominal || 0), 0);
  const totalT2 = data.reduce((a, b) => a + (b.tahap2?.nominal || 0), 0);
  const totalT3 = data.reduce((a, b) => a + (b.tahap3?.nominal || 0), 0);
  const totalT4 = data.reduce((a, b) => a + (b.tahap4?.nominal || 0), 0);
  const totalT5 = data.reduce((a, b) => a + (b.tahap5?.nominal || 0), 0);
  const totalT6 = data.reduce((a, b) => a + (b.tahap6?.nominal || 0), 0);
  const totalJumlah = data.reduce((a, b) => a + b.jumlah, 0);
  const totalSisa = data.reduce((a, b) => a + b.sisa, 0);
  const totalPersen = totalPKS > 0 ? ((totalJumlah / totalPKS) * 100).toFixed(2) : '0';

  const totalsRow = [
    '',
    '"TOTAL"',
    '""',
    totalPKS,
    totalPencairan,
    totalT1,
    totalT2,
    totalT3,
    totalT4,
    totalT5,
    totalT6,
    totalJumlah,
    totalSisa,
    `"${totalPersen}%"`,
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(',')), totalsRow.join(',')].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate blank CSV template for Divisi Kesehatan
 */
export function downloadCSVTemplate(): void {
  const headers = [
    'No',
    'RSB',
    'Kelolaan (Daerah / Selindo)',
    'TOTAL DANA PKS',
    'PENCAIRAN DANA',
    'Tahap 1',
    'Tahap 2',
    'Tahap 3',
    'Tahap 4',
    'Tahap 5',
    'Tahap 6',
    'JUMLAH',
    'SISA',
    'PERSENTASE',
  ];

  const sampleRows = [
    '1,Brebes,Daerah,500000000,500000000,500000000,,,,,500000000,0,100%',
    '2,Kendal,Daerah,400000000,357000000,60000000,165000000,66000000,66000000,,357000000,43000000,89.25%',
    '13,Jakarta Pusat,Selindo,1200000000,1200000000,300000000,300000000,300000000,300000000,,1200000000,0,100%',
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Monitoring_Piutang_Penyaluran_Divisi_Kesehatan.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
