import React, { useState, useMemo } from 'react';
import { PKSContract, KategoriMitra, CabangRSB, CABANG_RSB_LIST } from '../types/finance';
import { formatRupiah, formatRupiahCompact, formatTanggalIndo } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  PlusCircle, 
  FileCheck2, 
  Trash2, 
  Building2, 
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  MapPin,
  Pencil
} from 'lucide-react';

interface PKSDataTableProps {
  contracts: PKSContract[];
  selectedBranch: CabangRSB | 'all';
  onSelectBranch: (branch: CabangRSB | 'all') => void;
  onSelectContract: (contract: PKSContract) => void;
  onOpenDisbursement: (contract: PKSContract) => void;
  onOpenSPJ: (contract: PKSContract) => void;
  onDeleteContract: (contract: PKSContract) => void;
  onOpenNewPKS: () => void;
  onEditContract?: (contract: PKSContract) => void;
}

type SortField = 'nilaiPKS' | 'totalDicairkan' | 'sisaCair' | 'sisaSPJ' | 'tanggalBerakhir';
type SortOrder = 'asc' | 'desc';

export const PKSDataTable: React.FC<PKSDataTableProps> = ({
  contracts,
  selectedBranch,
  onSelectBranch,
  onSelectContract,
  onOpenDisbursement,
  onOpenSPJ,
  onDeleteContract,
  onOpenNewPKS,
  onEditContract,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('nilaiPKS');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort contracts
  const filteredContracts = useMemo(() => {
    return contracts
      .filter((c) => {
        // RSB Branch filter
        const matchesBranch = selectedBranch === 'all' || c.cabangRSB === selectedBranch;

        // Search
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          c.nomorPKS.toLowerCase().includes(query) ||
          c.mitraNama.toLowerCase().includes(query) ||
          c.judulKerjasama.toLowerCase().includes(query) ||
          c.picMitra.toLowerCase().includes(query) ||
          (c.cabangRSB && c.cabangRSB.toLowerCase().includes(query));

        // Category filter
        const matchesCategory =
          selectedCategory === 'all' || c.kategoriMitra === selectedCategory;

        // Status filter
        const dicairkan = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
        const dilaporkan = c.laporanSPJList
          .filter((s) => s.statusVerifikasi === 'Terverifikasi')
          .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
        const sisaCair = c.nilaiPKS - dicairkan;
        const sisaSPJ = dicairkan - dilaporkan;

        let matchesStatus = true;
        if (selectedStatusFilter === 'selesai') {
          matchesStatus = sisaCair === 0 && sisaSPJ === 0;
        } else if (selectedStatusFilter === 'butuh_spj') {
          matchesStatus = sisaSPJ > 0;
        } else if (selectedStatusFilter === 'sisa_cair') {
          matchesStatus = sisaCair > 0;
        }

        return matchesQuery && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const dicairkanA = a.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
        const dilaporkanA = a.laporanSPJList
          .filter((s) => s.statusVerifikasi === 'Terverifikasi')
          .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
        const sisaCairA = a.nilaiPKS - dicairkanA;
        const sisaSPJA = dicairkanA - dilaporkanA;

        const dicairkanB = b.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
        const dilaporkanB = b.laporanSPJList
          .filter((s) => s.statusVerifikasi === 'Terverifikasi')
          .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
        const sisaCairB = b.nilaiPKS - dicairkanB;
        const sisaSPJB = dicairkanB - dilaporkanB;

        let valA = 0;
        let valB = 0;

        switch (sortField) {
          case 'nilaiPKS':
            valA = a.nilaiPKS;
            valB = b.nilaiPKS;
            break;
          case 'totalDicairkan':
            valA = dicairkanA;
            valB = dicairkanB;
            break;
          case 'sisaCair':
            valA = sisaCairA;
            valB = sisaCairB;
            break;
          case 'sisaSPJ':
            valA = sisaSPJA;
            valB = sisaSPJB;
            break;
          case 'tanggalBerakhir':
            return sortOrder === 'asc'
              ? a.tanggalBerakhir.localeCompare(b.tanggalBerakhir)
              : b.tanggalBerakhir.localeCompare(a.tanggalBerakhir);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [contracts, searchQuery, selectedCategory, selectedStatusFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Daftar Perjanjian Kerjasama (PKS) & Posisi Piutang
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola dokumen kontrak, pencairan termin perbankan, dan monitoring laporan pertanggungjawaban (SPJ).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-semibold text-slate-800 tabular-nums">{filteredContracts.length}</span> dari{' '}
              <span className="font-semibold text-slate-800 tabular-nums">{contracts.length}</span> PKS
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor PKS, nama mitra, atau judul kegiatan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium overflow-x-auto">
            {['all', 'BAZNAS Daerah', 'BAZNAS RI (Pusat)', 'BUMN', 'Pemerintah', 'Swasta'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'Semua Mitra' : cat}
              </button>
            ))}
          </div>

          {/* RSB Branch Dropdown Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedBranch}
              onChange={(e) => onSelectBranch(e.target.value as CabangRSB | 'all')}
              aria-label="Filter Cabang Klinik RSB"
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">Semua Cabang RSB ({CABANG_RSB_LIST.length} Cabang)</option>
              <optgroup label="RSB Daerah (12 Cabang)">
                {CABANG_RSB_LIST.slice(0, 12).map((b) => (
                  <option key={b} value={b}>
                    RSB {b}
                  </option>
                ))}
              </optgroup>
              <optgroup label="RSB Selindo (kelolaan BAZNAS RI)">
                {CABANG_RSB_LIST.slice(12).map((b) => (
                  <option key={b} value={b}>
                    RSB Selindo {b}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              aria-label="Filter status kontrak"
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-slate-400"
            >
              <option value="all">Semua Status</option>
              <option value="butuh_spj">Ada Outstanding SPJ</option>
              <option value="sisa_cair">Ada Sisa Belum Cair</option>
              <option value="selesai">PKS Selesai 100%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[240px]">Perjanjian Kerjasama (PKS)</th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('nilaiPKS')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Total PKS</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('totalDicairkan')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Sudah Dicairkan</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">
                <span>Sudah Dilaporkan (SPJ)</span>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('sisaCair')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Sisa Harus Dicairkan</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => handleSort('sisaSPJ')}
              >
                <div className="inline-flex items-center gap-1">
                  <span>Sisa Belum SPJ</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Status & Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-3">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium text-slate-700">Tidak ada data PKS yang sesuai</p>
                    <p className="text-xs text-slate-400">
                      Coba ganti filter pencarian atau tambahkan Perjanjian Kerjasama (PKS) baru.
                    </p>
                    <button
                      onClick={onOpenNewPKS}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tambah PKS Baru</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContracts.map((c) => {
                const dicairkan = c.pencairanList.reduce((acc, p) => acc + p.jumlahCair, 0);
                const dilaporkan = c.laporanSPJList
                  .filter((s) => s.statusVerifikasi === 'Terverifikasi')
                  .reduce((acc, s) => acc + s.nilaiRealisasi, 0);
                const sisaCair = c.nilaiPKS - dicairkan;
                const sisaSPJ = dicairkan - dilaporkan;
                const pctCair = c.nilaiPKS > 0 ? (dicairkan / c.nilaiPKS) * 100 : 0;
                const pctSPJ = dicairkan > 0 ? (dilaporkan / dicairkan) * 100 : 0;
                const hasPendingSPJ = c.laporanSPJList.some((s) => s.statusVerifikasi === 'Menunggu Verifikasi');
                const hasRevisiSPJ = c.laporanSPJList.some((s) => s.statusVerifikasi === 'Perlu Revisi');

                return (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Contract Details & Metadata (Clean unboxed text separators) */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelectContract(c)}>
                        {c.mitraNama}
                      </div>
                      <div className="text-slate-500 line-clamp-1 mt-0.5" title={c.judulKerjasama}>
                        {c.judulKerjasama}
                      </div>
                      {/* Zero-Pill unboxed metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        {c.jenisKelolaan === 'selindo' ? (
                          <span className="font-semibold text-blue-700">RSB Selindo {c.cabangRSB} (BAZNAS RI)</span>
                        ) : (
                          <span className="font-semibold text-emerald-700">RSB Daerah {c.cabangRSB}</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-600">{c.nomorPKS}</span>
                        <span aria-hidden="true">·</span>
                        <span>{c.kategoriMitra}</span>
                        <span aria-hidden="true">·</span>
                        <span>Berakhir: {formatTanggalIndo(c.tanggalBerakhir)}</span>
                        {hasRevisiSPJ && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Ada Revisi SPJ
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Total Nilai PKS */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-semibold text-slate-900 text-sm">
                        {formatRupiah(c.nilaiPKS)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.terminList.length} Tahap Termin
                      </div>
                    </td>

                    {/* Sudah Dicairkan */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-semibold text-blue-900 text-sm">
                        {formatRupiah(dicairkan)}
                      </div>
                      <div className="text-[11px] text-blue-700 font-sans mt-0.5">
                        {pctCair.toFixed(1)}% Realisasi
                      </div>
                    </td>

                    {/* Sudah Dilaporkan */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className="font-semibold text-emerald-900 text-sm">
                        {formatRupiah(dilaporkan)}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-sans mt-0.5">
                        {pctSPJ.toFixed(1)}% dari Kas Cair
                      </div>
                    </td>

                    {/* Sisa Harus Dicairkan */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className={`font-semibold text-sm ${sisaCair > 0 ? 'text-amber-900' : 'text-slate-500'}`}>
                        {formatRupiah(sisaCair)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sisaCair === 0 ? 'Lunas 100%' : `${(100 - pctCair).toFixed(1)}% Tersisa`}
                      </div>
                    </td>

                    {/* Sisa Belum Dilaporkan (Outstanding SPJ) */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      <div className={`font-semibold text-sm ${sisaSPJ > 0 ? 'text-rose-900' : 'text-slate-500'}`}>
                        {formatRupiah(sisaSPJ)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sisaSPJ === 0 ? 'SPJ Lengkap' : 'Dipegang Mitra'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectContract(c)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Lihat Detail & Dokumen PKS"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onEditContract && (
                          <button
                            onClick={() => onEditContract(c)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Data PKS"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onOpenDisbursement(c)}
                          disabled={sisaCair <= 0}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          title="Input Pencairan Kas Baru"
                        >
                          + Cairkan
                        </button>

                        <button
                          onClick={() => onOpenSPJ(c)}
                          disabled={dicairkan <= 0}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer whitespace-nowrap"
                          title="Input / Verifikasi Laporan SPJ"
                        >
                          + SPJ
                        </button>

                        <button
                          onClick={() => onDeleteContract(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Data PKS"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
