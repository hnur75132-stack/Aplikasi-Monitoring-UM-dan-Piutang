import React, { useState, useId } from 'react';
import { MonthlyTrendData } from '../types/finance';
import { formatRupiah, formatRupiahCompact } from '../utils/formatters';
import { 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Info,
  Calendar,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
}

type MetricMode = 'all' | 'penagihan' | 'pencairan' | 'pelaporan';
type ChartStyle = 'bar' | 'line';

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('all');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyTrendData | null>(data[data.length - 3] || data[0]);

  const chartGradientId = useId();

  // Find max value for Y-axis scaling
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.penagihan, d.pencairan, d.pelaporan)),
    10000000000 // At least 10 Miliar for clean baseline
  );

  // Totals & averages
  const totalPenagihan = data.reduce((a, b) => a + b.penagihan, 0);
  const totalPencairan = data.reduce((a, b) => a + b.pencairan, 0);
  const totalPelaporan = data.reduce((a, b) => a + b.pelaporan, 0);
  const avgKolektibilitas = (totalPencairan / (totalPenagihan || 1)) * 100;
  
  const peakMonth = [...data].sort((a, b) => b.penagihan - a.penagihan)[0];

  // SVG Chart Geometry
  const width = 880;
  const height = 280;
  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxValue) * chartHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  // Y-axis grid lines (5 steps)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: maxValue * pct,
    y: paddingTop + chartHeight - pct * chartHeight,
  }));

  // Line paths
  const makeLinePath = (key: 'penagihan' | 'pencairan' | 'pelaporan') => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`)
      .join(' ');
  };

  const makeAreaPath = (key: 'penagihan' | 'pencairan' | 'pelaporan') => {
    const line = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key])}`)
      .join(' ');
    const lastX = getX(data.length - 1);
    const firstX = getX(0);
    const bottomY = paddingTop + chartHeight;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const activeDataPoint = hoveredIndex !== null ? data[hoveredIndex] : selectedMonth;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Grafik Tren Penagihan & Realisasi Bulanan
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Komparasi volume penerbitan penagihan (invoice), realisasi pencairan kas, dan dokumen SPJ terverifikasi per bulan.
          </p>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setMetricMode('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setMetricMode('penagihan')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'penagihan'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Penagihan
            </button>
            <button
              onClick={() => setMetricMode('pencairan')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'pencairan'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pencairan
            </button>
            <button
              onClick={() => setMetricMode('pelaporan')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                metricMode === 'pelaporan'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SPJ / Laporan
            </button>
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartStyle('bar')}
              className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartStyle === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilkan Diagram Batang"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartStyle('line')}
              className={`px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartStyle === 'line' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilkan Grafik Area & Tren Garis"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-5">
          {(metricMode === 'all' || metricMode === 'penagihan') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
              <span className="font-medium text-slate-700">Penagihan (Invoiced)</span>
            </div>
          )}
          {(metricMode === 'all' || metricMode === 'pencairan') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" />
              <span className="font-medium text-slate-700">Pencairan Dana (Disbursed)</span>
            </div>
          )}
          {(metricMode === 'all' || metricMode === 'pelaporan') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span className="font-medium text-slate-700">Laporan Masuk (SPJ Verified)</span>
            </div>
          )}
        </div>
        <div className="text-slate-400 text-[11px] hidden sm:block">
          Klik atau arahkan kursor ke titik bulan untuk inspeksi detail
        </div>
      </div>

      {/* Main SVG Interactive Chart Area */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-64 sm:h-72 select-none"
        >
          <defs>
            <linearGradient id={`${chartGradientId}-blue`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${chartGradientId}-indigo`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={`${chartGradientId}-emerald`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid Lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono tabular-nums"
              >
                {formatRupiahCompact(tick.val)}
              </text>
            </g>
          ))}

          {/* Render Mode: Bar Chart */}
          {chartStyle === 'bar' && (
            <g>
              {data.map((d, index) => {
                const totalBarWidth = (chartWidth / data.length) * 0.72;
                const slotWidth = chartWidth / data.length;
                const groupStartX = paddingLeft + index * slotWidth + (slotWidth - totalBarWidth) / 2;
                
                const activeMetricsCount = 
                  metricMode === 'all' ? 3 : 1;
                const barWidth = totalBarWidth / activeMetricsCount;
                const isHovered = hoveredIndex === index;
                const isSelected = selectedMonth?.bulanKey === d.bulanKey;

                return (
                  <g 
                    key={d.bulanKey}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedMonth(d)}
                    className="cursor-pointer"
                  >
                    {/* Hover highlight background */}
                    <rect
                      x={paddingLeft + index * slotWidth}
                      y={paddingTop}
                      width={slotWidth}
                      height={chartHeight}
                      fill={isHovered || isSelected ? '#f8fafc' : 'transparent'}
                      rx="4"
                    />

                    {/* Penagihan Bar */}
                    {(metricMode === 'all' || metricMode === 'penagihan') && (
                      <rect
                        x={groupStartX}
                        y={getY(d.penagihan)}
                        width={Math.max(4, barWidth - 2)}
                        height={Math.max(2, paddingTop + chartHeight - getY(d.penagihan))}
                        fill="#2563eb"
                        rx="2"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : 0.9}
                      />
                    )}

                    {/* Pencairan Bar */}
                    {(metricMode === 'all' || metricMode === 'pencairan') && (
                      <rect
                        x={groupStartX + (metricMode === 'all' ? barWidth : 0)}
                        y={getY(d.pencairan)}
                        width={Math.max(4, barWidth - 2)}
                        height={Math.max(2, paddingTop + chartHeight - getY(d.pencairan))}
                        fill="#6366f1"
                        rx="2"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* Pelaporan Bar */}
                    {(metricMode === 'all' || metricMode === 'pelaporan') && (
                      <rect
                        x={groupStartX + (metricMode === 'all' ? barWidth * 2 : 0)}
                        y={getY(d.pelaporan)}
                        width={Math.max(4, barWidth - 2)}
                        height={Math.max(2, paddingTop + chartHeight - getY(d.pelaporan))}
                        fill="#10b981"
                        rx="2"
                        className="transition-all duration-200"
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* X Label */}
                    <text
                      x={paddingLeft + index * slotWidth + slotWidth / 2}
                      y={height - 14}
                      textAnchor="middle"
                      className={`text-[11px] select-none transition-colors ${
                        isHovered || isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-500 font-medium'
                      }`}
                    >
                      {d.singkatan}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Render Mode: Line / Area Chart */}
          {chartStyle === 'line' && (
            <g>
              {/* Areas */}
              {(metricMode === 'all' || metricMode === 'penagihan') && (
                <path d={makeAreaPath('penagihan')} fill={`url(#${chartGradientId}-blue)`} />
              )}
              {(metricMode === 'all' || metricMode === 'pencairan') && (
                <path d={makeAreaPath('pencairan')} fill={`url(#${chartGradientId}-indigo)`} />
              )}
              {(metricMode === 'all' || metricMode === 'pelaporan') && (
                <path d={makeAreaPath('pelaporan')} fill={`url(#${chartGradientId}-emerald)`} />
              )}

              {/* Lines */}
              {(metricMode === 'all' || metricMode === 'penagihan') && (
                <path d={makeLinePath('penagihan')} fill="none" stroke="#2563eb" strokeWidth="2.5" />
              )}
              {(metricMode === 'all' || metricMode === 'pencairan') && (
                <path d={makeLinePath('pencairan')} fill="none" stroke="#6366f1" strokeWidth="2.5" />
              )}
              {(metricMode === 'all' || metricMode === 'pelaporan') && (
                <path d={makeLinePath('pelaporan')} fill="none" stroke="#10b981" strokeWidth="2.5" />
              )}

              {/* Data points and hover zones */}
              {data.map((d, index) => {
                const x = getX(index);
                const isHovered = hoveredIndex === index;
                const isSelected = selectedMonth?.bulanKey === d.bulanKey;

                return (
                  <g 
                    key={d.bulanKey}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedMonth(d)}
                    className="cursor-pointer"
                  >
                    {/* Vertical guideline */}
                    {(isHovered || isSelected) && (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + chartHeight}
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    )}

                    {(metricMode === 'all' || metricMode === 'penagihan') && (
                      <circle
                        cx={x}
                        cy={getY(d.penagihan)}
                        r={isHovered ? 5 : 3.5}
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    {(metricMode === 'all' || metricMode === 'pencairan') && (
                      <circle
                        cx={x}
                        cy={getY(d.pencairan)}
                        r={isHovered ? 5 : 3.5}
                        fill="#6366f1"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    {(metricMode === 'all' || metricMode === 'pelaporan') && (
                      <circle
                        cx={x}
                        cy={getY(d.pelaporan)}
                        r={isHovered ? 5 : 3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}

                    <text
                      x={x}
                      y={height - 14}
                      textAnchor="middle"
                      className={`text-[11px] select-none transition-colors ${
                        isHovered || isSelected ? 'fill-slate-900 font-bold' : 'fill-slate-500 font-medium'
                      }`}
                    >
                      {d.singkatan}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Selected / Hovered Month Inspection Panel */}
      {activeDataPoint && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span className="font-bold text-slate-900 text-sm">
                Rincian Analisis Bulan: {activeDataPoint.bulanNama} {activeDataPoint.tahun}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div>
                <span className="text-slate-500">Penagihan:</span>{' '}
                <span className="font-semibold text-blue-700 font-mono tabular-nums">
                  {formatRupiah(activeDataPoint.penagihan)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Pencairan:</span>{' '}
                <span className="font-semibold text-indigo-700 font-mono tabular-nums">
                  {formatRupiah(activeDataPoint.pencairan)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Pelaporan SPJ:</span>{' '}
                <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                  {formatRupiah(activeDataPoint.pelaporan)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Kolektibilitas:</span>{' '}
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {activeDataPoint.kolektibilitasRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Analytical Insights Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
        <div>
          <div className="text-slate-500">Akumulasi Penagihan 2026</div>
          <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {formatRupiahCompact(totalPenagihan)}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Akumulasi Realisasi Pencairan</div>
          <div className="text-base font-bold text-indigo-900 font-mono tabular-nums mt-0.5">
            {formatRupiahCompact(totalPencairan)}
          </div>
        </div>
        <div>
          <div className="text-slate-500">Rerata Kolektibilitas Tagihan</div>
          <div className="text-base font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {avgKolektibilitas.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-slate-500">Puncak Penagihan Tertinggi</div>
          <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {peakMonth.singkatan} ({formatRupiahCompact(peakMonth.penagihan)})
          </div>
        </div>
      </div>
    </div>
  );
};
