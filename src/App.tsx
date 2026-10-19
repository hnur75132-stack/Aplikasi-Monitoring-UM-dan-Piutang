/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PKSContract, 
  MonthlyTrendData, 
  RealTimeEvent, 
  PencairanRecord, 
  LaporanSPJ,
  CabangRSB,
  JenisKelolaanRSB,
  RSBMatrixRow
} from './types/finance';
import { 
  INITIAL_PKS_CONTRACTS, 
  INITIAL_MONTHLY_TRENDS, 
  INITIAL_REALTIME_EVENTS 
} from './data/initialData';
import { 
  calculateFinancialKPIs, 
  exportContractsToCSV, 
  formatRupiah 
} from './utils/formatters';
import { 
  STORAGE_KEY_MATRIX, 
  STORAGE_KEY_AUTOSYNC, 
  SYNC_CHANNEL_NAME, 
  broadcastDataUpdate, 
  matrixRowsToContracts 
} from './utils/syncEngine';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { KPICards } from './components/KPICards';
import { PKSDataTable } from './components/PKSDataTable';
import { RSBBranchFilter } from './components/RSBBranchFilter';
import { RSBMatrixTable } from './components/RSBMatrixTable';
import { RSB_SPREADSHEET_DATA } from './data/rsbSpreadsheetData';
import { NewPKSModal } from './components/Modals/NewPKSModal';
import { NewDisbursementModal } from './components/Modals/NewDisbursementModal';
import { NewSPJModal } from './components/Modals/NewSPJModal';
import { PKSDetailModal } from './components/Modals/PKSDetailModal';
import { DataSyncModal } from './components/Modals/DataSyncModal';
import { EditRSBMatrixModal } from './components/Modals/EditRSBMatrixModal';
import { EditPKSModal } from './components/Modals/EditPKSModal';
import { ConfirmDeleteModal } from './components/Modals/ConfirmDeleteModal';
import { PrintReportView } from './components/PrintReportView';
import { 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  FileSpreadsheet, 
  Layers,
  ArrowRight,
  Database,
  RefreshCw
} from 'lucide-react';

const STORAGE_KEY_PKS = 'sim_pks_contracts_v5_rsb_selindo';
const STORAGE_KEY_TRENDS = 'sim_pks_trends_v5_rsb_selindo';
const STORAGE_KEY_EVENTS = 'sim_pks_events_v5_rsb_selindo';

export default function App() {
  // Synchronized Matrix Data (Master spreadsheet data for all RSB branches)
  const [matrixData, setMatrixData] = useState<RSBMatrixRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATRIX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].rsb) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved matrix', e);
    }
    return RSB_SPREADSHEET_DATA;
  });

  // Load contracts state from localStorage or derived from initial data
  const [contracts, setContracts] = useState<PKSContract[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].cabangRSB) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved contracts', e);
    }
    return INITIAL_PKS_CONTRACTS;
  });

  const [selectedKelolaan, setSelectedKelolaan] = useState<JenisKelolaanRSB>('semua');
  const [selectedBranch, setSelectedBranch] = useState<CabangRSB | 'all'>('all');

  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRENDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved trends', e);
    }
    return INITIAL_MONTHLY_TRENDS;
  });

  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved events', e);
    }
    return INITIAL_REALTIME_EVENTS;
  });

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isRealTimeActive, setIsRealTimeActive] = useState<boolean>(true);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTOSYNC);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Left Sidebar state (docked on the left)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isNewPKSOpen, setIsNewPKSOpen] = useState(false);
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);
  const [isSPJOpen, setIsSPJOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDataSyncOpen, setIsDataSyncOpen] = useState(false);
  const [activeContract, setActiveContract] = useState<PKSContract | null>(null);

  // Edit / Add / Delete states for Monitoring Menu
  const [editingRSBRow, setEditingRSBRow] = useState<RSBMatrixRow | null>(null);
  const [isAddRSBModalOpen, setIsAddRSBModalOpen] = useState(false);
  const [editingPKSContract, setEditingPKSContract] = useState<PKSContract | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details: { label: string; value: string }[];
    onConfirm: () => void;
  } | null>(null);

  // Synchronize localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(matrixData));
    } catch (e) {
      console.error('Failed to save matrixData', e);
    }
  }, [matrixData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PKS, JSON.stringify(contracts));
    } catch (e) {
      console.error('Failed to save contracts', e);
    }
  }, [contracts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRENDS, JSON.stringify(monthlyTrends));
    } catch (e) {
      console.error('Failed to save trends', e);
    }
  }, [monthlyTrends]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(realTimeEvents));
    } catch (e) {
      console.error('Failed to save events', e);
    }
  }, [realTimeEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTOSYNC, JSON.stringify(isAutoSyncEnabled));
    } catch (e) {
      console.error('Failed to save isAutoSyncEnabled', e);
    }
  }, [isAutoSyncEnabled]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Multi-tab automatic synchronization listener
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_MATRIX && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMatrixData(parsed);
            setContracts(matrixRowsToContracts(parsed));
            setLastUpdated(new Date());
            showToast('Pembaruan Otomatis: Data disinkronkan dengan pembaruan terbaru.');
          }
        } catch (err) {
          console.error('Failed to parse storage update', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (msg) => {
          if (msg.data && msg.data.type === 'DATA_SYNCED') {
            const savedMatrix = localStorage.getItem(STORAGE_KEY_MATRIX);
            if (savedMatrix) {
              try {
                const parsed = JSON.parse(savedMatrix);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setMatrixData(parsed);
                  setContracts(matrixRowsToContracts(parsed));
                  setLastUpdated(new Date());
                  showToast('Pembaruan Otomatis: Sinkronisasi data real-time berhasil diterima.');
                }
              } catch (e) {
                console.error('Failed to read broadcast matrix', e);
              }
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported', err);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, [isAutoSyncEnabled, showToast]);

  // Simulated background real-time updates
  useEffect(() => {
    if (!isRealTimeActive) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isRealTimeActive]);

  // Filter contracts based on active branch selection and kelolaan
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesBranch = selectedBranch === 'all' || c.cabangRSB === selectedBranch;
      const matchesKelolaan =
        selectedKelolaan === 'semua' || c.jenisKelolaan === selectedKelolaan;
      return matchesBranch && matchesKelolaan;
    });
  }, [contracts, selectedBranch, selectedKelolaan]);

  // Dynamic Financial KPI calculation
  const kpi = useMemo(() => {
    return calculateFinancialKPIs(filteredContracts);
  }, [filteredContracts]);

  // Refresh data handler
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      showToast('Data berhasil disegarkan dan disinkronkan!');
    }, 450);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    setMatrixData(RSB_SPREADSHEET_DATA);
    setContracts(INITIAL_PKS_CONTRACTS);
    setMonthlyTrends(INITIAL_MONTHLY_TRENDS);
    setRealTimeEvents(INITIAL_REALTIME_EVENTS);
    setLastUpdated(new Date());
    localStorage.removeItem(STORAGE_KEY_MATRIX);
    localStorage.removeItem(STORAGE_KEY_PKS);
    localStorage.removeItem(STORAGE_KEY_TRENDS);
    localStorage.removeItem(STORAGE_KEY_EVENTS);

    broadcastDataUpdate({
      type: 'DATA_SYNCED',
      timestamp: Date.now(),
      summary: 'Data sistem dikembalikan ke dataset standar Divisi Kesehatan.',
    });

    showToast('Data berhasil dikembalikan ke standar awal Divisi Kesehatan.');
  };

  // Simulation of incoming activity event
  const simulateIncomingEvent = () => {
    const randomContract = contracts[Math.floor(Math.random() * contracts.length)];
    const nominal = Math.floor(Math.random() * 50 + 20) * 10000000;
    const isPencairan = Math.random() > 0.5;

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: isPencairan ? 'pencairan' : 'spj_diverifikasi',
      judul: isPencairan ? 'Realisasi Pencairan Termin Baru' : 'Verifikasi SPJ Diterima',
      deskripsi: isPencairan
        ? `Pencairan dana sebesar ${formatRupiah(nominal)} untuk ${randomContract?.mitraNama || 'RSB'}.`
        : `Laporan pertanggungjawaban fisik 100% senilai ${formatRupiah(nominal)} telah diverifikasi.`,
      nilaiRupiah: nominal,
      nomorPKS: randomContract?.nomorPKS || 'PKS/RSB/2026/01',
      mitraNama: randomContract?.mitraNama || 'Mitra Divisi Kesehatan',
    };

    setRealTimeEvents((prev) => [newEvt, ...prev]);
    setLastUpdated(new Date());
    showToast('Aktivitas real-time baru berhasil disinkronkan!');
  };

  // Apply full sync from file or text
  const handleApplySync = (newRows: RSBMatrixRow[], sourceDescription: string) => {
    setMatrixData(newRows);
    const convertedContracts = matrixRowsToContracts(newRows);
    setContracts(convertedContracts);

    const totalPks = newRows.reduce((a, b) => a + b.totalDanaPKS, 0);
    const totalCair = newRows.reduce((a, b) => a + b.totalDanaPencairan, 0);

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pks_baru',
      judul: 'Sinkronisasi Data Otomatis Divisi Kesehatan',
      deskripsi: `${sourceDescription}: ${newRows.length} cabang RSB otomatis diperbarui. Total PKS: ${formatRupiah(totalPks)}, Pencairan: ${formatRupiah(totalCair)}.`,
      nilaiRupiah: totalCair,
      nomorPKS: 'SYNC-DIVISI-KESEHATAN',
      mitraNama: 'Divisi Kesehatan BAZNAS',
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    setLastUpdated(new Date());

    broadcastDataUpdate({
      type: 'DATA_SYNCED',
      timestamp: Date.now(),
      summary: `Sinkronisasi otomatis berhasil diterapkan (${newRows.length} Cabang RSB).`,
    });

    showToast(`Sinkronisasi berhasil! ${newRows.length} cabang RSB otomatis diperbarui.`);
  };

  // Simulate an incoming transaction from Divisi Kesehatan
  const handleSimulateIncomingUpdate = () => {
    const eligibleRows = matrixData.filter((r) => r.sisa > 0);
    if (eligibleRows.length === 0) {
      showToast('Seluruh cabang RSB telah mencapai realisasi 100%.');
      return;
    }

    const targetRow = eligibleRows[Math.floor(Math.random() * eligibleRows.length)];
    const nominalCair = Math.min(targetRow.sisa, 60000000);

    let nextTahap = 1;
    if (targetRow.tahap1) nextTahap = 2;
    if (targetRow.tahap2) nextTahap = 3;
    if (targetRow.tahap3) nextTahap = 4;
    if (targetRow.tahap4) nextTahap = 5;
    if (targetRow.tahap5) nextTahap = 6;

    const updatedRows = matrixData.map((r) => {
      if (r.rsb !== targetRow.rsb) return r;
      const copy = { ...r };
      const tahapKey = `tahap${nextTahap}` as keyof RSBMatrixRow;
      (copy as any)[tahapKey] = { nominal: nominalCair, status: 'green' as const };
      
      const t1 = copy.tahap1?.nominal || 0;
      const t2 = copy.tahap2?.nominal || 0;
      const t3 = copy.tahap3?.nominal || 0;
      const t4 = copy.tahap4?.nominal || 0;
      const t5 = copy.tahap5?.nominal || 0;
      const t6 = copy.tahap6?.nominal || 0;
      copy.jumlah = t1 + t2 + t3 + t4 + t5 + t6;
      copy.totalDanaPencairan = copy.jumlah;
      copy.sisa = copy.totalDanaPKS - copy.jumlah;
      copy.persentase = copy.totalDanaPKS > 0 ? (copy.jumlah / copy.totalDanaPKS) * 100 : 0;
      return copy;
    });

    setMatrixData(updatedRows);
    setContracts(matrixRowsToContracts(updatedRows));

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pencairan',
      judul: `Pencairan Otomatis Tahap ${nextTahap} RSB ${targetRow.rsb}`,
      deskripsi: `Penyaluran kas senilai ${formatRupiah(nominalCair)} otomatis disinkronkan ke sistem.`,
      nilaiRupiah: nominalCair,
      nomorPKS: `PKS/RSB-${targetRow.rsb.slice(0, 3).toUpperCase()}/2026/0${nextTahap}`,
      mitraNama: `RSB Cabang ${targetRow.rsb}`,
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    setLastUpdated(new Date());

    broadcastDataUpdate({
      type: 'DATA_SYNCED',
      timestamp: Date.now(),
      summary: `Pembaruan Otomatis: Pencairan Tahap ${nextTahap} RSB ${targetRow.rsb} sebesar ${formatRupiah(nominalCair)}.`,
    });

    showToast(`Pembaruan Otomatis: Pencairan Tahap ${nextTahap} RSB ${targetRow.rsb} sebesar ${formatRupiah(nominalCair)} berhasil disinkronkan.`);
  };

  // Handlers for CRUD with bidirectional sync to matrixData
  const handleCreatePKS = (newContract: PKSContract) => {
    setContracts((prev) => [newContract, ...prev]);

    setMatrixData((prev) => {
      const existingIdx = prev.findIndex((r) => r.rsb === newContract.cabangRSB);
      const isSelindo = newContract.jenisKelolaan === 'selindo';
      const initialCair = newContract.pencairanList.reduce((a, b) => a + b.jumlahCair, 0);

      const newRow: RSBMatrixRow = {
        no: existingIdx >= 0 ? prev[existingIdx].no : prev.length + 1,
        rsb: newContract.cabangRSB,
        jenisKelolaan: isSelindo ? 'selindo' : 'daerah',
        totalDanaPKS: newContract.nilaiPKS,
        totalDanaPencairan: initialCair,
        tahap1: initialCair > 0 ? { nominal: initialCair, status: 'green' } : undefined,
        jumlah: initialCair,
        sisa: newContract.nilaiPKS - initialCair,
        persentase: newContract.nilaiPKS > 0 ? (initialCair / newContract.nilaiPKS) * 100 : 0,
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newRow };
        return copy;
      }
      return [...prev, newRow];
    });

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pks_baru',
      judul: 'Pendaftaran PKS Baru',
      deskripsi: `Kontrak ${newContract.nomorPKS} resmi didaftarkan dan disinkronkan ke matriks.`,
      nilaiRupiah: newContract.nilaiPKS,
      nomorPKS: newContract.nomorPKS,
      mitraNama: newContract.mitraNama,
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    showToast(`PKS ${newContract.nomorPKS} berhasil ditambahkan dan matriks diperbarui!`);
  };

  // EDIT RSB Matrix Row Handler
  const handleSaveRSBRow = (updatedRow: RSBMatrixRow) => {
    setMatrixData((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.rsb === updatedRow.rsb || (editingRSBRow && r.rsb === editingRSBRow.rsb)
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...updatedRow, no: copy[existingIdx].no };
        return copy;
      }
      return [...prev, { ...updatedRow, no: prev.length + 1 }];
    });

    // Also update any corresponding contract
    setContracts((prev) =>
      prev.map((c) => {
        if (c.cabangRSB === updatedRow.rsb || (editingRSBRow && c.cabangRSB === editingRSBRow.rsb)) {
          return {
            ...c,
            cabangRSB: updatedRow.rsb,
            jenisKelolaan: updatedRow.jenisKelolaan,
            nilaiPKS: updatedRow.totalDanaPKS,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pks_baru',
      judul: `Pembaruan Data Matriks RSB ${updatedRow.rsb}`,
      deskripsi: `Data monitoring RSB ${updatedRow.rsb} berhasil diperbarui. Total PKS: ${formatRupiah(updatedRow.totalDanaPKS)}, Realisasi: ${formatRupiah(updatedRow.totalDanaPencairan)}.`,
      nilaiRupiah: updatedRow.totalDanaPKS,
      nomorPKS: `RSB-${updatedRow.rsb}`,
      mitraNama: `RSB Cabang ${updatedRow.rsb}`,
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    setLastUpdated(new Date());

    broadcastDataUpdate({
      type: 'DATA_SYNCED',
      timestamp: Date.now(),
      summary: `Data monitoring RSB ${updatedRow.rsb} berhasil diubah & disinkronkan.`,
    });

    showToast(`Data monitoring Cabang RSB ${updatedRow.rsb} berhasil diperbarui.`);
  };

  // ADD NEW RSB Matrix Row Handler
  const handleAddNewRSBRow = (newRow: RSBMatrixRow) => {
    setMatrixData((prev) => {
      const newNo = prev.length + 1;
      return [...prev, { ...newRow, no: newNo }];
    });

    // Automatically create a base PKS Contract to keep full parity
    const newContract: PKSContract = {
      id: `pks-${Date.now()}`,
      nomorPKS: `PKS/RSB-${newRow.rsb.replace(/\s+/g, '-').toUpperCase()}/2026/01`,
      cabangRSB: newRow.rsb,
      jenisKelolaan: newRow.jenisKelolaan,
      judulKerjasama: `Operasional Layanan Kesehatan Rumah Sehat BAZNAS Cabang ${newRow.rsb}`,
      mitraNama: `Rumah Sehat BAZNAS ${newRow.rsb}`,
      kategoriMitra: newRow.jenisKelolaan === 'selindo' ? 'BAZNAS RI (Pusat)' : 'BAZNAS Daerah',
      nilaiPKS: newRow.totalDanaPKS,
      tanggalMulai: new Date().toISOString().slice(0, 10),
      tanggalBerakhir: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      picMitra: `Kepala Cabang RSB ${newRow.rsb}`,
      kontakPic: '0812-3456-7890',
      emailMitra: `rsb.${newRow.rsb.toLowerCase().replace(/\s+/g, '')}@baznas.go.id`,
      keterangan: 'Data ditambahkan dari Matriks Monitoring Penyaluran Divisi Kesehatan.',
      terminList: [
        { terminKe: 1, namaTermin: 'Termin I', persentase: 30, nilaiTermin: Math.round(newRow.totalDanaPKS * 0.3), jadwalBulan: 'Bulan 1', status: newRow.tahap1 ? 'Dicairkan' : 'Belum Ditagih' },
        { terminKe: 2, namaTermin: 'Termin II', persentase: 30, nilaiTermin: Math.round(newRow.totalDanaPKS * 0.3), jadwalBulan: 'Bulan 4', status: newRow.tahap2 ? 'Dicairkan' : 'Belum Ditagih' },
        { terminKe: 3, namaTermin: 'Termin III', persentase: 40, nilaiTermin: Math.round(newRow.totalDanaPKS * 0.4), jadwalBulan: 'Bulan 8', status: newRow.tahap3 ? 'Dicairkan' : 'Belum Ditagih' },
      ],
      pencairanList: newRow.totalDanaPencairan > 0 ? [{
        id: `cair-${Date.now()}`,
        terminKe: 1,
        nomorSPP: `SPP/RSB-${newRow.rsb.slice(0, 3).toUpperCase()}/001`,
        jumlahCair: newRow.totalDanaPencairan,
        tanggalCair: new Date().toISOString().slice(0, 10),
        bankTujuan: 'Bank Syariah Indonesia (BSI)',
        nomorRekening: '7100-2026-9901',
      }] : [],
      laporanSPJList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContracts((prev) => [newContract, ...prev]);

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pks_baru',
      judul: `Cabang Baru Ditambahkan: RSB ${newRow.rsb}`,
      deskripsi: `Penambahan cabang RSB ${newRow.rsb} ke dalam sistem monitoring penyaluran piutang.`,
      nilaiRupiah: newRow.totalDanaPKS,
      nomorPKS: newContract.nomorPKS,
      mitraNama: newContract.mitraNama,
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    setLastUpdated(new Date());

    broadcastDataUpdate({
      type: 'DATA_SYNCED',
      timestamp: Date.now(),
      summary: `Cabang baru RSB ${newRow.rsb} berhasil didaftarkan.`,
    });

    showToast(`Cabang RSB ${newRow.rsb} berhasil ditambahkan ke matriks monitoring!`);
  };

  // DELETE RSB Matrix Row Handler
  const handleRequestDeleteRSB = (row: RSBMatrixRow) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Hapus Data Monitoring RSB ${row.rsb}?`,
      message: `Apakah Anda yakin ingin menghapus data cabang RSB ${row.rsb} dari menu monitoring piutang? Data pada matriks dan pencatatan kontrak terkait akan dihapus.`,
      details: [
        { label: 'Cabang RSB', value: `RSB ${row.rsb}` },
        { label: 'Kelolaan', value: row.jenisKelolaan === 'selindo' ? 'BAZNAS RI (Selindo)' : 'RSB Daerah' },
        { label: 'Total Dana PKS', value: formatRupiah(row.totalDanaPKS) },
        { label: 'Total Pencairan', value: formatRupiah(row.totalDanaPencairan) },
        { label: 'Persentase Realisasi', value: `${row.persentase.toFixed(2)}%` },
      ],
      onConfirm: () => {
        setMatrixData((prev) => prev.filter((r) => r.rsb !== row.rsb));
        setContracts((prev) => prev.filter((c) => c.cabangRSB !== row.rsb));

        const newEvt: RealTimeEvent = {
          id: `evt-${Date.now()}`,
          waktu: new Date().toISOString(),
          tipe: 'pks_baru',
          judul: `Penghapusan Data RSB ${row.rsb}`,
          deskripsi: `Data monitoring RSB ${row.rsb} telah dihapus dari sistem.`,
          nilaiRupiah: row.totalDanaPKS,
          nomorPKS: `DEL-RSB-${row.rsb}`,
          mitraNama: `RSB Cabang ${row.rsb}`,
        };
        setRealTimeEvents((prev) => [newEvt, ...prev]);
        setLastUpdated(new Date());

        broadcastDataUpdate({
          type: 'DATA_SYNCED',
          timestamp: Date.now(),
          summary: `Data cabang RSB ${row.rsb} telah dihapus dari sistem.`,
        });

        showToast(`Data monitoring RSB ${row.rsb} telah berhasil dihapus.`);
      },
    });
  };

  // EDIT PKS Contract Handler
  const handleSavePKSContract = (updatedContract: PKSContract) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
    );

    // Sync to matrixData
    setMatrixData((prev) =>
      prev.map((r) => {
        if (r.rsb === updatedContract.cabangRSB) {
          const newTotal = updatedContract.nilaiPKS;
          const sisa = newTotal - r.jumlah;
          const persentase = newTotal > 0 ? (r.jumlah / newTotal) * 100 : 0;
          return {
            ...r,
            totalDanaPKS: newTotal,
            sisa,
            persentase,
          };
        }
        return r;
      })
    );

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pks_baru',
      judul: `Pembaruan Data PKS ${updatedContract.nomorPKS}`,
      deskripsi: `Kontrak kerjasama dengan ${updatedContract.mitraNama} berhasil diperbarui.`,
      nilaiRupiah: updatedContract.nilaiPKS,
      nomorPKS: updatedContract.nomorPKS,
      mitraNama: updatedContract.mitraNama,
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    showToast(`Data PKS ${updatedContract.nomorPKS} berhasil diperbarui.`);
  };

  // DELETE PKS Contract Request Handler
  const handleRequestDeletePKS = (contract: PKSContract) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Hapus Data Kontrak PKS?`,
      message: `Apakah Anda yakin ingin menghapus data perjanjian kerjasama ${contract.nomorPKS}? Seluruh riwayat pencairan dan berkas SPJ terkait akan dihapus secara permanen.`,
      details: [
        { label: 'Nomor PKS', value: contract.nomorPKS },
        { label: 'Cabang RSB', value: `RSB ${contract.cabangRSB}` },
        { label: 'Nama Mitra', value: contract.mitraNama },
        { label: 'Nilai PKS', value: formatRupiah(contract.nilaiPKS) },
      ],
      onConfirm: () => {
        setContracts((prev) => prev.filter((c) => c.id !== contract.id));

        // Check if there are other contracts for this branch
        const remainingForBranch = contracts.filter(
          (c) => c.cabangRSB === contract.cabangRSB && c.id !== contract.id
        );
        if (remainingForBranch.length === 0) {
          setMatrixData((prev) => prev.filter((r) => r.rsb !== contract.cabangRSB));
        }

        const newEvt: RealTimeEvent = {
          id: `evt-${Date.now()}`,
          waktu: new Date().toISOString(),
          tipe: 'pks_baru',
          judul: `Penghapusan PKS ${contract.nomorPKS}`,
          deskripsi: `Kontrak PKS ${contract.nomorPKS} resmi dihapus dari sistem.`,
          nilaiRupiah: contract.nilaiPKS,
          nomorPKS: contract.nomorPKS,
          mitraNama: contract.mitraNama,
        };
        setRealTimeEvents((prev) => [newEvt, ...prev]);
        setLastUpdated(new Date());

        broadcastDataUpdate({
          type: 'DATA_SYNCED',
          timestamp: Date.now(),
          summary: `PKS ${contract.nomorPKS} telah dihapus.`,
        });

        showToast(`Data PKS ${contract.nomorPKS} berhasil dihapus.`);
      },
    });
  };

  const handleRecordDisbursement = (contractId: string, disbursement: PencairanRecord) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedPencairan = [...c.pencairanList, disbursement];
        const updatedTermin = c.terminList.map((t) => {
          if (t.terminKe === disbursement.terminKe) {
            return { ...t, status: 'Dicairkan' as const };
          }
          return t;
        });
        return {
          ...c,
          pencairanList: updatedPencairan,
          terminList: updatedTermin,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Automatically update matrixData
    const target = contracts.find((c) => c.id === contractId);
    if (target && target.cabangRSB) {
      setMatrixData((prev) =>
        prev.map((r) => {
          if (r.rsb !== target.cabangRSB) return r;
          const copy = { ...r };
          const tahapKey = `tahap${disbursement.terminKe}` as keyof RSBMatrixRow;
          (copy as any)[tahapKey] = {
            nominal: disbursement.jumlahCair,
            status: 'green' as const,
          };

          const t1 = copy.tahap1?.nominal || 0;
          const t2 = copy.tahap2?.nominal || 0;
          const t3 = copy.tahap3?.nominal || 0;
          const t4 = copy.tahap4?.nominal || 0;
          const t5 = copy.tahap5?.nominal || 0;
          const t6 = copy.tahap6?.nominal || 0;
          copy.jumlah = t1 + t2 + t3 + t4 + t5 + t6;
          copy.totalDanaPencairan = copy.jumlah;
          copy.sisa = copy.totalDanaPKS - copy.jumlah;
          copy.persentase = copy.totalDanaPKS > 0 ? (copy.jumlah / copy.totalDanaPKS) * 100 : 0;
          return copy;
        })
      );
    }

    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: 'pencairan',
      judul: `Pencairan Kas Termin ${disbursement.terminKe}`,
      deskripsi: `Realisasi pencairan dana senilai ${formatRupiah(disbursement.jumlahCair)} via SPP ${disbursement.nomorSPP}.`,
      nilaiRupiah: disbursement.jumlahCair,
      nomorPKS: target?.nomorPKS || '-',
      mitraNama: target?.mitraNama || '-',
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    showToast(`Pencairan dana ${formatRupiah(disbursement.jumlahCair)} berhasil dicatat & matriks diperbarui.`);
  };

  const handleRecordSPJ = (contractId: string, spj: LaporanSPJ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          laporanSPJList: [...c.laporanSPJList, spj],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const target = contracts.find((c) => c.id === contractId);
    const newEvt: RealTimeEvent = {
      id: `evt-${Date.now()}`,
      waktu: new Date().toISOString(),
      tipe: spj.statusVerifikasi === 'Terverifikasi' ? 'spj_diverifikasi' : 'spj_masuk',
      judul: `Laporan SPJ ${spj.statusVerifikasi}`,
      deskripsi: `Realisasi belanja ${formatRupiah(spj.nilaiRealisasi)} dengan capaian fisik ${spj.persentaseFisik}%.`,
      nilaiRupiah: spj.nilaiRealisasi,
      nomorPKS: target?.nomorPKS || '-',
      mitraNama: target?.mitraNama || '-',
    };
    setRealTimeEvents((prev) => [newEvt, ...prev]);
    showToast(`Laporan SPJ ${spj.nomorLaporan} berhasil disimpan (${spj.statusVerifikasi}).`);
  };

  // Open modals with preselected contract
  const openDisbursementModal = (contract: PKSContract) => {
    setActiveContract(contract);
    setIsDisbursementOpen(true);
  };

  const openSPJModal = (contract: PKSContract) => {
    setActiveContract(contract);
    setIsSPJOpen(true);
  };

  const openDetailModal = (contract: PKSContract) => {
    setActiveContract(contract);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans selection:bg-blue-600 selection:text-white">
      {/* Printable Report View (Visible only during window.print()) */}
      <PrintReportView contracts={filteredContracts} kpi={kpi} matrixData={matrixData} />

      {/* LEFT SIDEBAR NAVIGATION MENU (Permanently docked at 'posisi samping kiri') */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenNewPKS={() => setIsNewPKSOpen(true)}
        onOpenAddRSB={() => setIsAddRSBModalOpen(true)}
        onOpenSyncModal={() => setIsDataSyncOpen(true)}
        onRefreshData={handleRefreshData}
        onPrintReport={() => window.print()}
        onExportCSV={() => exportContractsToCSV(filteredContracts)}
        onResetData={handleResetData}
        isRealTimeActive={isRealTimeActive}
        setIsRealTimeActive={setIsRealTimeActive}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        matrixCount={matrixData.length}
        contractsCount={contracts.length}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        selectedBranch={selectedBranch}
        onSelectBranch={setSelectedBranch}
        selectedKelolaan={selectedKelolaan}
        onSelectKelolaan={setSelectedKelolaan}
      />

      {/* MAIN VIEWPORT CONTAINER (Adjacent flex-1 container to the Left Sidebar) */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 print:hidden overflow-x-hidden">
        {/* Top Header of Main Area */}
        <TopBar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onOpenNewPKS={() => setIsNewPKSOpen(true)}
          onOpenSyncModal={() => setIsDataSyncOpen(true)}
          onRefreshData={handleRefreshData}
          onPrintReport={() => window.print()}
          onExportCSV={() => exportContractsToCSV(filteredContracts)}
          isRealTimeActive={isRealTimeActive}
          setIsRealTimeActive={setIsRealTimeActive}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Content Sections */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
          {/* Executive Section Anchor */}
          <div id="dashboard" className="scroll-mt-24 space-y-8">
            {/* Dedicated RSB Branch & Kelolaan Filter Bar */}
            <RSBBranchFilter
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
              selectedKelolaan={selectedKelolaan}
              onSelectKelolaan={setSelectedKelolaan}
              contracts={contracts}
            />

            {/* The 4 Core Financial KPI Cards */}
            <KPICards kpi={kpi} />

            {/* Matriks Penyaluran & Pencairan Sesuai Spreadsheet Divisi Kesehatan */}
            <div id="matriks" className="scroll-mt-24">
              <RSBMatrixTable
                data={matrixData}
                selectedBranch={selectedBranch}
                onSelectBranch={setSelectedBranch}
                selectedKelolaan={selectedKelolaan}
                onSelectKelolaan={setSelectedKelolaan}
                onOpenSyncModal={() => setIsDataSyncOpen(true)}
                isAutoSyncEnabled={isAutoSyncEnabled}
                onEditRow={(row) => setEditingRSBRow(row)}
                onDeleteRow={handleRequestDeleteRSB}
                onAddNewRow={() => setIsAddRSBModalOpen(true)}
              />
            </div>

            {/* Detailed PKS & Piutang Data Table */}
            <div id="tabel-pks" className="scroll-mt-24">
              <PKSDataTable
                contracts={contracts}
                selectedBranch={selectedBranch}
                onSelectBranch={setSelectedBranch}
                onSelectContract={openDetailModal}
                onOpenDisbursement={openDisbursementModal}
                onOpenSPJ={openSPJModal}
                onDeleteContract={handleRequestDeletePKS}
                onOpenNewPKS={() => setIsNewPKSOpen(true)}
                onEditContract={(contract) => setEditingPKSContract(contract)}
              />
            </div>
          </div>
        </main>

        {/* System Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Monitoring Piutang Penyaluran — Divisi Kesehatan BAZNAS RI</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Auto-Sync Data: Aktif</span>
              <span>·</span>
              <span>Versi 5.3 (Divisi Kesehatan)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {/* 1. New PKS Contract Modal */}
      <NewPKSModal
        isOpen={isNewPKSOpen}
        onClose={() => setIsNewPKSOpen(false)}
        onSubmit={handleCreatePKS}
      />

      {/* 2. New Disbursement Modal */}
      <NewDisbursementModal
        isOpen={isDisbursementOpen}
        contract={activeContract}
        allContracts={contracts}
        onClose={() => {
          setIsDisbursementOpen(false);
          setActiveContract(null);
        }}
        onSubmit={handleRecordDisbursement}
      />

      {/* 3. New SPJ Modal */}
      <NewSPJModal
        isOpen={isSPJOpen}
        contract={activeContract}
        allContracts={contracts}
        onClose={() => {
          setIsSPJOpen(false);
          setActiveContract(null);
        }}
        onSubmit={handleRecordSPJ}
      />

      {/* 4. PKS Detail Modal */}
      <PKSDetailModal
        isOpen={isDetailOpen}
        contract={activeContract}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveContract(null);
        }}
        onOpenDisbursement={openDisbursementModal}
        onOpenSPJ={openSPJModal}
      />

      {/* 5. Auto Data Sync Center Modal */}
      <DataSyncModal
        isOpen={isDataSyncOpen}
        onClose={() => setIsDataSyncOpen(false)}
        matrixData={matrixData}
        onApplySync={handleApplySync}
        onSimulateIncomingUpdate={handleSimulateIncomingUpdate}
        onResetToDefault={handleResetData}
        isAutoSyncEnabled={isAutoSyncEnabled}
        setIsAutoSyncEnabled={setIsAutoSyncEnabled}
        lastSyncTime={lastUpdated}
      />

      {/* 6. Edit RSB Matrix Row Modal */}
      <EditRSBMatrixModal
        isOpen={!!editingRSBRow}
        onClose={() => setEditingRSBRow(null)}
        initialRow={editingRSBRow}
        mode="edit"
        onSave={handleSaveRSBRow}
      />

      {/* 7. Add New RSB Row Modal */}
      <EditRSBMatrixModal
        isOpen={isAddRSBModalOpen}
        onClose={() => setIsAddRSBModalOpen(false)}
        initialRow={null}
        mode="create"
        onSave={handleAddNewRSBRow}
      />

      {/* 8. Edit PKS Contract Modal */}
      <EditPKSModal
        isOpen={!!editingPKSContract}
        onClose={() => setEditingPKSContract(null)}
        contract={editingPKSContract}
        onSave={handleSavePKSContract}
      />

      {/* 9. Safe In-App Confirm Delete Modal */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={deleteConfirm.onConfirm}
          title={deleteConfirm.title}
          message={deleteConfirm.message}
          itemDetails={deleteConfirm.details}
          confirmText="Ya, Hapus Data"
        />
      )}
    </div>
  );
}
