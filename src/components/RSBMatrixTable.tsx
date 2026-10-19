import React, { useState } from 'react';
import { RSBMatrixRow, CabangRSB, JenisKelolaanRSB } from '../types/finance';
import { calculateRSBMatrixTotals } from '../data/rsbSpreadsheetData';
import { Download, Printer, Search, FileSpreadsheet, Landmark, Building2, Database, RefreshCw, Pencil, Trash2, Plus } from 'lucide-react';

interface RSBMatrixTableProps {
  data: RSBMatrixRow[];
  selectedBranch: CabangRSB | 'all';
  onSelectBranch: (branch: CabangRSB | 'all') => void;
  selectedKelolaan: JenisKelolaanRSB;
  onSelectKelolaan: (kelolaan: JenisKelolaanRSB) => void;
  onOpenSyncModal?: () => void;
  isAutoSyncEnabled?: boolean;
  onEditRow?: (row: RSBMatrixRow) => void;
  onDeleteRow?: (row: RSBMatrixRow) => void;
  onAddNewRow?: () => void;
}

/**
 * Format numbers with comma separator matching the user's spreadsheet
 * e.g. 500,000,000 or -61,500,000
 */
function formatNumberSpreadsheet(val?: number): string {
  if (val === undefined || val === null) return '';
  return new Intl.NumberFormat('en-US').format(val);
}

export const RSBMatrixTable: React.FC<RSBMatrixTableProps> = ({
  data,
  selectedBranch,
  onSelectBranch,
  selectedKelolaan,
  onSelectKelolaan,
  onOpenSyncModal,
  isAutoSyncEnabled = true,
  onEditRow,
  onDeleteRow,
  onAddNewRow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rows based on kelolaan, branch, and search
  const filteredRows = data.filter((row) => {
    const matchesKelolaan =
      selectedKelolaan === 'semua' || row.jenisKelolaan === selectedKelolaan;
    const matchesBranch = selectedBranch === 'all' || row.rsb === selectedBranch;
    const matchesSearch =
      !searchTerm ||
      row.rsb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.jenisKelolaan === 'selindo' && 'selindo baznas ri'.includes(searchTerm.toLowerCase()));

    return matchesKelolaan && matchesBranch && matchesSearch;
  });

  const totals = calculateRSBMatrixTotals(filteredRows);

  // Helper for cell styling
  const renderTahapCell = (tahapItem?: { nominal: number; status: 'green' | 'orange' | 'plain' }) => {
    if (!tahapItem) {
      return <td className="border border-slate-300 p-2 text-right bg-white font-mono text-[11px]" />;
    }

    let bgClass = 'bg-white text-slate-900';
    if (tahapItem.status === 'green') {
      bgClass = 'bg-[#00e600] text-black font-semibold';
    } else if (tahapItem.status === 'orange') {
      bgClass = 'bg-[#ff9900] text-black font-semibold';
    }

    return (
      <td className={`border border-slate-300 p-2 text-right font-mono text-[11px] tabular-nums ${bgClass}`}>
        {formatNumberSpreadsheet(tahapItem.nominal)}
      </td>
    );
  };

  const handleExportSpreadsheetCSV = () => {
    const headers = [
      'No',
      'Kelolaan',
      'RSB',
      'TOTAL DANA (SESUAI PKS)',
      'TOTAL DANA (SESUAI PENCAIRAN)',
      'TAHAP 1',
      'TAHAP 2',
      'TAHAP 3',
      'TAHAP 4',
      'TAHAP 5',
      'TAHAP 6',
      'JUMLAH',
      'Sisa',
      'Persentase',
    ];

    const rows = filteredRows.map((r) => [
      r.no,
      r.jenisKelolaan === 'selindo' ? '"BAZNAS RI (Selindo)"' : '"RSB Daerah"',
      `"RSB ${r.rsb}"`,
      r.totalDanaPKS,
      r.totalDanaPencairan,
      r.tahap1?.nominal || '',
      r.tahap2?.nominal || '',
      r.tahap3?.nominal || '',
      r.tahap4?.nominal || '',
      r.tahap5?.nominal || '',
      r.tahap6?.nominal || '',
      r.jumlah,
      r.sisa,
      `"${r.persentase.toFixed(2)}%"`,
    ].join(','));

    // Totals row
    const footer = [
      '',
      '"TOTAL"',
      `"KONSOLIDASI (${filteredRows.length} CABANG)"`,
      totals.totalPKS,
      totals.totalPencairan,
      totals.totalT1,
      totals.totalT2,
      totals.totalT3,
      totals.totalT4,
      totals.totalT5,
      totals.totalT6,
      totals.totalJumlah,
      totals.totalSisa,
      `"${totals.persentaseTotal.toFixed(2)}%"`,
    ].join(',');

    const csvContent = '\uFEFF' + [headers.join(','), ...rows, footer].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matriks-pencairan-rsb-${selectedKelolaan}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold shadow-xs">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Matriks Penyaluran & Pencairan Dana RSB (Tahap 1 - 6)
              </h3>
              {selectedKelolaan === 'selindo' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Kelolaan BAZNAS RI
                </span>
              )}
              {selectedKelolaan === 'daerah' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  RSB Daerah
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Tabel rekapitulasi realisasi pencairan bertahap sesuai dokumen Perjanjian Kerjasama (PKS).
            </p>
          </div>
        </div>

        {/* Action Controls & Kelolaan Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Kelolaan Matrix Tabs */}
          <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => onSelectKelolaan('semua')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedKelolaan === 'semua'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => onSelectKelolaan('daerah')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedKelolaan === 'daerah'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RSB Daerah
            </button>
            <button
              onClick={() => onSelectKelolaan('selindo')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                selectedKelolaan === 'selindo'
                  ? 'bg-blue-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3 h-3" />
              <span>RSB Selindo (BAZNAS RI)</span>
            </button>
          </div>

          {/* Legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#00e600] inline-block border border-black/20" />
              <span>Selesai/Cair</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-[#ff9900] inline-block border border-black/20" />
              <span>Proses Berjalan</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-white inline-block border border-slate-300" />
              <span>Tahap Lanjutan</span>
            </div>
          </div>

          {onAddNewRow && (
            <button
              onClick={onAddNewRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
              title="Tambah Cabang RSB Baru ke Matriks Monitoring"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tambah Cabang RSB</span>
            </button>
          )}

          {onOpenSyncModal && (
            <button
              onClick={onOpenSyncModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
              title="Sinkronkan otomatis dengan file Monitoring Data Piutang Penyaluran Divisi Kesehatan"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sinkronisasi Otomatis</span>
              {isAutoSyncEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          )}

          <button
            onClick={handleExportSpreadsheetCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Download file CSV format spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cetak tabel"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            {/* Header with vibrant yellow styling from the spreadsheet */}
            <tr className="bg-[#ffff00] text-black font-bold border-b-2 border-black text-center select-none uppercase text-[11px]">
              <th className="border border-black p-2 w-10">No</th>
              <th className="border border-black p-2 min-w-[90px] text-center">Kelolaan</th>
              <th className="border border-black p-2 min-w-[140px] text-left">RSB</th>
              <th className="border border-black p-2 text-right min-w-[140px]">
                TOTAL DANA<br />(SESUAI PKS)
              </th>
              <th className="border border-black p-2 text-right min-w-[140px]">
                TOTAL DANA<br />(SESUAI PENCAIRAN)
              </th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 1</th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 2</th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 3</th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 4</th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 5</th>
              <th className="border border-black p-2 text-right min-w-[110px]">TAHAP 6</th>
              <th className="border border-black p-2 text-right min-w-[120px]">JUMLAH</th>
              <th className="border border-black p-2 text-right min-w-[110px]">Sisa</th>
              <th className="border border-black p-2 text-right min-w-[90px]">Persentase</th>
              {(onEditRow || onDeleteRow) && (
                <th className="border border-black p-2 min-w-[80px] text-center">AKSI</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={(onEditRow || onDeleteRow) ? 15 : 14} className="p-8 text-center text-slate-500 bg-white">
                  Tidak ada data cabang RSB yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const isSelindo = row.jenisKelolaan === 'selindo';
                return (
                  <tr 
                    key={`${row.jenisKelolaan}-${row.rsb}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* No */}
                    <td className="border border-slate-300 p-2 text-center font-mono text-[11px] text-slate-700 bg-white">
                      {index + 1}
                    </td>

                    {/* Kelolaan Badge */}
                    <td className="border border-slate-300 p-2 text-center bg-white whitespace-nowrap">
                      {isSelindo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Landmark className="w-2.5 h-2.5" />
                          <span>BAZNAS RI</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Building2 className="w-2.5 h-2.5" />
                          <span>Daerah</span>
                        </span>
                      )}
                    </td>

                    {/* RSB Branch Name */}
                    <td className="border border-slate-300 p-2 font-medium text-slate-900 bg-white whitespace-nowrap">
                      <button
                        onClick={() => onSelectBranch(selectedBranch === row.rsb ? 'all' : row.rsb)}
                        className={`hover:text-blue-600 transition-colors text-left font-semibold cursor-pointer ${
                          isSelindo ? 'text-blue-950' : 'text-slate-900'
                        }`}
                      >
                        RSB {row.rsb}
                      </button>
                    </td>

                    {/* Total Dana Sesuai PKS */}
                    <td className="border border-slate-300 p-2 text-right font-mono tabular-nums font-bold text-slate-900 bg-white">
                      {formatNumberSpreadsheet(row.totalDanaPKS)}
                    </td>

                    {/* Total Dana Sesuai Pencairan */}
                    <td className="border border-slate-300 p-2 text-right font-mono tabular-nums font-bold text-slate-900 bg-white">
                      {formatNumberSpreadsheet(row.totalDanaPencairan)}
                    </td>

                    {/* TAHAP 1 - 6 */}
                    {renderTahapCell(row.tahap1)}
                    {renderTahapCell(row.tahap2)}
                    {renderTahapCell(row.tahap3)}
                    {renderTahapCell(row.tahap4)}
                    {renderTahapCell(row.tahap5)}
                    {renderTahapCell(row.tahap6)}

                    {/* JUMLAH */}
                    <td className="border border-slate-300 p-2 text-right font-mono tabular-nums font-semibold text-slate-900 bg-white">
                      {formatNumberSpreadsheet(row.jumlah)}
                    </td>

                    {/* Sisa */}
                    <td className={`border border-slate-300 p-2 text-right font-mono tabular-nums font-medium bg-white ${
                      row.sisa < 0 ? 'text-rose-700 font-bold' : row.sisa === 0 ? 'text-slate-500' : 'text-slate-900'
                    }`}>
                      {formatNumberSpreadsheet(row.sisa)}
                    </td>

                    {/* Persentase */}
                    <td className={`border border-slate-300 p-2 text-right font-mono tabular-nums font-bold bg-white ${
                      row.persentase >= 100 ? 'text-emerald-700' : row.persentase >= 50 ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {row.persentase.toFixed(2)}%
                    </td>

                    {/* AKSI: Edit & Hapus */}
                    {(onEditRow || onDeleteRow) && (
                      <td className="border border-slate-300 p-1.5 text-center bg-white whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {onEditRow && (
                            <button
                              type="button"
                              onClick={() => onEditRow(row)}
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title={`Edit data monitoring Cabang RSB ${row.rsb}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteRow && (
                            <button
                              type="button"
                              onClick={() => onDeleteRow(row)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={`Hapus data monitoring Cabang RSB ${row.rsb}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            {/* Total Row */}
            <tr className="bg-slate-100 font-bold border-t-2 border-black text-[11px]">
              <td colSpan={3} className="border border-black p-2 text-center uppercase tracking-wider bg-slate-200">
                Total Konsolidasi ({filteredRows.length} Cabang {selectedKelolaan === 'selindo' ? 'RSB Selindo' : selectedKelolaan === 'daerah' ? 'RSB Daerah' : 'RSB'})
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalPKS)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalPencairan)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT1)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT2)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT3)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT4)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT5)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalT6)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {formatNumberSpreadsheet(totals.totalJumlah)}
              </td>
              <td className={`border border-black p-2 text-right font-mono tabular-nums bg-slate-100 ${
                totals.totalSisa < 0 ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {formatNumberSpreadsheet(totals.totalSisa)}
              </td>
              <td className="border border-black p-2 text-right font-mono tabular-nums bg-slate-100">
                {totals.persentaseTotal.toFixed(2)}%
              </td>
              {(onEditRow || onDeleteRow) && (
                <td className="border border-black p-2 bg-slate-100 text-center font-mono text-[10px] text-slate-400">
                  -
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
