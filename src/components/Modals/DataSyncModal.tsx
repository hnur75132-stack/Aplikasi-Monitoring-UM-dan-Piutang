import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Sparkles, 
  Database,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap
} from 'lucide-react';
import { RSBMatrixRow } from '../../types/finance';
import { parseDivisiKesehatanCSV, exportDivisiKesehatanCSV, downloadCSVTemplate } from '../../utils/syncEngine';
import { formatRupiah } from '../../utils/formatters';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  matrixData: RSBMatrixRow[];
  onApplySync: (newRows: RSBMatrixRow[], sourceDescription: string) => void;
  onSimulateIncomingUpdate: () => void;
  onResetToDefault: () => void;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (val: boolean) => void;
  lastSyncTime: Date;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  matrixData,
  onApplySync,
  onSimulateIncomingUpdate,
  onResetToDefault,
  isAutoSyncEnabled,
  setIsAutoSyncEnabled,
  lastSyncTime,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'status'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [previewRows, setPreviewRows] = useState<RSBMatrixRow[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error('File kosong atau tidak dapat dibaca.');
        const parsed = parseDivisiKesehatanCSV(text);
        if (parsed.length === 0) {
          throw new Error('Tidak ada data baris RSB yang dapat diuraikan. Pastikan format kolom sesuai format Divisi Kesehatan.');
        }
        setPreviewRows(parsed);
        setSuccessMsg(`Berhasil membaca ${parsed.length} baris data dari file "${file.name}".`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memproses file CSV.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Terjadi kesalahan saat membaca file.');
    };
    reader.readAsText(file);
  };

  const handlePasteProcess = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (!pastedText.trim()) {
        throw new Error('Silakan tempel teks CSV / data spreadsheet terlebih dahulu.');
      }
      const parsed = parseDivisiKesehatanCSV(pastedText);
      if (parsed.length === 0) {
        throw new Error('Tidak dapat menemukan baris RSB yang valid dari teks yang ditempel.');
      }
      setPreviewRows(parsed);
      setSuccessMsg(`Berhasil mengurai ${parsed.length} baris data dari teks yang ditempel.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengurai teks data.');
    }
  };

  const handleApply = () => {
    if (!previewRows || previewRows.length === 0) return;
    onApplySync(previewRows, `Sinkronisasi file "${previewRows.length} Cabang RSB Divisi Kesehatan"`);
    onClose();
  };

  const currentTotalPKS = matrixData.reduce((acc, r) => acc + r.totalDanaPKS, 0);
  const currentTotalPencairan = matrixData.reduce((acc, r) => acc + r.totalDanaPencairan, 0);

  const previewTotalPKS = previewRows ? previewRows.reduce((acc, r) => acc + r.totalDanaPKS, 0) : 0;
  const previewTotalPencairan = previewRows ? previewRows.reduce((acc, r) => acc + r.totalDanaPencairan, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Sinkronisasi Data Monitoring Piutang Penyaluran
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Divisi Kesehatan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sinkronkan otomatis dataset spreadsheet dengan seluruh KPI, tabel matriks, dan database PKS.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar & Auto-Sync Toggle */}
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-medium text-blue-900">
              <span className={`w-2 h-2 rounded-full ${isAutoSyncEnabled ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>Status: {isAutoSyncEnabled ? 'Pembaruan Otomatis Aktif (Live)' : 'Sinkron Manual'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">
              Sinkron terakhir: <strong className="font-mono text-slate-800">{lastSyncTime.toLocaleTimeString('id-ID')}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isAutoSyncEnabled}
                onChange={(e) => setIsAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Perbarui Otomatis saat ada perubahan</span>
            </label>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Unggah File CSV / Excel</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Salin & Tempel Data Teks</span>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Status Dataset Terkini ({matrixData.length} Cabang)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong>Gagal Memproses Data:</strong> {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <strong>Data Siap Disinkronkan:</strong> {successMsg}
              </div>
            </div>
          )}

          {/* TAB 1: Upload CSV */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileProcess(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv,.tab"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Pilih atau seret file <span className="text-blue-600">Monitoring Data Piutang Penyaluran Divisi Kesehatan</span> ke sini
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Mendukung file format <strong>.CSV</strong> atau <strong>.TSV</strong> dengan pemisah koma, titik-koma, atau tab.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100">
                    Pilih File dari Komputer
                  </span>
                </div>
              </div>

              {/* Template & Export Quick Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="text-slate-600">
                  Perlu acuan format kolom resmi Divisi Kesehatan?
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadCSVTemplate()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template CSV</span>
                  </button>
                  <button
                    onClick={() => exportDivisiKesehatanCSV(matrixData)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Data Saat Ini (.CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Paste CSV Text */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Salin dan Tempel Teks CSV / Baris Spreadsheet (Excel / Google Sheets):
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`No,RSB,Kelolaan,TOTAL DANA PKS,PENCAIRAN DANA,Tahap 1,Tahap 2,Tahap 3,Tahap 4,Tahap 5,Tahap 6,JUMLAH,SISA,PERSENTASE\n1,Brebes,Daerah,500000000,500000000,500000000,,,,,500000000,0,100%\n2,Kendal,Daerah,400000000,357000000,60000000,165000000,66000000,66000000,,357000000,43000000,89.25%`}
                  rows={8}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {pastedText ? `${pastedText.split('\n').filter((l) => l.trim()).length} baris teks terdeteksi` : 'Data teks belum diisi'}
                </span>
                <button
                  onClick={handlePasteProcess}
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  Urai & Pratinjau Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Status Summary */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Cabang</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{matrixData.length} RSB</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">12 Daerah · 8 Selindo BAZNAS RI</div>
                </div>
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Total Dana PKS</div>
                  <div className="text-sm font-bold text-blue-900 mt-1 font-mono">{formatRupiah(currentTotalPKS)}</div>
                </div>
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Total Pencairan</div>
                  <div className="text-sm font-bold text-emerald-900 mt-1 font-mono">{formatRupiah(currentTotalPencairan)}</div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Rata-rata Realisasi</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">
                    {currentTotalPKS > 0 ? ((currentTotalPencairan / currentTotalPKS) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              {/* Actions & Simulation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Uji Pembaruan Otomatis (Live Simulation)</span>
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingin melihat bagaimana sistem memperbarui data secara otomatis ketika ada pencairan atau transaksi baru dari Divisi Kesehatan? Klik tombol di bawah:
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSimulateIncomingUpdate();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-2xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simulasikan Update Pencairan Baru</span>
                  </button>
                  <button
                    onClick={() => {
                      onResetToDefault();
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset ke Dataset Default Divisi Kesehatan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW SECTION (if rows parsed) */}
          {previewRows && previewRows.length > 0 && (
            <div className="border border-blue-200 rounded-xl bg-blue-50/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pratinjau Hasil Sinkronisasi ({previewRows.length} Cabang RSB)</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Perbandingan data sebelum dan sesudah disinkronkan:
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-800">
                    PKS: {formatRupiah(previewTotalPKS)}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-700">
                    Cair: {formatRupiah(previewTotalPencairan)} ({previewTotalPKS > 0 ? ((previewTotalPencairan / previewTotalPKS) * 100).toFixed(1) : 0}%)
                  </div>
                </div>
              </div>

              {/* Quick sample list */}
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white text-xs divide-y divide-slate-100">
                {previewRows.slice(0, 8).map((r, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono text-slate-400">{r.no}</span>
                      <span className="font-semibold text-slate-900">{r.rsb}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        r.jenisKelolaan === 'selindo' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.jenisKelolaan === 'selindo' ? 'RSB Selindo' : 'RSB Daerah'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-right">
                      <span className="text-slate-600">PKS: {formatRupiah(r.totalDanaPKS)}</span>
                      <span className="text-emerald-700 font-semibold">{r.persentase.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
                {previewRows.length > 8 && (
                  <div className="px-3 py-2 text-center text-[11px] text-slate-500 bg-slate-50">
                    ... dan {previewRows.length - 8} cabang lainnya
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            {previewRows && previewRows.length > 0 ? (
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Terapkan & Perbarui Otomatis ({previewRows.length} Cabang)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onApplySync(matrixData, 'Penyegaran Sinkronisasi Manual');
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sinkronkan Sekarang</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
