import React from 'react';
import { 
  CABANG_RSB_DAERAH_LIST, 
  CABANG_RSB_SELINDO_LIST, 
  CABANG_RSB_LIST, 
  CabangRSB, 
  JenisKelolaanRSB,
  PKSContract 
} from '../types/finance';
import { Building2, MapPin, X, ShieldCheck, Landmark } from 'lucide-react';

interface RSBBranchFilterProps {
  selectedBranch: CabangRSB | 'all';
  onSelectBranch: (branch: CabangRSB | 'all') => void;
  selectedKelolaan: JenisKelolaanRSB;
  onSelectKelolaan: (kelolaan: JenisKelolaanRSB) => void;
  contracts: PKSContract[];
}

export const RSBBranchFilter: React.FC<RSBBranchFilterProps> = ({
  selectedBranch,
  onSelectBranch,
  selectedKelolaan,
  onSelectKelolaan,
  contracts,
}) => {
  // Count PKS per branch
  const branchCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of CABANG_RSB_LIST) {
      counts[b] = 0;
    }
    for (const c of contracts) {
      if (c.cabangRSB && counts[c.cabangRSB] !== undefined) {
        counts[c.cabangRSB]++;
      }
    }
    return counts;
  }, [contracts]);

  // Counts by kelolaan
  const countsByKelolaan = React.useMemo(() => {
    let daerah = 0;
    let selindo = 0;
    for (const c of contracts) {
      if (c.jenisKelolaan === 'selindo') {
        selindo++;
      } else {
        daerah++;
      }
    }
    return {
      semua: contracts.length,
      daerah,
      selindo,
    };
  }, [contracts]);

  const displayedBranches = React.useMemo(() => {
    if (selectedKelolaan === 'daerah') return CABANG_RSB_DAERAH_LIST;
    if (selectedKelolaan === 'selindo') return CABANG_RSB_SELINDO_LIST;
    return CABANG_RSB_LIST;
  }, [selectedKelolaan]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Segmented Controls: Switch between Kelolaan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                Pilih Kategori & Cabang Rumah Sehat BAZNAS
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Filter monitoring piutang dan realisasi penyaluran dana berdasarkan jenis kelolaan klinik.
            </p>
          </div>
        </div>

        {/* Tab Kelolaan */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto text-xs font-medium">
          <button
            onClick={() => {
              onSelectKelolaan('semua');
              onSelectBranch('all');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedKelolaan === 'semua'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Semua RSB</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-mono">
              {countsByKelolaan.semua}
            </span>
          </button>

          <button
            onClick={() => {
              onSelectKelolaan('daerah');
              onSelectBranch('all');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedKelolaan === 'daerah'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>RSB Daerah</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              selectedKelolaan === 'daerah' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {countsByKelolaan.daerah}
            </span>
          </button>

          <button
            onClick={() => {
              onSelectKelolaan('selindo');
              onSelectBranch('all');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedKelolaan === 'selindo'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>RSB Selindo (kelolaan BAZNAS RI)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              selectedKelolaan === 'selindo' ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
            }`}>
              {countsByKelolaan.selindo}
            </span>
          </button>
        </div>
      </div>

      {/* Description Banner for Selected Category */}
      <div className={`p-3 rounded-lg text-xs flex items-center justify-between gap-3 ${
        selectedKelolaan === 'selindo'
          ? 'bg-blue-50/70 border border-blue-200 text-blue-900'
          : selectedKelolaan === 'daerah'
          ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-900'
          : 'bg-slate-50 border border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          {selectedKelolaan === 'selindo' ? (
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          ) : selectedKelolaan === 'daerah' ? (
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {selectedKelolaan === 'selindo' && 'Fitur Aktif: RSB Selindo (kelolaan BAZNAS RI)'}
              {selectedKelolaan === 'daerah' && 'Fitur Aktif: RSB Daerah (12 Cabang Mitra BAZNAS Daerah)'}
              {selectedKelolaan === 'semua' && 'Menampilkan Seluruh RSB Daerah & RSB Selindo (kelolaan BAZNAS RI)'}
            </span>
            <span className="text-slate-600 ml-1.5 hidden md:inline">
              {selectedKelolaan === 'selindo' && 'Unit Pelaksana Teknis & Program Kesehatan Strategis dikelola langsung oleh BAZNAS RI Pusat.'}
              {selectedKelolaan === 'daerah' && 'Kemitraan bersama BAZNAS Provinsi/Kabupaten/Kota untuk layanan kesehatan dhuafa & mustahik.'}
              {selectedKelolaan === 'semua' && 'Data konsolidasi total 20 cabang klinik Rumah Sehat BAZNAS di seluruh Indonesia.'}
            </span>
          </div>
        </div>

        {selectedBranch !== 'all' && (
          <button
            onClick={() => onSelectBranch('all')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Cabang</span>
          </button>
        )}
      </div>

      {/* Interactive Branch Filter Chips */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>
            {selectedKelolaan === 'selindo'
              ? 'Daftar Cabang RSB Selindo (kelolaan BAZNAS RI):'
              : selectedKelolaan === 'daerah'
              ? 'Daftar 12 Cabang RSB Daerah:'
              : 'Daftar Seluruh Cabang Klinik RSB:'}
          </span>
          <span className="text-slate-400 font-normal">
            {selectedBranch === 'all' ? 'Menampilkan semua cabang terpilih' : `Cabang aktif: RSB ${selectedBranch}`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Semua Cabang chip */}
          <button
            onClick={() => onSelectBranch('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedBranch === 'all'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>Semua Cabang</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedBranch === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {displayedBranches.length}
            </span>
          </button>

          {/* Individual RSB Branch Chips */}
          {displayedBranches.map((branch) => {
            const isSelected = selectedBranch === branch;
            const count = branchCounts[branch] || 0;
            const isBranchSelindo = (CABANG_RSB_SELINDO_LIST as readonly string[]).includes(branch);

            return (
              <button
                key={branch}
                onClick={() => onSelectBranch(branch)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? isBranchSelindo
                      ? 'bg-blue-700 text-white shadow-xs font-semibold'
                      : 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : isBranchSelindo ? 'text-blue-500' : 'text-slate-400'}`} />
                <span>RSB {branch}</span>
                {isBranchSelindo && (
                  <span className={`text-[9px] px-1 rounded-sm uppercase tracking-wider font-semibold ${
                    isSelected ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                  }`}>
                    RI
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                    isSelected 
                      ? 'bg-black/20 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
