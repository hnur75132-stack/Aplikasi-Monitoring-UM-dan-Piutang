import React from 'react';
import { RealTimeEvent } from '../types/finance';
import { formatRupiah, formatWaktuRelatif } from '../utils/formatters';
import { 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  Send, 
  Sparkles,
  Radio,
  Clock
} from 'lucide-react';

interface RealTimeActivityFeedProps {
  events: RealTimeEvent[];
  isRealTimeActive: boolean;
  onSimulateEvent: () => void;
  onClearEvents: () => void;
}

export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  events,
  isRealTimeActive,
  onSimulateEvent,
  onClearEvents,
}) => {
  const getEventIcon = (type: RealTimeEvent['tipe']) => {
    switch (type) {
      case 'pencairan':
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'spj_diverifikasi':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'spj_masuk':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'penagihan':
        return <Send className="w-4 h-4 text-indigo-600" />;
      case 'pks_baru':
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-blue-600" />
            {isRealTimeActive && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Log Aktivitas & Audit Real-Time
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onSimulateEvent}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors cursor-pointer"
            title="Simulasikan transaksi baru masuk dari perbankan atau mitra"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulasikan Transaksi Masuk</span>
          </button>
          {events.length > 0 && (
            <button
              onClick={onClearEvents}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Bersihkan
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada log aktivitas real-time baru.
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="py-3 flex items-start gap-3 text-xs hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                {getEventIcon(evt.tipe)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-slate-900">{evt.judul}</span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {formatWaktuRelatif(evt.waktu)}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{evt.deskripsi}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span className="font-medium text-slate-700">{evt.mitraNama}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{evt.nomorPKS}</span>
                  {evt.nilaiRupiah !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-slate-900 font-mono tabular-nums">
                        {formatRupiah(evt.nilaiRupiah)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
