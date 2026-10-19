import React, { useState } from 'react';
import { PKSContract, PencairanRecord } from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { X, ArrowUpRight, AlertCircle, Building } from 'lucide-react';

interface NewDisbursementModalProps {
  isOpen: boolean;
  contract: PKSContract | null;
  allContracts: PKSContract[];
  onClose: () => void;
  onSubmit: (contractId: string, disbursement: PencairanRecord) => void;
}

export const NewDisbursementModal: React.FC<NewDisbursementModalProps> = ({
  isOpen,
  contract,
  allContracts,
  onClose,
  onSubmit,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(contract?.id || allContracts[0]?.id || '');
  const [terminKe, setTerminKe] = useState<number>(1);
  const [nomorSPP, setNomorSPP] = useState(`SPP/2026/10/${Math.floor(100 + Math.random() * 900)}`);
  const [jumlahCairInput, setJumlahCairInput] = useState<string>('1000000000');
  const [tanggalCair, setTanggalCair] = useState(new Date().toISOString().slice(0, 10));
  const [bankTujuan, setBankTujuan] = useState('Bank Mandiri (Persero)');
  const [nomorRekening, setNomorRekening] = useState('137-00-882910-1');
  const [catatan, setCatatan] = useState('');

  if (!isOpen) return null;

  const targetContract = allContracts.find((c) => c.id === (contract?.id || selectedContractId)) || allContracts[0];

  if (!targetContract) return null;

  const dicairkan = targetContract.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
  const sisaMaksimalCair = Math.max(0, targetContract.nilaiPKS - dicairkan);
  const jumlahCair = parseFloat(jumlahCairInput) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jumlahCair <= 0) {
      alert('Jumlah pencairan harus lebih dari 0.');
      return;
    }

    if (jumlahCair > sisaMaksimalCair) {
      alert(`Jumlah pencairan melebihi sisa dana PKS yang belum dicairkan (${formatRupiah(sisaMaksimalCair)})`);
      return;
    }

    const newRecord: PencairanRecord = {
      id: `cair-${Date.now()}`,
      terminKe,
      nomorSPP,
      jumlahCair,
      tanggalCair,
      bankTujuan,
      nomorRekening,
      catatan,
    };

    onSubmit(targetContract.id, newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Catat Realisasi Pencairan Kas (Disbursement)
              </h3>
              <p className="text-xs text-slate-500">
                Pencairan dana termin dari rekening kas ke rekening mitra pelaksana.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Contract Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Dokumen Perjanjian Kerjasama (PKS) *
            </label>
            <select
              value={targetContract.id}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-medium"
            >
              {allContracts.map((c) => {
                const sisa = c.nilaiPKS - c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
                return (
                  <option key={c.id} value={c.id} disabled={sisa <= 0}>
                    {c.nomorPKS} - {c.mitraNama} (Sisa: {formatRupiah(sisa)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Contract Financial Snapshot */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nilai Kontrak PKS:</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">{formatRupiah(targetContract.nilaiPKS)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sudah Dicairkan:</span>
              <span className="font-semibold text-blue-700 font-mono tabular-nums">{formatRupiah(dicairkan)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-slate-700">Maksimal Sisa Cair:</span>
              <span className="text-amber-700 font-mono tabular-nums">{formatRupiah(sisaMaksimalCair)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pencairan Termin Ke- *
              </label>
              <select
                value={terminKe}
                onChange={(e) => setTerminKe(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
              >
                {[1, 2, 3, 4, 5].map((t) => (
                  <option key={t} value={t}>Termin {t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor SPP / SP2D *
              </label>
              <input
                type="text"
                required
                value={nomorSPP}
                onChange={(e) => setNomorSPP(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal Pencairan (IDR) *
              </label>
              <input
                type="number"
                required
                min="100000"
                max={sisaMaksimalCair}
                value={jumlahCairInput}
                onChange={(e) => setJumlahCairInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono tabular-nums font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Realisasi Kas *
              </label>
              <input
                type="date"
                required
                value={tanggalCair}
                onChange={(e) => setTanggalCair(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Terbilang: <span className="font-semibold text-slate-800">{formatRupiah(jumlahCair)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Tujuan Transfer
              </label>
              <input
                type="text"
                value={bankTujuan}
                onChange={(e) => setBankTujuan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Rekening Tujuan
              </label>
              <input
                type="text"
                value={nomorRekening}
                onChange={(e) => setNomorRekening(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan / Dasar Pencairan BAST
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Pencairan Uang Muka 40% setelah verifikasi BAST No. 04/BAST-UM/2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Simpan Pencairan Kas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
