import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  Link2,
  ArrowRight,
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { Platform, Service, Order, ProviderConfig } from './types';
import { PlatformBadge } from './PlatformIcons';
import { playSound } from './sound';

interface NewOrderViewProps {
  services: Service[];
  balance: number;
  provider: ProviderConfig;
  onOrderPlaced: (order: Order, newBalance: number) => void;
  onOpenAddFunds: () => void;
  onViewOrders: () => void;
  soundEnabled: boolean;
  isCuteLight: boolean;
  preselectedServiceId?: number | null;
  currencySymbol?: string;
  currencyRate?: number; // USD to KES rate (default 130)
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  services,
  balance,
  provider,
  onOrderPlaced,
  onOpenAddFunds,
  onViewOrders,
  soundEnabled,
  isCuteLight,
  preselectedServiceId,
  currencySymbol = 'KES',
  currencyRate = 130,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'All'>('Instagram');
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    preselectedServiceId || (services.length > 0 ? services[0].id : 0)
  );

  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState<number>(2000);
  const [isDripFeed, setIsDripFeed] = useState(false);
  const [runs, setRuns] = useState(2);
  const [interval, setInterval] = useState(60);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Order Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: number;
    serviceName: string;
    link: string;
    quantity: number;
    totalPriceKes: number;
    totalPriceUsd: number;
    status: string;
    createdAt: string;
    estDelivery: string;
    providerNote: string;
  } | null>(null);

  // Filter platforms
  const platforms: (Platform | 'All')[] = useMemo(() => {
    return ['All', 'Instagram', 'TikTok', 'Facebook', 'YouTube', 'Telegram', 'Twitter', 'Spotify', 'Threads', 'Twitch'];
  }, []);

  // Filter services by platform
  const filteredServices = useMemo(() => {
    if (selectedPlatform === 'All') return services;
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  // Synchronize preselected service ID or platform
  React.useEffect(() => {
    if (preselectedServiceId) {
      const match = services.find((s) => s.id === preselectedServiceId);
      if (match) {
        setSelectedPlatform(match.platform);
        setSelectedServiceId(match.id);
        setQuantity(Math.max(match.min, 1000));
        return;
      }
    }
  }, [preselectedServiceId, services]);

  // Ensure selected service exists in filtered list or fallback
  React.useEffect(() => {
    if (filteredServices.length > 0) {
      const exists = filteredServices.some((s) => s.id === selectedServiceId);
      if (!exists && selectedPlatform !== 'All') {
        setSelectedServiceId(filteredServices[0].id);
        setQuantity(Math.max(filteredServices[0].min, 1000));
      }
    }
  }, [filteredServices, selectedServiceId, selectedPlatform]);

  const currentService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Price calculations
  // Unit rate per 1,000 in USD
  const usdRatePer1k = currentService ? currentService.rate : 0;
  // Unit rate per 1,000 in KES (example: 150 KES / 1,000)
  const kesRatePer1k = Math.round(usdRatePer1k * currencyRate);

  const totalQuantity = isDripFeed ? quantity * runs : quantity;
  
  // Example calculation: If quantity is 2,000 and price is KES 150/1k => Total = KES 300
  const totalKes = Number(((totalQuantity / 1000) * kesRatePer1k).toFixed(0));
  const totalUsd = Number(((totalQuantity / 1000) * usdRatePer1k).toFixed(3));

  // Min / Max validation
  const minQty = currentService ? currentService.min : 100;
  const maxQty = currentService ? currentService.max : 100000;
  const isQuantityValid = quantity >= minQty && quantity <= maxQty;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!currentService) return;

    // Validate fields
    if (!link.trim()) {
      setValidationError('Target social link or profile URL is required.');
      playSound('cancel', soundEnabled);
      return;
    }

    if (!quantity || isNaN(quantity)) {
      setValidationError('Please enter a valid order quantity.');
      playSound('cancel', soundEnabled);
      return;
    }

    if (quantity < minQty || quantity > maxQty) {
      setValidationError(
        `Quantity must be between ${minQty.toLocaleString()} and ${maxQty.toLocaleString()} for ${currentService.name}.`
      );
      playSound('cancel', soundEnabled);
      return;
    }

    setIsSubmitting(true);
    playSound('sparkle', soundEnabled);

    // Realistic Order ID generation
    const newOrderId = Math.floor(100000 + Math.random() * 900000);
    const orderCreatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Professional transparency:
    // Initial status set to "Pending Payment" / "Pending"
    const initialStatus = 'Pending';
    const providerNotice = provider.status === 'connected'
      ? `Queued for external dispatch to ${provider.name}. Ready to forward once payment or balance is confirmed.`
      : 'Queued in panel. Connect a live provider API in SMM Provider tab for automated external fulfillment.';

    const newOrder: Order = {
      id: newOrderId,
      serviceId: currentService.id,
      serviceName: currentService.name,
      platform: currentService.platform,
      link: link.trim(),
      quantity: totalQuantity,
      charge: totalUsd,
      startCount: 0,
      remains: totalQuantity,
      status: initialStatus,
      createdAt: orderCreatedAt,
      dripfeed: isDripFeed ? { runs, interval, totalQuantity } : undefined,
      apiForwarded: false,
      providerNote: providerNotice,
    };

    // Trigger celebration effect
    try {
      confetti({
        particleCount: 85,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f43f5e', '#a855f7', '#06b6d4', '#10b981'],
      });
    } catch {}

    playSound('chime', soundEnabled);

    // Deduct balance if available, or update order list
    const remainingBalance = Math.max(0, balance - totalUsd);
    onOrderPlaced(newOrder, remainingBalance);

    // Show Confirmation Modal
    setConfirmedOrder({
      orderId: newOrderId,
      serviceName: currentService.name,
      link: link.trim(),
      quantity: totalQuantity,
      totalPriceKes: totalKes,
      totalPriceUsd: totalUsd,
      status: 'Pending',
      createdAt: orderCreatedAt,
      estDelivery: currentService.avgTime,
      providerNote: providerNotice,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Place Order Title & Notice */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                  Place Order
                </h1>
                <p className="text-xs text-slate-400">
                  Configure your target social link, quantity, and instantly calculate total pricing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onViewOrders();
              }}
              className="px-4 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>View Orders</span>
            </button>
            <div className="px-3.5 py-2 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-400 font-bold">
              Wallet: ${balance.toFixed(2)} USD
            </div>
          </div>
        </div>

        {/* Clear Professional Status Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-black/30 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">System Notice:</strong> New orders are initialized as <strong className="text-amber-400">Pending</strong> in your order history. In live production, actual automated social media delivery begins once your external SMM provider API is connected and verified.
          </span>
        </div>
      </div>

      {/* Main Grid: Form Left (7 cols) + Service Info & Estimated Delivery (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Place Order Form */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border transition-colors ${
          isCuteLight
            ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
            : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl shadow-2xl'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <span>Order Configuration</span>
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Live Price Calculator
            </span>
          </div>

          {/* Quick Platform Filter Tabs */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Filter by Platform
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {platforms.map((p) => {
                const isActive = selectedPlatform === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      playSound('pop', soundEnabled);
                      setSelectedPlatform(p);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/25 scale-105'
                        : isCuteLight
                        ? 'bg-slate-100 text-slate-600 border-slate-200 hover:border-pink-300'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    {p === 'All' ? '🌐 All' : p}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            
            {/* 1. Service Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Select Service</span>
                <span className="text-[11px] text-pink-500 font-semibold lowercase">
                  {filteredServices.length} packages available
                </span>
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  playSound('pop', soundEnabled);
                  setSelectedServiceId(Number(e.target.value));
                }}
                className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
                  isCuteLight
                    ? 'bg-slate-50 border-pink-200 text-slate-800'
                    : 'bg-slate-950/80 border-slate-700 text-slate-100'
                }`}
              >
                {filteredServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.name} — {currencySymbol} {Math.round(s.rate * currencyRate).toLocaleString()} / 1K (${s.rate.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Quick Highlight Info */}
            {currentService && (
              <div className="p-3.5 rounded-2xl bg-black/25 border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-pink-400">
                    Price: {currencySymbol} {kesRatePer1k.toLocaleString()} / 1,000 (${usdRatePer1k.toFixed(2)} USD)
                  </span>
                  <span>
                    Min: <strong className="text-slate-200">{minQty.toLocaleString()}</strong> • Max:{' '}
                    <strong className="text-slate-200">{maxQty.toLocaleString()}</strong>
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                  {currentService.description}
                </p>
              </div>
            )}

            {/* 2. Target / Link Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Target Link / URL</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Profile URL or post link
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    currentService?.platform === 'Instagram'
                      ? 'https://instagram.com/p/yourpost or profile'
                      : currentService?.platform === 'TikTok'
                      ? 'https://www.tiktok.com/@yourusername or video link'
                      : currentService?.platform === 'YouTube'
                      ? 'https://youtube.com/watch?v=... or channel'
                      : 'https://...'
                  }
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={`w-full pl-4 pr-12 py-3 rounded-2xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
                    isCuteLight
                      ? 'bg-slate-50 border-pink-200 text-slate-800 placeholder-slate-400'
                      : 'bg-slate-950/70 border-slate-700 text-slate-100 placeholder-slate-500'
                  }`}
                />
                {link && (
                  <button
                    type="button"
                    onClick={() => setLink('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-pink-400 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* 3. Quantity Input & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Quantity
                </label>
                <span className="text-[11px] text-slate-400">
                  Min: <span className="font-bold text-pink-400">{minQty.toLocaleString()}</span> — Max:{' '}
                  <span className="font-bold text-pink-400">{maxQty.toLocaleString()}</span>
                </span>
              </div>

              <input
                type="number"
                required
                min={minQty}
                max={maxQty}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${
                  isCuteLight
                    ? 'bg-slate-50 border-pink-200 text-slate-800'
                    : 'bg-slate-950/70 border-slate-700 text-slate-100'
                } ${!isQuantityValid && quantity > 0 ? 'border-rose-500 focus:ring-rose-500/50' : ''}`}
              />

              {/* Min/Max validation warning */}
              {!isQuantityValid && quantity > 0 && (
                <div className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Quantity must be between {minQty.toLocaleString()} and {maxQty.toLocaleString()}.
                  </span>
                </div>
              )}

              {/* Quick Select Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {[100, 500, 1000, 2000, 5000, 10000].map((amt) => {
                  if (amt < minQty || amt > maxQty) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        playSound('pop', soundEnabled);
                        setQuantity(amt);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all ${
                        quantity === amt
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setQuantity(minQty);
                  }}
                  className="px-2 py-1 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Min ({minQty})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setQuantity(Math.min(maxQty, 20000));
                  }}
                  className="px-2 py-1 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Max Recommended
                </button>
              </div>
            </div>

            {/* Drip-Feed Option */}
            {currentService?.dripfeed && (
              <div className="p-3.5 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="dripfeed-toggle-order"
                      type="checkbox"
                      checked={isDripFeed}
                      onChange={(e) => {
                        playSound('pop', soundEnabled);
                        setIsDripFeed(e.target.checked);
                      }}
                      className="w-4 h-4 text-pink-500 rounded accent-pink-500 focus:ring-pink-500 cursor-pointer"
                    />
                    <label htmlFor="dripfeed-toggle-order" className="text-xs font-bold text-pink-300 cursor-pointer">
                      Drip-Feed (Natural Gradual Delivery)
                    </label>
                  </div>
                  <span className="text-[11px] text-pink-400 font-semibold">Algorithm Safe</span>
                </div>

                {isDripFeed && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-pink-500/15">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        Runs (Repeat Times)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={50}
                        value={runs}
                        onChange={(e) => setRuns(Math.max(2, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        Interval (Minutes)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={1440}
                        value={interval}
                        onChange={(e) => setInterval(Math.max(10, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white"
                      />
                    </div>
                    <div className="col-span-2 text-[11px] text-slate-300 bg-black/25 p-2 rounded-xl">
                      Total Delivered: <strong className="text-pink-400">{(quantity * runs).toLocaleString()}</strong> over{' '}
                      <strong className="text-pink-400">{Math.round((runs * interval) / 60)} hours</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 4. Automatically Calculated Total Price */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-emerald-500/10 border border-pink-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Calculator className="w-4 h-4 text-pink-400" />
                  <span>Calculated Total Price:</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                    {currencySymbol} {totalKes.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ≈ ${totalUsd.toFixed(2)} USD ({totalQuantity.toLocaleString()} units @ {currencySymbol} {kesRatePer1k}/1k)
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Account Balance:</span>
                <span className="font-bold text-slate-200">
                  ${balance.toFixed(2)} USD (≈ {currencySymbol} {Math.round(balance * currencyRate).toLocaleString()})
                </span>
              </div>
            </div>

            {/* 5. Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isQuantityValid}
              className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                isQuantityValid
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/30 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  <span>Place Order — {currencySymbol} {totalKes.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Service Description & Estimated Delivery Information */}
        <div className="lg:col-span-5 space-y-5">
          {currentService && (
            <div className={`p-6 rounded-3xl border relative overflow-hidden transition-all ${
              isCuteLight
                ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
                : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <PlatformBadge platform={currentService.platform} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  ID: #{currentService.id}
                </span>
              </div>

              <h3 className="text-base font-extrabold mb-3 text-slate-100 leading-snug">
                {currentService.name}
              </h3>

              {/* Estimated Delivery Information Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    <span>Estimated Start</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">
                    {currentService.avgTime}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Estimated Speed</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">
                    {currentService.speed}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Guarantee / Refill</span>
                  </div>
                  <div className="text-xs font-bold text-purple-300">
                    {currentService.refill ? `${currentService.refillDays || 30} Days Guarantee` : 'Standard Non-Drop'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Account Profile</span>
                  </div>
                  <div className="text-xs font-bold text-amber-300">
                    {currentService.quality}
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-pink-400" />
                  <span>Service Description</span>
                </h4>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <p>{currentService.description}</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-pink-400 flex items-center gap-1.5">
                    <span>💡 Important:</span>
                    <span>Profile or post must remain public until delivery is completed.</span>
                  </div>
                </div>
              </div>

              {/* Fast Example Calculation Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-xs space-y-1">
                <span className="font-bold text-pink-400 block">Calculation Example:</span>
                <p className="text-slate-300 text-[11px]">
                  Service: <strong className="text-white">{currentService.category}</strong><br />
                  Price: <strong className="text-white">{currencySymbol} {kesRatePer1k} / 1,000</strong><br />
                  Quantity: <strong className="text-white">{quantity.toLocaleString()}</strong><br />
                  Total = <strong className="text-emerald-400">{currencySymbol} {totalKes.toLocaleString()}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Quick Buttons Card */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Quick Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound('pop', soundEnabled);
                  onViewOrders();
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>View Orders</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('pop', soundEnabled);
                  onOpenAddFunds();
                }}
                className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Funds / Pesapal</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Order Confirmation Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-slate-900 border border-pink-500/40 shadow-2xl relative space-y-4">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-extrabold text-white">Order Confirmed! 🎉</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your order has been recorded and placed into the tracking queue.
              </p>
            </div>

            {/* Generated Order Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-pink-400 text-sm">#{confirmedOrder.orderId}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Service:</span>
                <span className="font-bold text-slate-200 text-right max-w-[220px] truncate">
                  {confirmedOrder.serviceName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Link:</span>
                <a
                  href={confirmedOrder.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-pink-400 truncate max-w-[200px] hover:underline"
                >
                  {confirmedOrder.link}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Quantity:</span>
                <span className="font-bold text-white">{confirmedOrder.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  {currencySymbol} {confirmedOrder.totalPriceKes.toLocaleString()}{' '}
                  <span className="text-slate-400 font-normal text-[11px]">(${confirmedOrder.totalPriceUsd.toFixed(2)})</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Initial Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{confirmedOrder.status}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Est. Start:</span>
                <span className="text-slate-300 font-medium">{confirmedOrder.estDelivery}</span>
              </div>
            </div>

            {/* Clear Transparency Callout */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed">
              Order status is currently <strong className="text-white">Pending</strong>. Delivery will begin automatically once connected with your external SMM provider API.
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound('pop', soundEnabled);
                  setConfirmedOrder(null);
                  onViewOrders();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2"
              >
                <span>View in Order History</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('pop', soundEnabled);
                  setConfirmedOrder(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
