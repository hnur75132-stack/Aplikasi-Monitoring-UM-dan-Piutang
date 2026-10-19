import React from 'react';
import { FinancialSummaryKPI } from '../types/finance';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters';
import { 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface KPICardsProps {
  kpi: FinancialSummaryKPI;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpi }) => {
  return (
    <section aria-labelledby="kpi-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <h2 id="kpi-heading" className="text-xl font-bold tracking-tight text-slate-900">
            Laporan Monitoring Piutang Penyaluran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data konsolidasi pemantauan dana penyaluran Perjanjian Kerjasama (PKS), realisasi pencairan kas, dan progres pertanggungjawaban SPJ.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Total <span className="font-semibold text-slate-800 tabular-nums">{kpi.totalPKSCount}</span> PKS Terdaftar
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span className="font-semibold text-amber-700 tabular-nums">{kpi.pksKritisCount}</span> Perlu Perhatian
        </div>
      </div>

      {/* 4 Core Primary Cards Requested by User */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Dana Sesuai PKS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Dana Sesuai PKS
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(kpi.totalDanaPKS)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Nilai nominal komitmen seluruh PKS</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Rata-rata per PKS:</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {formatRupiahCompact(kpi.totalPKSCount > 0 ? kpi.totalDanaPKS / kpi.totalPKSCount : 0)}
            </span>
          </div>
        </div>

        {/* 2. Dana Sudah Dicairkan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dana Sudah Dicairkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(kpi.totalDanaDicairkan)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-blue-700 tabular-nums">
                {kpi.persentasePencairan.toFixed(1)}%
              </span>
              <span>dari total komitmen PKS</span>
            </div>
          </div>

          {/* Progress bar visual */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, kpi.persentasePencairan)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Dana Sudah Dilaporkan (SPJ) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dana Sudah Dilaporkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(kpi.totalDanaDilaporkan)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-700 tabular-nums">
                {kpi.persentasePelaporan.toFixed(1)}%
              </span>
              <span>dari dana yang dicairkan</span>
            </div>
          </div>

          {/* Progress bar visual */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, kpi.persentasePelaporan)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Sisa Dana Harus Dicairkan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sisa Harus Dicairkan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-900 font-mono tabular-nums tracking-tight">
              {formatRupiah(kpi.sisaDanaHarusDicairkan)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-amber-700 tabular-nums">
                {(100 - kpi.persentasePencairan).toFixed(1)}%
              </span>
              <span>sisa termin belum dicairkan</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Status Kas:</span>
            <span className="font-semibold text-slate-800">Menunggu Termin Berikutnya</span>
          </div>
        </div>
      </div>

      {/* Secondary Strategic Metrics Strip: Outstanding SPJ & Governance health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outstanding SPJ (Dana di Mitra yang belum diverifikasi) */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Sisa Dana Belum Dilaporkan (Outstanding Piutang Penyaluran)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
              {formatRupiah(kpi.sisaDanaBelumDilaporkan)}
            </div>
            <p className="text-xs text-slate-400">
              Selisih dana yang telah ditransfer namun bukti pertanggungjawaban fisik dan SPJ belum terverifikasi final.
            </p>
          </div>

          <div className="shrink-0 bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-right">
            <div className="text-xs text-slate-400">Tingkat Kepatuhan SPJ</div>
            <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
              {kpi.persentasePelaporan.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Target Kinerja: &ge; 85%</div>
          </div>
        </div>

        {/* Realization Summary Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Indeks Realisasi & Kinerja Keuangan
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Sesuai SOP Keuangan</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-100 text-center">
            <div>
              <div className="text-[11px] text-slate-500">Rasio Pencairan</div>
              <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {kpi.persentasePencairan.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Kolektibilitas SPJ</div>
              <div className="text-base font-bold text-emerald-600 font-mono tabular-nums">
                {kpi.persentasePelaporan.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">PKS Berjalan</div>
              <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {kpi.totalPKSCount} Kontrak
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Formula: Total PKS = Dicairkan ({formatRupiahCompact(kpi.totalDanaDicairkan)}) + Sisa ({formatRupiahCompact(kpi.sisaDanaHarusDicairkan)})</span>
          </div>
        </div>
      </div>
    </section>
  );
};
