import React, { useState } from 'react';
import { PKSContract } from '../../types/finance';
import { formatRupiah, formatTanggalIndo } from '../../utils/formatters';
import { 
  X, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  AlertTriangle,
  Download,
  PlusCircle
} from 'lucide-react';

interface PKSDetailModalProps {
  isOpen: boolean;
  contract: PKSContract | null;
  onClose: () => void;
  onOpenDisbursement: (contract: PKSContract) => void;
  onOpenSPJ: (contract: PKSContract) => void;
}

export const PKSDetailModal: React.FC<PKSDetailModalProps> = ({
  isOpen,
  contract,
  onClose,
  onOpenDisbursement,
  onOpenSPJ,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'termin' | 'pencairan' | 'spj'>('ringkasan');

  if (!isOpen || !contract) return null;

  const dicairkan = contract.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
  const dilaporkan = contract.laporanSPJList
    .filter((s) => s.statusVerifikasi === 'Terverifikasi')
    .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
  const sisaCair = contract.nilaiPKS - dicairkan;
  const sisaSPJ = dicairkan - dilaporkan;
  const pctCair = contract.nilaiPKS > 0 ? (dicairkan / contract.nilaiPKS) * 100 : 0;
  const pctSPJ = dicairkan > 0 ? (dilaporkan / dicairkan) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">RSB {contract.cabangRSB}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">{contract.nomorPKS}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">{contract.kategoriMitra}</span>
              <span aria-hidden="true">·</span>
              <span>Periode: {formatTanggalIndo(contract.tanggalMulai)} - {formatTanggalIndo(contract.tanggalBerakhir)}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {contract.mitraNama}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
              {contract.judulKerjasama}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Figures for this Specific PKS */}
        <div className="p-6 bg-white border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-500">Total Nilai PKS</div>
              <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {formatRupiah(contract.nilaiPKS)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">100% Kontrak</div>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="text-blue-700 font-medium">Sudah Dicairkan</div>
              <div className="text-base font-bold text-blue-900 font-mono tabular-nums mt-0.5">
                {formatRupiah(dicairkan)}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-1">
                {pctCair.toFixed(1)}% Realisasi
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
              <div className="text-emerald-700 font-medium">Sudah Dilaporkan (SPJ)</div>
              <div className="text-base font-bold text-emerald-900 font-mono tabular-nums mt-0.5">
                {formatRupiah(dilaporkan)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {pctSPJ.toFixed(1)}% dari Kas Cair
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
              <div className="text-amber-700 font-medium">Sisa Harus Dicairkan</div>
              <div className="text-base font-bold text-amber-900 font-mono tabular-nums mt-0.5">
                {formatRupiah(sisaCair)}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                {(100 - pctCair).toFixed(1)}% Tersisa
              </div>
            </div>
          </div>

          {/* Visual Dual Progress Track */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Progres Pencairan Kas ke Rekening Kegiatan</span>
                <span className="font-semibold text-blue-700 tabular-nums">{pctCair.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, pctCair)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                <span>Progres Pelaporan Pertanggungjawaban SPJ (dari kas dicairkan)</span>
                <span className="font-semibold text-emerald-700 tabular-nums">{pctSPJ.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, pctSPJ)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 text-xs font-semibold bg-slate-50/40">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ringkasan'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Informasi & PIC
          </button>
          <button
            onClick={() => setActiveTab('termin')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'termin'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tahapan Termin ({contract.terminList.length})
          </button>
          <button
            onClick={() => setActiveTab('pencairan')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pencairan'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Riwayat Pencairan ({contract.pencairanList.length})
          </button>
          <button
            onClick={() => setActiveTab('spj')}
            className={`px-3 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'spj'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dokumen & SPJ ({contract.laporanSPJList.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs max-h-80 overflow-y-auto">
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 font-semibold mb-1">Pejabat / PIC Mitra</div>
                  <div className="font-medium text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contract.picMitra}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-semibold mb-1">Kontak Langsung</div>
                  <div className="font-medium text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contract.kontakPic}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-semibold mb-1">Email Resmi</div>
                  <div className="font-medium text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contract.emailMitra}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-semibold mb-1">Sisa Kas Belum Di-SPJ-kan</div>
                  <div className="font-bold text-rose-700 font-mono tabular-nums">
                    {formatRupiah(sisaSPJ)}
                  </div>
                </div>
              </div>

              {contract.keterangan && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-slate-500 font-semibold mb-1">Keterangan & Dasar Kontrak</div>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {contract.keterangan}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'termin' && (
            <div className="space-y-2">
              {contract.terminList.map((t) => (
                <div key={t.terminKe} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{t.namaTermin}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Jadwal: {t.jadwalBulan} · Bobot: {t.persentase}%
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-slate-900">{formatRupiah(t.nilaiTermin)}</div>
                    <div className={`text-[11px] font-sans font-medium mt-0.5 ${
                      t.status === 'Dicairkan' ? 'text-emerald-600' : t.status === 'Ditagih' ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pencairan' && (
            <div className="space-y-2">
              {contract.pencairanList.length === 0 ? (
                <div className="text-center py-6 text-slate-400">Belum ada pencairan dana termin untuk PKS ini.</div>
              ) : (
                contract.pencairanList.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">Termin {p.terminKe} · {p.nomorSPP}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Cair: {formatTanggalIndo(p.tanggalCair)} · Bank: {p.bankTujuan} ({p.nomorRekening})
                      </div>
                      {p.catatan && <div className="text-[11px] text-slate-600 italic mt-0.5">{p.catatan}</div>}
                    </div>
                    <div className="text-right font-mono tabular-nums font-bold text-blue-900 text-sm">
                      {formatRupiah(p.jumlahCair)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'spj' && (
            <div className="space-y-2">
              {contract.laporanSPJList.length === 0 ? (
                <div className="text-center py-6 text-slate-400">Belum ada dokumen laporan SPJ yang diserahkan.</div>
              ) : (
                contract.laporanSPJList.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{s.nomorLaporan}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tanggal: {formatTanggalIndo(s.tanggalLapor)} · Periode: {s.periodeKegiatan} · Progres Fisik: {s.persentaseFisik}%
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        <strong>Catatan Audit:</strong> {s.catatanVerifikasi}
                      </div>
                      {s.dokumenLampiranNama && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-600 font-mono mt-1">
                          <FileText className="w-3 h-3" />
                          <span>{s.dokumenLampiranNama}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="font-mono tabular-nums font-bold text-slate-900">
                        {formatRupiah(s.nilaiRealisasi)}
                      </div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${
                        s.statusVerifikasi === 'Terverifikasi' ? 'text-emerald-700' : s.statusVerifikasi === 'Perlu Revisi' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {s.statusVerifikasi}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs">
          <div className="text-slate-500">
            Terakhir diupdate: {formatTanggalIndo(contract.updatedAt.slice(0, 10))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenDisbursement(contract);
              }}
              disabled={sisaCair <= 0}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Cairkan Kas
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSPJ(contract);
              }}
              disabled={dicairkan <= 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Catat SPJ
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
