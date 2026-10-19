import React from 'react';
import { PKSContract, FinancialSummaryKPI, RSBMatrixRow } from '../types/finance';
import { formatRupiah, formatTanggalIndo } from '../utils/formatters';
import { RSB_SPREADSHEET_DATA, calculateRSBMatrixTotals } from '../data/rsbSpreadsheetData';

interface PrintReportViewProps {
  contracts: PKSContract[];
  kpi: FinancialSummaryKPI;
  matrixData?: RSBMatrixRow[];
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ contracts, kpi, matrixData }) => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const rowsToRender = matrixData && matrixData.length > 0 ? matrixData : RSB_SPREADSHEET_DATA;
  const matrixTotals = calculateRSBMatrixTotals(rowsToRender);

  return (
    <div className="hidden print:block p-8 bg-white text-black text-xs">
      {/* Kop Surat Resmi */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-base font-bold uppercase tracking-wide">
          LAPORAN MONITORING PIUTANG PENYALURAN & REALISASI DANA
        </h1>
        <h2 className="text-sm font-semibold uppercase">
          KLINIK RUMAH SEHAT BAZNAS (RSB) - REKAPITULASI PENYALURAN TAHAP 1 S.D 6
        </h2>
        <p className="text-[10px] text-gray-600 mt-1">
          Dicetak secara otomatis pada: {formatTanggalIndo(currentDate)} | Status Sistem: Terverifikasi
        </p>
      </div>

      {/* 4 Core Requested Figures Summary Box */}
      <div className="mb-6 border border-black p-4 rounded-xs">
        <h3 className="font-bold text-xs uppercase mb-3 border-b border-gray-300 pb-1">
          I. KONSOLIDASI POSISI KEUANGAN PENYALURAN
        </h3>
        <table className="w-full text-xs">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 font-medium w-2/3">1. Total Dana Sesuai Perjanjian Kerjasama (PKS)</td>
              <td className="py-1.5 font-mono text-right font-bold">{formatRupiah(kpi.totalDanaPKS)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 font-medium">2. Realisasi Dana yang Sudah Dicairkan (Total Pencairan Tahap)</td>
              <td className="py-1.5 font-mono text-right font-bold text-blue-900">
                {formatRupiah(kpi.totalDanaDicairkan)} ({kpi.persentasePencairan.toFixed(1)}%)
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 font-medium">3. Realisasi Dana yang Sudah Dilaporkan (SPJ Terverifikasi)</td>
              <td className="py-1.5 font-mono text-right font-bold text-emerald-900">
                {formatRupiah(kpi.totalDanaDilaporkan)} ({kpi.persentasePelaporan.toFixed(1)}%)
              </td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-1.5 font-medium">4. Sisa Dana yang Masih Harus Dicairkan / Disalurkan</td>
              <td className="py-1.5 font-mono text-right font-bold text-amber-900">
                {formatRupiah(kpi.sisaDanaHarusDicairkan)} ({(100 - kpi.persentasePencairan).toFixed(1)}%)
              </td>
            </tr>
            <tr>
              <td className="py-1.5 font-medium">5. Sisa Dana Belum Dilaporkan (Outstanding Kas di Klinik RSB)</td>
              <td className="py-1.5 font-mono text-right font-bold text-red-900">{formatRupiah(kpi.sisaDanaBelumDilaporkan)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Exact RSB Spreadsheet Matrix */}
      <div className="mb-6">
        <h3 className="font-bold text-xs uppercase mb-2">
          II. MATRIKS REALISASI PENCAIRAN KLINIK RSB PER TAHAP
        </h3>
        <table className="w-full border-collapse border border-black text-[9px]">
          <thead>
            <tr className="bg-yellow-200 border-b border-black text-center font-bold">
              <th className="border border-black p-1 w-6">No</th>
              <th className="border border-black p-1 text-center">Kelolaan</th>
              <th className="border border-black p-1 text-left">RSB</th>
              <th className="border border-black p-1 text-right">TOTAL PKS</th>
              <th className="border border-black p-1 text-right">PENCAIRAN</th>
              <th className="border border-black p-1 text-right">TAHAP 1</th>
              <th className="border border-black p-1 text-right">TAHAP 2</th>
              <th className="border border-black p-1 text-right">TAHAP 3</th>
              <th className="border border-black p-1 text-right">TAHAP 4</th>
              <th className="border border-black p-1 text-right">TAHAP 5</th>
              <th className="border border-black p-1 text-right">TAHAP 6</th>
              <th className="border border-black p-1 text-right">JUMLAH</th>
              <th className="border border-black p-1 text-right">Sisa</th>
              <th className="border border-black p-1 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rowsToRender.map((row, idx) => (
              <tr key={`${row.jenisKelolaan}-${row.rsb}`} className="border-b border-gray-300">
                <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                <td className="border border-black p-1 text-center text-[8px] font-semibold">
                  {row.jenisKelolaan === 'selindo' ? 'BAZNAS RI' : 'Daerah'}
                </td>
                <td className="border border-black p-1 font-semibold">{row.rsb}</td>
                <td className="border border-black p-1 text-right font-mono">{row.totalDanaPKS.toLocaleString('en-US')}</td>
                <td className="border border-black p-1 text-right font-mono">{row.totalDanaPencairan.toLocaleString('en-US')}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap1 ? row.tahap1.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap2 ? row.tahap2.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap3 ? row.tahap3.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap4 ? row.tahap4.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap5 ? row.tahap5.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono">{row.tahap6 ? row.tahap6.nominal.toLocaleString('en-US') : ''}</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{row.jumlah.toLocaleString('en-US')}</td>
                <td className="border border-black p-1 text-right font-mono">{row.sisa.toLocaleString('en-US')}</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{row.persentase.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold border-t-2 border-black text-[9px]">
              <td colSpan={3} className="border border-black p-1 text-center">TOTAL KONSOLIDASI ({rowsToRender.length} CABANG RSB)</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalPKS.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalPencairan.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT1.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT2.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT3.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT4.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT5.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalT6.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalJumlah.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.totalSisa.toLocaleString('en-US')}</td>
              <td className="border border-black p-1 text-right font-mono">{matrixTotals.persentaseTotal.toFixed(2)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Contract Table */}
      <div className="mb-8">
        <h3 className="font-bold text-xs uppercase mb-2">
          III. RINCIAN PERJANJIAN KERJASAMA (PKS) AKTIF
        </h3>
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-100 border-b border-black text-center font-bold">
              <th className="border border-black p-1.5 w-8">No</th>
              <th className="border border-black p-1.5 text-left">No. PKS & Mitra</th>
              <th className="border border-black p-1.5 text-center">Cabang RSB</th>
              <th className="border border-black p-1.5 text-right">Nilai PKS (IDR)</th>
              <th className="border border-black p-1.5 text-right">Sudah Dicairkan</th>
              <th className="border border-black p-1.5 text-right">Sudah Dilaporkan (SPJ)</th>
              <th className="border border-black p-1.5 text-right">Sisa Harus Dicairkan</th>
              <th className="border border-black p-1.5 text-right">Sisa Belum SPJ</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => {
              const dicairkan = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
              const dilaporkan = c.laporanSPJList
                .filter((s) => s.statusVerifikasi === 'Terverifikasi')
                .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
              const sisaCair = c.nilaiPKS - dicairkan;
              const sisaSPJ = dicairkan - dilaporkan;

              return (
                <tr key={c.id} className="border-b border-gray-300">
                  <td className="border border-black p-1 text-center font-mono">{i + 1}</td>
                  <td className="border border-black p-1">
                    <div className="font-bold">{c.mitraNama}</div>
                    <div className="text-gray-600 font-mono text-[9px]">{c.nomorPKS} ({c.kategoriMitra})</div>
                  </td>
                  <td className="border border-black p-1 text-center font-semibold">
                    RSB {c.cabangRSB}
                  </td>
                  <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.nilaiPKS)}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatRupiah(dicairkan)}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatRupiah(dilaporkan)}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatRupiah(sisaCair)}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatRupiah(sisaSPJ)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td colSpan={3} className="border border-black p-1.5 text-center uppercase">Total Konsolidasi</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(kpi.totalDanaPKS)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(kpi.totalDanaDicairkan)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(kpi.totalDanaDilaporkan)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(kpi.sisaDanaHarusDicairkan)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(kpi.sisaDanaBelumDilaporkan)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Lembar Pengesahan */}
      <div className="pt-8 grid grid-cols-2 text-center text-xs">
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
          <div className="h-20" />
          <p className="font-bold underline">( Dr. Ir. Budi Santoso, M.Si )</p>
          <p className="text-[10px]">NIP. 19780512 200312 1 002</p>
        </div>
        <div>
          <p>Disiapkan Oleh,</p>
          <p className="font-bold">Bendahara Pengeluaran & Verifikator</p>
          <div className="h-20" />
          <p className="font-bold underline">( Siti Rahmawati, S.E., Ak. )</p>
          <p className="text-[10px]">NIP. 19850920 200801 2 004</p>
        </div>
      </div>
    </div>
  );
};
