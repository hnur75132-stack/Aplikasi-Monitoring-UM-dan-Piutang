import React, { useState, useEffect } from 'react';
import { 
  PKSContract, 
  KategoriMitra, 
  CabangRSB, 
  CABANG_RSB_LIST,
  CABANG_RSB_DAERAH_LIST,
  CABANG_RSB_SELINDO_LIST
} from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { X, Save, Edit, Building2, Landmark, AlertCircle } from 'lucide-react';

interface EditPKSModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: PKSContract | null;
  onSave: (updatedContract: PKSContract) => void;
}

export const EditPKSModal: React.FC<EditPKSModalProps> = ({
  isOpen,
  onClose,
  contract,
  onSave,
}) => {
  const [nomorPKS, setNomorPKS] = useState('');
  const [cabangRSB, setCabangRSB] = useState<CabangRSB>('Brebes');
  const [mitraNama, setMitraNama] = useState('');
  const [kategoriMitra, setKategoriMitra] = useState<KategoriMitra>('BUMN');
  const [judulKerjasama, setJudulKerjasama] = useState('');
  const [nilaiPKSInput, setNilaiPKSInput] = useState<string>('0');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [picMitra, setPicMitra] = useState('');
  const [kontakPic, setKontakPic] = useState('');
  const [emailMitra, setEmailMitra] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [jenisKelolaan, setJenisKelolaan] = useState<'daerah' | 'selindo'>('daerah');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (contract) {
      setNomorPKS(contract.nomorPKS);
      setCabangRSB(contract.cabangRSB);
      setMitraNama(contract.mitraNama);
      setKategoriMitra(contract.kategoriMitra);
      setJudulKerjasama(contract.judulKerjasama);
      setNilaiPKSInput(contract.nilaiPKS.toString());
      setTanggalMulai(contract.tanggalMulai.slice(0, 10));
      setTanggalBerakhir(contract.tanggalBerakhir.slice(0, 10));
      setPicMitra(contract.picMitra);
      setKontakPic(contract.kontakPic);
      setEmailMitra(contract.emailMitra);
      setKeterangan(contract.keterangan || '');
      setJenisKelolaan(contract.jenisKelolaan || (CABANG_RSB_SELINDO_LIST.includes(contract.cabangRSB as any) ? 'selindo' : 'daerah'));
      setErrorMsg(null);
    }
  }, [contract, isOpen]);

  if (!isOpen || !contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedNilai = parseFloat(nilaiPKSInput);
    if (isNaN(parsedNilai) || parsedNilai <= 0) {
      setErrorMsg('Nilai PKS harus berupa angka positif.');
      return;
    }
    if (!nomorPKS.trim()) {
      setErrorMsg('Nomor PKS wajib diisi.');
      return;
    }

    const updated: PKSContract = {
      ...contract,
      nomorPKS: nomorPKS.trim(),
      cabangRSB,
      jenisKelolaan,
      mitraNama: mitraNama.trim(),
      kategoriMitra,
      judulKerjasama: judulKerjasama.trim(),
      nilaiPKS: parsedNilai,
      tanggalMulai,
      tanggalBerakhir,
      picMitra: picMitra.trim(),
      kontakPic: kontakPic.trim(),
      emailMitra: emailMitra.trim(),
      keterangan: keterangan.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
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
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Edit Data Perjanjian Kerjasama (PKS)
              </h3>
              <p className="text-xs text-slate-500">
                Ubah informasi komitmen kontrak dan pemantauan piutang
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor PKS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorPKS}
                onChange={(e) => setNomorPKS(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang RSB <span className="text-rose-500">*</span>
              </label>
              <select
                value={cabangRSB}
                onChange={(e) => {
                  const val = e.target.value as CabangRSB;
                  setCabangRSB(val);
                  setJenisKelolaan(CABANG_RSB_SELINDO_LIST.includes(val as any) ? 'selindo' : 'daerah');
                }}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <optgroup label="RSB Daerah (12 Cabang)">
                  {CABANG_RSB_DAERAH_LIST.map((b) => (
                    <option key={b} value={b}>RSB {b} (Daerah)</option>
                  ))}
                </optgroup>
                <optgroup label="RSB Selindo Kelolaan BAZNAS RI (8 Cabang)">
                  {CABANG_RSB_SELINDO_LIST.map((b) => (
                    <option key={b} value={b}>RSB {b} (BAZNAS RI)</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Mitra / Lembaga Kerjasama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mitraNama}
                onChange={(e) => setMitraNama(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kategori Mitra
              </label>
              <select
                value={kategoriMitra}
                onChange={(e) => setKategoriMitra(e.target.value as KategoriMitra)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="BAZNAS Daerah">BAZNAS Daerah</option>
                <option value="BAZNAS RI (Pusat)">BAZNAS RI (Pusat)</option>
                <option value="BUMN">BUMN</option>
                <option value="Pemerintah">Pemerintah</option>
                <option value="Swasta">Swasta</option>
                <option value="Pendidikan">Pendidikan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Kerjasama / Program <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judulKerjasama}
              onChange={(e) => setJudulKerjasama(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nilai Total PKS (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min="0"
                required
                value={nilaiPKSInput}
                onChange={(e) => setNilaiPKSInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Terbilang: <span className="text-blue-700 font-semibold">{formatRupiah(parseFloat(nilaiPKSInput) || 0)}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai PKS
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Berakhir PKS
              </label>
              <input
                type="date"
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama PIC Mitra
              </label>
              <input
                type="text"
                value={picMitra}
                onChange={(e) => setPicMitra(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kontak / No. Telp
              </label>
              <input
                type="text"
                value={kontakPic}
                onChange={(e) => setKontakPic(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Mitra
              </label>
              <input
                type="email"
                value={emailMitra}
                onChange={(e) => setEmailMitra(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
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
              <span>Simpan Perubahan PKS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
