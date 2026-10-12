import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Download,
  Info,
  X,
  Radio,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { Service } from '../types';
import { PlatformBadge } from './PlatformIcons';
import { playSound } from '../utils/sound';

interface ServicesViewProps {
  services: Service[];
  onQuickOrder: (serviceId: number) => void;
  onNavigateToApi: () => void;
  soundEnabled: boolean;
  isCuteLight: boolean;
  currencySymbol?: string;
  currencyRate?: number; // Rate multiplier relative to USD (default 130 for KES, or 1 for USD)
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onQuickOrder,
  onNavigateToApi,
  soundEnabled,
  isCuteLight,
  currencySymbol = 'KES',
  currencyRate = 130, // 1 USD ~ 130 KES
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refillOnly, setRefillOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'price-asc' | 'price-desc'>('id');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);

  // Exact 5 requested category filters + All
  const categoriesList = [
    { id: 'All', label: 'All Services', icon: '🌐' },
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵' },
    { id: 'Facebook', label: 'Facebook', icon: '👥' },
    { id: 'YouTube', label: 'YouTube', icon: '▶️' },
    { id: 'Telegram', label: 'Telegram', icon: '✈️' },
  ];

  // Price conversion helper
  const formatPrice = (usdRate: number) => {
    if (currencySymbol === 'KES') {
      const kes = Math.round(usdRate * currencyRate);
      return `KES ${kes.toLocaleString()}`;
    }
    return `$${usdRate.toFixed(2)}`;
  };

  const filteredServices = useMemo(() => {
    return services
      .filter((s) => {
        if (selectedCategory !== 'All' && s.platform !== selectedCategory) return false;
        if (refillOnly && !s.refill) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          String(s.id).includes(q) ||
          s.platform.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.rate - b.rate;
        if (sortBy === 'price-desc') return b.rate - a.rate;
        return a.id - b.id;
      });
  }, [services, selectedCategory, refillOnly, searchQuery, sortBy]);

  const handleExportJson = () => {
    playSound('coin', soundEnabled);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(services, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `viralcute-services-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Professional Transparency Notice Banner */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🛡️</span>
          <div>
            <span className="font-bold text-amber-200 block">SMM Provider & Payment Notice:</span>
            <span className="text-slate-300 text-[11px]">
              Services display realistic catalog rates ({currencySymbol} / 1,000). Orders are queued in your dashboard as <strong className="text-amber-300">Pending</strong> until dispatched to your connected SMM provider API and verified via Pesapal payment.
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            playSound('pop', soundEnabled);
            onNavigateToApi();
          }}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-bold text-xs whitespace-nowrap transition-all"
        >
          Check API Provider
        </button>
      </div>

      {/* Header bar */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>ViralCute Services Catalog</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                {filteredServices.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select any package below and click <span className="text-pink-400 font-semibold">"Order Now"</span> to open the Place Order page with that service auto-selected.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center bg-black/30 border border-slate-800 rounded-2xl p-1 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                  viewMode === 'cards' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cards View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-pink-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
            </div>

            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onNavigateToApi();
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1.5 transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Sync API</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 1. Services Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
            <input
              type="text"
              placeholder="Search services by name, platform, ID (e.g. Instagram Followers, 101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
                isCuteLight
                  ? 'bg-slate-50 border-pink-200 text-slate-800 placeholder-slate-400'
                  : 'bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full px-3 py-3 rounded-2xl border text-xs font-semibold focus:outline-none ${
                isCuteLight
                  ? 'bg-slate-50 border-pink-200 text-slate-800'
                  : 'bg-slate-950/70 border-slate-700 text-slate-100'
              }`}
            >
              <option value="id">Sort by: Default ID</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 select-none px-3 py-2.5 rounded-2xl bg-black/20 border border-slate-800 w-full justify-center">
              <input
                type="checkbox"
                checked={refillOnly}
                onChange={(e) => setRefillOnly(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 accent-pink-500"
              />
              <span>Refill Guarantee Only 💖</span>
            </label>
          </div>
        </div>

        {/* 2. Category Filters (Instagram, TikTok, Facebook, YouTube, Telegram) */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Category Filters
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count =
                cat.id === 'All'
                  ? services.length
                  : services.filter((s) => s.platform === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white border-transparent shadow-md shadow-pink-500/25 scale-105'
                      : isCuteLight
                      ? 'bg-slate-100 text-slate-600 border-slate-200 hover:border-pink-300'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/30 text-slate-400'
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

      {/* 3. Service Cards or Table View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
              <p className="font-semibold text-base">No services match your current search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setRefillOnly(false);
                }}
                className="mt-3 text-xs text-pink-400 underline font-bold"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className={`p-5 rounded-3xl border transition-all hover:scale-[1.01] flex flex-col justify-between group ${
                  isCuteLight
                    ? 'bg-white/95 border-pink-100 shadow-md hover:shadow-xl hover:border-pink-300'
                    : 'bg-slate-900/85 border-slate-800 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/5'
                }`}
              >
                <div>
                  {/* Card Header: Platform badge + ID */}
                  <div className="flex items-center justify-between mb-3">
                    <PlatformBadge platform={service.platform} />
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-black/20 px-2 py-0.5 rounded-lg border border-slate-800">
                      ID: #{service.id}
                    </span>
                  </div>

                  {/* Service Name */}
                  <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-pink-400 transition-colors line-clamp-2 leading-snug mb-2">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div>
                  {/* Metadata Chips: Min/Max, Price per 1,000 */}
                  <div className="p-3 rounded-2xl bg-black/25 border border-slate-800/80 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Price per 1,000:</span>
                      <span className="font-extrabold text-base bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                        {formatPrice(service.rate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60">
                      <span className="text-slate-400">Min / Max Qty:</span>
                      <span className="font-bold text-slate-200">
                        {service.min.toLocaleString()} — {service.max.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Est. Speed:</span>
                      <span className="font-semibold text-emerald-400">{service.speed}</span>
                    </div>
                  </div>

                  {/* Actions: "Order Now" & "Details" */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playSound('pop', soundEnabled);
                        setActiveModalService(service);
                      }}
                      title="View full service information"
                      className="p-2.5 rounded-2xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-all text-xs flex items-center justify-center"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        playSound('pop', soundEnabled);
                        onQuickOrder(service.id);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 fill-current" />
                      <span>Order Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className={`rounded-3xl border overflow-hidden transition-colors ${
          isCuteLight
            ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
            : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                  isCuteLight ? 'bg-pink-50/50 border-pink-100 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Service Name & Description</th>
                  <th className="py-3.5 px-4">Price / 1K</th>
                  <th className="py-3.5 px-4">Min Qty</th>
                  <th className="py-3.5 px-4">Max Qty</th>
                  <th className="py-3.5 px-4">Speed</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      No services match filters.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr
                      key={service.id}
                      className={`group transition-colors ${
                        isCuteLight ? 'hover:bg-pink-50/40' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        #{service.id}
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PlatformBadge platform={service.platform} showName={false} />
                            <span className="font-bold text-slate-100 group-hover:text-pink-400 transition-colors">
                              {service.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-pink-400 text-sm">
                          {formatPrice(service.rate)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {service.min.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {service.max.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          {service.speed}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            playSound('pop', soundEnabled);
                            onQuickOrder(service.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/20 hover:opacity-95 transition-all inline-flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3 fill-current" />
                          <span>Order Now</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="max-w-lg w-full p-6 rounded-3xl bg-slate-900 border border-pink-500/30 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={activeModalService.platform} />
                <span className="text-xs font-mono font-bold text-pink-400">
                  ID: #{activeModalService.id}
                </span>
              </div>
              <button
                onClick={() => setActiveModalService(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-white">
              {activeModalService.name}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Price per 1,000:</span>
                <span className="text-pink-400 font-extrabold text-base">
                  {formatPrice(activeModalService.rate)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Min / Max Qty:</span>
                <span className="text-white font-bold">
                  {activeModalService.min.toLocaleString()} — {activeModalService.max.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Start & Speed:</span>
                <span className="text-white font-bold">{activeModalService.speed}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1">Refill Policy:</span>
                <span className="text-white font-bold">
                  {activeModalService.refill ? `${activeModalService.refillDays || 30} Days Guarantee` : 'Standard Non-Drop'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <h5 className="font-bold text-slate-400">Service Description:</h5>
              <p className="leading-relaxed">{activeModalService.description}</p>
            </div>

            <button
              onClick={() => {
                onQuickOrder(activeModalService.id);
                setActiveModalService(null);
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span>Order Now ({formatPrice(activeModalService.rate)} / 1k)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
