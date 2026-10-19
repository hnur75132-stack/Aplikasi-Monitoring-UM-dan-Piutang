import React, { useState } from 'react';
import { 
  PKSContract, 
  KategoriMitra, 
  PKSTermin, 
  CabangRSB, 
  CABANG_RSB_LIST,
  CABANG_RSB_DAERAH_LIST,
  CABANG_RSB_SELINDO_LIST
} from '../../types/finance';
import { formatRupiah } from '../../utils/formatters';
import { X, Plus, Trash2, Calculator } from 'lucide-react';

interface NewPKSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newContract: PKSContract) => void;
}

export const NewPKSModal: React.FC<NewPKSModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nomorPKS, setNomorPKS] = useState(`PKS/RSB/2026/10/${Math.floor(100 + Math.random() * 900)}`);
  const [cabangRSB, setCabangRSB] = useState<CabangRSB>('Brebes');
  const [mitraNama, setMitraNama] = useState('');
  const [kategoriMitra, setKategoriMitra] = useState<KategoriMitra>('BUMN');
  const [judulKerjasama, setJudulKerjasama] = useState('');
  const [nilaiPKSInput, setNilaiPKSInput] = useState<string>('5000000000');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().slice(0, 10));
  const [tanggalBerakhir, setTanggalBerakhir] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [picMitra, setPicMitra] = useState('');
  const [kontakPic, setKontakPic] = useState('');
  const [emailMitra, setEmailMitra] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Default 3 termin
  const [terminList, setTerminList] = useState<PKSTermin[]>([
    { terminKe: 1, namaTermin: 'Termin I (Uang Muka 40%)', persentase: 40, nilaiTermin: 2000000000, jadwalBulan: 'Bulan 1', status: 'Belum Ditagih' },
    { terminKe: 2, namaTermin: 'Termin II (Progres 40%)', persentase: 40, nilaiTermin: 2000000000, jadwalBulan: 'Bulan 3', status: 'Belum Ditagih' },
    { terminKe: 3, namaTermin: 'Termin III (Pelunasan 20%)', persentase: 20, nilaiTermin: 1000000000, jadwalBulan: 'Bulan 6', status: 'Belum Ditagih' },
  ]);

  if (!isOpen) return null;

  const totalNilai = parseFloat(nilaiPKSInput) || 0;

  const recalculateTermin = (newTotal: number) => {
    setTerminList((prev) =>
      prev.map((t) => ({
        ...t,
        nilaiTermin: Math.round((t.persentase / 100) * newTotal),
      }))
    );
  };

  const handleTotalChange = (val: string) => {
    setNilaiPKSInput(val);
    const num = parseFloat(val) || 0;
    recalculateTermin(num);
  };

  const handleTerminPercentageChange = (index: number, pct: number) => {
    setTerminList((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        persentase: pct,
        nilaiTermin: Math.round((pct / 100) * totalNilai),
      };
      return updated;
    });
  };

  const addTermin = () => {
    const nextKe = terminList.length + 1;
    setTerminList((prev) => [
      ...prev,
      {
        terminKe: nextKe,
        namaTermin: `Termin ${nextKe}`,
        persentase: 10,
        nilaiTermin: Math.round(0.1 * totalNilai),
        jadwalBulan: `Bulan ${nextKe * 2}`,
        status: 'Belum Ditagih',
      },
    ]);
  };

  const removeTermin = (index: number) => {
    if (terminList.length <= 1) return;
    setTerminList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitraNama || !judulKerjasama || totalNilai <= 0) {
      alert('Mohon isi nama mitra, judul kerjasama, dan nilai PKS dengan benar.');
      return;
    }

    const isSelindo = (CABANG_RSB_SELINDO_LIST as readonly string[]).includes(cabangRSB);

    const newContract: PKSContract = {
      id: `pks-${Date.now()}`,
      nomorPKS,
      cabangRSB,
      jenisKelolaan: isSelindo ? 'selindo' : 'daerah',
      mitraNama,
      kategoriMitra,
      judulKerjasama,
      nilaiPKS: totalNilai,
      tanggalMulai,
      tanggalBerakhir,
      picMitra: picMitra || (isSelindo ? 'Kepala RSB Selindo' : 'Kepala Klinik RSB'),
      kontakPic: kontakPic || '+62 812-0000-0000',
      emailMitra: emailMitra || 'info@baznas.go.id',
      keterangan,
      terminList,
      pencairanList: [],
      laporanSPJList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newContract);
    onClose();
  };

  const totalPersenTermin = terminList.reduce((acc, t) => acc + t.persentase, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tambah Perjanjian Kerjasama (PKS) Penyaluran RSB
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendaftaran dokumen kontrak, cabang klinik RSB (Daerah / Selindo BAZNAS RI), komitmen dana, dan skema penagihan termin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cabang Klinik RSB *
              </label>
              <select
                value={cabangRSB}
                onChange={(e) => setCabangRSB(e.target.value as CabangRSB)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-semibold text-slate-800"
              >
                <optgroup label="RSB Daerah (12 Cabang)">
                  {CABANG_RSB_DAERAH_LIST.map((b) => (
                    <option key={b} value={b}>
                      RSB {b}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="RSB Selindo (kelolaan BAZNAS RI)">
                  {CABANG_RSB_SELINDO_LIST.map((b) => (
                    <option key={b} value={b}>
                      RSB Selindo {b} (BAZNAS RI)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor PKS / Kontrak *
              </label>
              <input
                type="text"
                required
                value={nomorPKS}
                onChange={(e) => setNomorPKS(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Mitra *
              </label>
              <select
                value={kategoriMitra}
                onChange={(e) => setKategoriMitra(e.target.value as KategoriMitra)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              >
                <option value="BAZNAS Daerah">BAZNAS Daerah</option>
                <option value="BAZNAS RI (Pusat)">BAZNAS RI (Pusat / RSB Selindo)</option>
                <option value="BUMN">BUMN / BUMD</option>
                <option value="Pemerintah">Pemerintah / Dinkes</option>
                <option value="Swasta">Perusahaan Swasta</option>
                <option value="Pendidikan">Pendidikan / Universitas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Mitra / Instansi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Telkom Indonesia (Persero) Tbk"
                value={mitraNama}
                onChange={(e) => setMitraNama(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Nilai Dana PKS (Rupiah) *
              </label>
              <input
                type="number"
                required
                min="1000000"
                step="500000"
                value={nilaiPKSInput}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500 font-mono tabular-nums font-semibold text-slate-900"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Terbaca: <strong className="text-slate-800">{formatRupiah(totalNilai)}</strong>
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Judul Kerjasama / Kegiatan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengadaan Fasilitas Laboratorium Uji & Monitoring Smart IoT"
              value={judulKerjasama}
              onChange={(e) => setJudulKerjasama(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Mulai Berlaku
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Berakhir / Jatuh Tempo
              </label>
              <input
                type="date"
                required
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama PIC Mitra
              </label>
              <input
                type="text"
                placeholder="Nama Pejabat/PIC"
                value={picMitra}
                onChange={(e) => setPicMitra(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kontak Telp / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+62 812-xxxx-xxxx"
                value={kontakPic}
                onChange={(e) => setKontakPic(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Mitra
              </label>
              <input
                type="email"
                placeholder="pic@instansi.co.id"
                value={emailMitra}
                onChange={(e) => setEmailMitra(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
              />
            </div>
          </div>

          {/* Termin Schedule Setup */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Rencana Tahapan Termin Pencairan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono tabular-nums font-semibold ${totalPersenTermin === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Total: {totalPersenTermin}%
                </span>
                <button
                  type="button"
                  onClick={addTermin}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                >
                  + Tambah Termin
                </button>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {terminList.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 font-mono text-slate-500 text-center">T{t.terminKe}</span>
                  <input
                    type="text"
                    value={t.namaTermin}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTerminList((prev) => {
                        const copy = [...prev];
                        copy[idx].namaTermin = val;
                        return copy;
                      });
                    }}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 bg-white rounded-md text-xs"
                    placeholder="Nama Termin"
                  />
                  <div className="w-20 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={t.persentase}
                      onChange={(e) => handleTerminPercentageChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-14 px-2 py-1.5 border border-slate-300 bg-white rounded-md text-xs font-mono tabular-nums text-right"
                    />
                    <span className="text-slate-500 font-mono">%</span>
                  </div>
                  <div className="w-32 font-mono tabular-nums text-slate-700 text-right pr-2">
                    {formatRupiah(t.nilaiTermin)}
                  </div>
                  {terminList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTermin(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus baris termin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Catatan / Dasar Kerjasama
            </label>
            <textarea
              rows={2}
              placeholder="Catatan klausul, BAST atau disposisi perbendaharaan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-500"
            />
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Simpan PKS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
