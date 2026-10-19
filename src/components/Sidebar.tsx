import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  FileText, 
  Activity, 
  Database, 
  PlusCircle, 
  Printer, 
  Download, 
  RefreshCw, 
  RotateCcw,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { CabangRSB, JenisKelolaanRSB } from '../types/finance';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenNewPKS: () => void;
  onOpenAddRSB: () => void;
  onOpenSyncModal: () => void;
  onRefreshData: () => void;
  onPrintReport: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  isRealTimeActive: boolean;
  setIsRealTimeActive: (val: boolean) => void;
  lastUpdated: Date;
  isRefreshing: boolean;
  matrixCount: number;
  contractsCount: number;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  selectedBranch?: CabangRSB | 'all';
  onSelectBranch?: (branch: CabangRSB | 'all') => void;
  selectedKelolaan?: JenisKelolaanRSB;
  onSelectKelolaan?: (kelolaan: JenisKelolaanRSB) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  onOpenNewPKS,
  onOpenAddRSB,
  onOpenSyncModal,
  onRefreshData,
  onPrintReport,
  onExportCSV,
  onResetData,
  isRealTimeActive,
  setIsRealTimeActive,
  lastUpdated,
  isRefreshing,
  matrixCount,
  contractsCount,
  isCollapsed = false,
  setIsCollapsed,
  selectedKelolaan = 'semua',
  onSelectKelolaan,
  onSelectBranch,
}) => {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Ringkasan Eksekutif', 
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'matriks', 
      label: 'Matriks Tahap 1 - 6', 
      icon: FileSpreadsheet,
      badge: `${matrixCount} RSB`
    },
    { 
      id: 'tabel-pks', 
      label: 'Daftar PKS & Piutang', 
      icon: FileText,
      badge: `${contractsCount} PKS`
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside 
      className={`sticky top-0 h-screen shrink-0 z-30 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-300 select-none shadow-xl print:hidden ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
      aria-label="Menu Samping Kiri Monitoring Piutang"
    >
      {/* 1. BRAND HEADER (CSS selector 1: aside > div:nth-of-type(1)) */}
      <div className="p-4 border-b border-slate-800/90 flex items-center justify-between gap-2.5 bg-slate-950/40">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-950/60 shrink-0 cursor-pointer hover:scale-105 transition-transform"
            title={isCollapsed ? 'Perluas Menu Samping Kiri' : 'Rumah Sehat BAZNAS'}
          >
            <span className="text-base tracking-tighter font-black">RSB</span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-800/60">
                  BAZNAS RI
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Kesehatan
                </span>
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
                Monitoring Piutang
              </h1>
              <p className="text-[10px] text-slate-400 truncate">
                Penyaluran Divisi Kesehatan
              </p>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button on the Left Sidebar Header */}
        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Perluas Menu Samping Kiri' : 'Ciutkan Menu Samping'}
            aria-label={isCollapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* 2. ACTION BUTTONS BOX (CSS selector 2: aside > div:nth-of-type(2)) */}
      <div className="p-3 space-y-2 border-b border-slate-800/70 bg-slate-950/30">
        <button
          onClick={onOpenSyncModal}
          className={`w-full flex items-center text-xs font-semibold text-blue-300 bg-blue-950/70 border border-blue-700/60 rounded-xl hover:bg-blue-900/70 transition-all shadow-xs group cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2 text-left'
          }`}
          title="Pusat Sinkronisasi Data Monitoring Piutang Penyaluran Divisi Kesehatan"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
            {!isCollapsed && <span className="truncate">Sinkronisasi Data</span>}
          </div>
          {!isCollapsed && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {isCollapsed ? (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onOpenNewPKS}
              className="w-full flex items-center justify-center p-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tambah Kontrak PKS Baru"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onOpenAddRSB}
              className="w-full flex items-center justify-center p-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Tambah Cabang RSB ke Matriks"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenNewPKS}
              className="flex items-center justify-start gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer text-left truncate shadow-2xs"
              title="Tambah Kontrak PKS Baru"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">+ PKS</span>
            </button>

            <button
              onClick={onOpenAddRSB}
              className="flex items-center justify-start gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer text-left truncate shadow-2xs"
              title="Tambah Cabang RSB ke Matriks Monitoring"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">+ RSB</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. NAVIGATION MENU & FILTERS (CSS selector 3: aside > div:nth-of-type(3)) */}
      <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4 text-left custom-scrollbar">
        {/* Navigation Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left">
              Menu Monitoring
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCollapsed 
                    ? 'justify-center p-2.5' 
                    : 'justify-between px-3 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold border-l-4 border-blue-300'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : item.badge === 'Live'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Kelolaan Filter (Inside left menu for quick access) */}
        {!isCollapsed && onSelectKelolaan && onSelectBranch && (
          <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-left">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter Kelolaan</span>
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button
                onClick={() => {
                  onSelectKelolaan('semua');
                  onSelectBranch('all');
                }}
                className={`px-2 py-1.5 text-[10px] rounded-lg font-semibold transition-colors cursor-pointer text-center ${
                  selectedKelolaan === 'semua'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 bg-slate-800/60 hover:text-white hover:bg-slate-800'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  onSelectKelolaan('daerah');
                  onSelectBranch('all');
                }}
                className={`px-2 py-1.5 text-[10px] rounded-lg font-semibold transition-colors cursor-pointer text-center ${
                  selectedKelolaan === 'daerah'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-slate-400 bg-slate-800/60 hover:text-white hover:bg-slate-800'
                }`}
              >
                Daerah
              </button>
              <button
                onClick={() => {
                  onSelectKelolaan('selindo');
                  onSelectBranch('all');
                }}
                className={`px-2 py-1.5 text-[10px] rounded-lg font-semibold transition-colors cursor-pointer text-center ${
                  selectedKelolaan === 'selindo'
                    ? 'bg-blue-700 text-white font-bold'
                    : 'text-slate-400 bg-slate-800/60 hover:text-white hover:bg-slate-800'
                }`}
              >
                Pusat
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Navigation Section */}
        <div className="pt-2 border-t border-slate-800/60 space-y-1 text-left">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Laporan & Alat
            </div>
          )}

          <button
            onClick={onPrintReport}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-start gap-3 px-3 py-2 text-left'
            }`}
            title="Cetak Rekapitulasi Monitoring"
          >
            <Printer className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Cetak Rekapitulasi</span>}
          </button>

          <button
            onClick={onExportCSV}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-start gap-3 px-3 py-2 text-left'
            }`}
            title="Ekspor Data CSV"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Ekspor Data CSV</span>}
          </button>

          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50 ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-start gap-3 px-3 py-2 text-left'
            }`}
            title="Segarkan Tampilan Data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            {!isCollapsed && <span>Segarkan Tampilan</span>}
          </button>
        </div>
      </div>

      {/* 4. BOTTOM REAL-TIME STATUS & CONTROLS (CSS selector 4: aside > div:nth-of-type(4)) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2 text-left">
        {!isCollapsed ? (
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-1.5 text-left">
            <div className="flex items-center justify-between gap-1">
              <span className="text-slate-400 font-medium">Status Real-Time:</span>
              <button
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
                className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  isRealTimeActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/80'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isRealTimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isRealTimeActive ? 'Aktif' : 'Dijeda'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Terakhir Sinkron:</span>
              <span className="font-mono text-slate-300">{lastUpdated.toLocaleTimeString('id-ID')}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer text-slate-300"
              title={isRealTimeActive ? 'Real-Time Aktif' : 'Real-Time Dijeda'}
            >
              <span className={`block w-2.5 h-2.5 rounded-full ${isRealTimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>
          </div>
        )}

        <button
          onClick={onResetData}
          className={`w-full flex items-center rounded-lg text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 py-1.5 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-1' : 'justify-start gap-2 px-2 text-left'
          }`}
          title="Reset ke data awal"
        >
          <RotateCcw className="w-3 h-3 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Kembalikan Data Awal</span>}
        </button>
      </div>
    </aside>
  );
};
