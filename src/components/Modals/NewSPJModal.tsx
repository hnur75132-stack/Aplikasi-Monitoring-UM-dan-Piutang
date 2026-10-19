import React, { useState } from 'react';
import { PKSContract, LaporanSPJ, StatusVerifikasiSPJ } from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { X, FileCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface NewSPJModalProps {
  isOpen: boolean;
  contract: PKSContract | null;
  allContracts: PKSContract[];
  onClose: () => void;
  onSubmit: (contractId: string, spj: LaporanSPJ) => void;
}

export const NewSPJModal: React.FC<NewSPJModalProps> = ({
  isOpen,
  contract,
  allContracts,
  onClose,
  onSubmit,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(contract?.id || allContracts[0]?.id || '');
  const [nomorLaporan, setNomorLaporan] = useState(`SPJ/2026/10/${Math.floor(100 + Math.random() * 900)}`);
  const [tanggalLapor, setTanggalLapor] = useState(new Date().toISOString().slice(0, 10));
  const [periodeKegiatan, setPeriodeKegiatan] = useState('Agustus - Oktober 2026');
  const [nilaiRealisasiInput, setNilaiRealisasiInput] = useState<string>('1500000000');
  const [persentaseFisik, setPersentaseFisik] = useState<number>(50);
  const [statusVerifikasi, setStatusVerifikasi] = useState<StatusVerifikasiSPJ>('Terverifikasi');
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('Berkas kwitansi, faktur pajak, dan dokumentasi fisik telah diteliti.');
  const [dokumenLampiranNama, setDokumenLampiranNama] = useState('Berkas_SPJ_Termin_Lengkap.pdf');

  if (!isOpen) return null;

  const targetContract = allContracts.find((c) => c.id === (contract?.id || selectedContractId)) || allContracts[0];

  if (!targetContract) return null;

  const dicairkan = targetContract.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
  const dilaporkan = targetContract.laporanSPJList
    .filter((s) => s.statusVerifikasi === 'Terverifikasi')
    .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
  const outstandingSPJ = Math.max(0, dicairkan - dilaporkan);
  const nilaiRealisasi = parseFloat(nilaiRealisasiInput) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nilaiRealisasi <= 0) {
      alert('Nilai realisasi belanja SPJ harus lebih dari 0.');
      return;
    }

    const newSPJ: LaporanSPJ = {
      id: `spj-${Date.now()}`,
      nomorLaporan,
      tanggalLapor,
      periodeKegiatan,
      nilaiRealisasi,
      persentaseFisik,
      statusVerifikasi,
      catatanVerifikasi,
      dokumenLampiranNama: dokumenLampiranNama || 'Dokumen_SPJ.pdf',
    };

    onSubmit(targetContract.id, newSPJ);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Input & Verifikasi Laporan SPJ (Pertanggungjawaban)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan realisasi belanja riil dan audit bukti pengeluaran dana termin.
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
          {/* Target Contract */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Dokumen PKS Terkait *
            </label>
            <select
              value={targetContract.id}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-medium"
            >
              {allContracts.map((c) => {
                const totalCair = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
                return (
                  <option key={c.id} value={c.id} disabled={totalCair === 0}>
                    {c.nomorPKS} - {c.mitraNama} (Kas Cair: {formatRupiah(totalCair)})
                  </option>
                );
              })}
            </select>
          </div>

          {/* SPJ Balance Information */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Dana Kas yang Dicairkan:</span>
              <span className="font-semibold text-blue-700 font-mono tabular-nums">{formatRupiah(dicairkan)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">SPJ Terverifikasi Sebelumnya:</span>
              <span className="font-semibold text-emerald-700 font-mono tabular-nums">{formatRupiah(dilaporkan)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 font-bold">
              <span className="text-slate-700">Sisa Kas Belum Di-SPJ-kan:</span>
              <span className="text-rose-700 font-mono tabular-nums">{formatRupiah(outstandingSPJ)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Berkas Laporan SPJ *
              </label>
              <input
                type="text"
                required
                value={nomorLaporan}
                onChange={(e) => setNomorLaporan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Penyerahan SPJ *
              </label>
              <input
                type="date"
                required
                value={tanggalLapor}
                onChange={(e) => setTanggalLapor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nilai Realisasi Belanja (IDR) *
              </label>
              <input
                type="number"
                required
                min="100000"
                value={nilaiRealisasiInput}
                onChange={(e) => setNilaiRealisasiInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono tabular-nums font-bold text-slate-900"
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {formatRupiah(nilaiRealisasi)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Progres Fisik Kegiatan (%) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={persentaseFisik}
                  onChange={(e) => setPersentaseFisik(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono tabular-nums font-semibold"
                />
                <span className="text-slate-500">% capaian fisik BAST</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Periode Pelaksanaan Kegiatan
              </label>
              <input
                type="text"
                value={periodeKegiatan}
                onChange={(e) => setPeriodeKegiatan(e.target.value)}
                placeholder="Contoh: Triwulan III 2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Verifikasi Keuangan *
              </label>
              <select
                value={statusVerifikasi}
                onChange={(e) => setStatusVerifikasi(e.target.value as StatusVerifikasiSPJ)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-semibold"
              >
                <option value="Terverifikasi">Terverifikasi (Lolos Audit)</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Perlu Revisi">Perlu Revisi / Perbaikan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan Hasil Verifikasi & Audit Keuangan
            </label>
            <textarea
              rows={2}
              value={catatanVerifikasi}
              onChange={(e) => setCatatanVerifikasi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama File Dokumen Lampiran (PDF)
            </label>
            <input
              type="text"
              value={dokumenLampiranNama}
              onChange={(e) => setDokumenLampiranNama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Simpan Laporan SPJ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
