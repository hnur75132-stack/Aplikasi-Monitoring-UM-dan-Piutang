import React, { useState, useEffect } from 'react';
import { RSBMatrixRow, TahapStatusColor } from '../../types/finance';
import { formatRupiah, formatNumberSpreadsheet } from '../../utils/formatters';
import { 
  X, 
  Save, 
  Building2, 
  Landmark, 
  Calculator, 
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react';

interface EditRSBMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (row: RSBMatrixRow) => void;
  initialRow?: RSBMatrixRow | null;
  mode: 'edit' | 'create';
}

export const EditRSBMatrixModal: React.FC<EditRSBMatrixModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRow,
  mode,
}) => {
  const [rsbName, setRsbName] = useState('');
  const [jenisKelolaan, setJenisKelolaan] = useState<'daerah' | 'selindo'>('daerah');
  const [totalDanaPKS, setTotalDanaPKS] = useState<number>(0);
  
  // Nominal per tahap
  const [t1Nominal, setT1Nominal] = useState<number>(0);
  const [t1Status, setT1Status] = useState<TahapStatusColor>('green');

  const [t2Nominal, setT2Nominal] = useState<number>(0);
  const [t2Status, setT2Status] = useState<TahapStatusColor>('green');

  const [t3Nominal, setT3Nominal] = useState<number>(0);
  const [t3Status, setT3Status] = useState<TahapStatusColor>('green');

  const [t4Nominal, setT4Nominal] = useState<number>(0);
  const [t4Status, setT4Status] = useState<TahapStatusColor>('green');

  const [t5Nominal, setT5Nominal] = useState<number>(0);
  const [t5Status, setT5Status] = useState<TahapStatusColor>('green');

  const [t6Nominal, setT6Nominal] = useState<number>(0);
  const [t6Status, setT6Status] = useState<TahapStatusColor>('green');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or initialRow changes
  useEffect(() => {
    if (initialRow && mode === 'edit') {
      setRsbName(initialRow.rsb);
      setJenisKelolaan(initialRow.jenisKelolaan);
      setTotalDanaPKS(initialRow.totalDanaPKS || 0);

      setT1Nominal(initialRow.tahap1?.nominal || 0);
      setT1Status(initialRow.tahap1?.status || 'green');

      setT2Nominal(initialRow.tahap2?.nominal || 0);
      setT2Status(initialRow.tahap2?.status || 'green');

      setT3Nominal(initialRow.tahap3?.nominal || 0);
      setT3Status(initialRow.tahap3?.status || 'green');

      setT4Nominal(initialRow.tahap4?.nominal || 0);
      setT4Status(initialRow.tahap4?.status || 'green');

      setT5Nominal(initialRow.tahap5?.nominal || 0);
      setT5Status(initialRow.tahap5?.status || 'green');

      setT6Nominal(initialRow.tahap6?.nominal || 0);
      setT6Status(initialRow.tahap6?.status || 'green');
    } else {
      setRsbName('');
      setJenisKelolaan('daerah');
      setTotalDanaPKS(1000000000);
      setT1Nominal(0);
      setT1Status('green');
      setT2Nominal(0);
      setT2Status('green');
      setT3Nominal(0);
      setT3Status('green');
      setT4Nominal(0);
      setT4Status('green');
      setT5Nominal(0);
      setT5Status('green');
      setT6Nominal(0);
      setT6Status('green');
    }
    setErrorMessage(null);
  }, [initialRow, mode, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const totalCair = t1Nominal + t2Nominal + t3Nominal + t4Nominal + t5Nominal + t6Nominal;
  const sisa = totalDanaPKS - totalCair;
  const persentase = totalDanaPKS > 0 ? (totalCair / totalDanaPKS) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsbName.trim()) {
      setErrorMessage('Nama Cabang RSB wajib diisi.');
      return;
    }
    if (totalDanaPKS < 0) {
      setErrorMessage('Total dana PKS tidak boleh negatif.');
      return;
    }

    const updatedRow: RSBMatrixRow = {
      no: initialRow?.no || 1,
      rsb: rsbName.trim(),
      jenisKelolaan,
      totalDanaPKS,
      totalDanaPencairan: totalCair,
      tahap1: t1Nominal > 0 ? { nominal: t1Nominal, status: t1Status } : undefined,
      tahap2: t2Nominal > 0 ? { nominal: t2Nominal, status: t2Status } : undefined,
      tahap3: t3Nominal > 0 ? { nominal: t3Nominal, status: t3Status } : undefined,
      tahap4: t4Nominal > 0 ? { nominal: t4Nominal, status: t4Status } : undefined,
      tahap5: t5Nominal > 0 ? { nominal: t5Nominal, status: t5Status } : undefined,
      tahap6: t6Nominal > 0 ? { nominal: t6Nominal, status: t6Status } : undefined,
      jumlah: totalCair,
      sisa,
      persentase,
    };

    onSave(updatedRow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {mode === 'edit' ? <Save className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {mode === 'edit' ? `Edit Data Matriks Monitoring — RSB ${initialRow?.rsb}` : 'Tambah Cabang RSB ke Matriks Monitoring'}
              </h3>
              <p className="text-xs text-slate-500">
                Data monitoring penyaluran piutang bertahap Divisi Kesehatan BAZNAS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Identitas Cabang & Kelolaan */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
              <span>1. Identitas Cabang & Jenis Kelolaan</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Cabang RSB <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rsbName}
                  onChange={(e) => setRsbName(e.target.value)}
                  placeholder="Contoh: Brebes, Kendal, Makassar..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelolaan RSB <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisKelolaan('daerah')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      jenisKelolaan === 'daerah'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>RSB Daerah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisKelolaan('selindo')}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      jenisKelolaan === 'selindo'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5" />
                    <span>BAZNAS RI (Selindo)</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Dana Sesuai PKS (Nilai Komitmen Kontrak) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={totalDanaPKS || ''}
                  onChange={(e) => setTotalDanaPKS(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Terbilang: <span className="text-blue-700 font-semibold">{formatRupiah(totalDanaPKS)}</span>
              </p>
            </div>
          </div>

          {/* Section 2: Input Pencairan Tahap 1 - 6 */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                2. Realisasi Pencairan Bertahap (Tahap 1 - 6)
              </h4>
              <span className="text-[11px] text-slate-500">
                Isi nominal 0 jika termin belum dicairkan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tahap 1 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 1</span>
                  <select
                    value={t1Status}
                    onChange={(e) => setT1Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t1Nominal || ''}
                    onChange={(e) => setT1Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tahap 2 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 2</span>
                  <select
                    value={t2Status}
                    onChange={(e) => setT2Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t2Nominal || ''}
                    onChange={(e) => setT2Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tahap 3 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 3</span>
                  <select
                    value={t3Status}
                    onChange={(e) => setT3Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t3Nominal || ''}
                    onChange={(e) => setT3Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tahap 4 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 4</span>
                  <select
                    value={t4Status}
                    onChange={(e) => setT4Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t4Nominal || ''}
                    onChange={(e) => setT4Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tahap 5 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 5</span>
                  <select
                    value={t5Status}
                    onChange={(e) => setT5Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t5Nominal || ''}
                    onChange={(e) => setT5Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Tahap 6 */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tahap 6</span>
                  <select
                    value={t6Status}
                    onChange={(e) => setT6Status(e.target.value as TahapStatusColor)}
                    className="text-[10px] font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="green">Hijau (Cair/Selesai)</option>
                    <option value="orange">Oranye (Proses)</option>
                    <option value="plain">Polos (Standar)</option>
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={t6Nominal || ''}
                    onChange={(e) => setT6Nominal(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Ringkasan & Kalkulasi Otomatis */}
          <div className="p-4 bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Kalkulasi Otomatis Sistem</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Real-Time Recalculated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Total Dana PKS:</span>
                <span className="font-mono font-bold text-slate-900">{formatNumberSpreadsheet(totalDanaPKS)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Jumlah Pencairan:</span>
                <span className="font-mono font-bold text-emerald-700">{formatNumberSpreadsheet(totalCair)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Sisa Dana:</span>
                <span className={`font-mono font-bold ${sisa < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatNumberSpreadsheet(sisa)}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block">Persentase Realisasi:</span>
                <span className="font-mono font-bold text-blue-700">{persentase.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{mode === 'edit' ? 'Simpan Perubahan' : 'Tambahkan ke Matriks'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
