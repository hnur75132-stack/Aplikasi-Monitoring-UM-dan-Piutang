import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  PlusCircle, 
  Printer, 
  Download, 
  Database,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Activity,
  ChevronRight
} from 'lucide-react';

interface TopBarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenNewPKS: () => void;
  onOpenSyncModal: () => void;
  onRefreshData: () => void;
  onPrintReport: () => void;
  onExportCSV: () => void;
  isRealTimeActive: boolean;
  setIsRealTimeActive: (val: boolean) => void;
  lastUpdated: Date;
  isRefreshing: boolean;
  onToggleMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  setActiveSection,
  onOpenNewPKS,
  onOpenSyncModal,
  onRefreshData,
  onPrintReport,
  onExportCSV,
  isRealTimeActive,
  setIsRealTimeActive,
  lastUpdated,
  isRefreshing,
  onToggleMobileMenu,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const getSectionInfo = (id: string) => {
    switch (id) {
      case 'matriks':
        return { label: 'Matriks Penyaluran & Pencairan (Tahap 1 - 6)', icon: FileSpreadsheet };
      case 'tabel-pks':
        return { label: 'Daftar PKS & Monitoring Piutang', icon: FileText };
      case 'dashboard':
      default:
        return { label: 'Ringkasan Eksekutif & KPI Penyaluran', icon: LayoutDashboard };
    }
  };

  const currentSection = getSectionInfo(activeSection);
  const SectionIcon = currentSection.icon;

  const handleToggle = onToggleSidebar || onToggleMobileMenu;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left: Sidebar toggle + Section Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {handleToggle && (
              <button
                onClick={handleToggle}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label={isSidebarCollapsed ? "Perluas Menu Samping" : "Ciutkan Menu Samping"}
                title={isSidebarCollapsed ? "Perluas Menu Samping" : "Ciutkan Menu Samping"}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-semibold text-slate-700 hidden sm:inline">
                Monitoring Piutang
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <div className="flex items-center gap-2 font-bold text-slate-900 truncate">
                <SectionIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{currentSection.label}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenSyncModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              title="Pusat Sinkronisasi Monitoring Data Piutang Penyaluran Divisi Kesehatan"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sinkronisasi Data</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <button
              onClick={onOpenNewPKS}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ PKS</span>
            </button>

            <button
              onClick={onPrintReport}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar for real-time status */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-600">
        <div className="w-full flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isRealTimeActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              <span className="font-semibold text-slate-800">
                {isRealTimeActive ? 'Real-Time Sync Aktif' : 'Real-Time Sync Dijeda'}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              Terakhir diperbarui: <span className="font-mono tabular-nums text-slate-800 font-medium">{lastUpdated.toLocaleTimeString('id-ID')}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 cursor-pointer"
            >
              {isRealTimeActive ? 'Jeda Sinkron' : 'Aktifkan'}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
              title="Ekspor CSV"
            >
              <Download className="w-3 h-3" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
