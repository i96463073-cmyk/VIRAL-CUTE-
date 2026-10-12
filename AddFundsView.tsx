import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Key,
  CheckCircle2,
  Tag,
  RefreshCw,
  Phone,
  Mail,
  User,
  Smartphone,
  Eye,
  EyeOff,
  History,
} from 'lucide-react';
import { PesapalConfig, Transaction } from './types';
import { PesapalService } from './pesapalService';
import { playSound } from './sound';

interface AddFundsViewProps {
  balance: number;
  onAddFunds: (amount: number, bonus: number, method: string, meta?: any) => void;
  transactions: Transaction[];
  soundEnabled: boolean;
  isCuteLight: boolean;
  pesapalConfig: PesapalConfig;
  onUpdatePesapalConfig: (newConfig: PesapalConfig) => void;
}

export const AddFundsView: React.FC<AddFundsViewProps> = ({
  balance,
  onAddFunds,
  transactions,
  soundEnabled,
  isCuteLight,
  pesapalConfig,
  onUpdatePesapalConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'pesapal-pay' | 'pesapal-config' | 'history'>('pesapal-pay');
  const [selectedMethod] = useState<'pesapal' | 'card' | 'crypto' | 'paypal'>('pesapal');
  
  // Payment Form States
  const [amount, setAmount] = useState<number>(25);
  const [currency, setCurrency] = useState<'USD' | 'KES' | 'UGX' | 'TZS'>('USD');
  const [phoneNumber, setPhoneNumber] = useState('+254712345678');
  const [customerEmail, setCustomerEmail] = useState('creator@viralcute.com');
  const [customerName, setCustomerName] = useState('Amina Cute');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; bonusPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Pesapal Credentials Edit States
  const [showSecret, setShowSecret] = useState(false);
  const [pesapalForm, setPesapalForm] = useState<PesapalConfig>(pesapalConfig);
  const [isTestingKeys, setIsTestingKeys] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // Processing state & Checkout Modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    show: boolean;
    trackingId: string;
    reference: string;
    redirectUrl: string;
    amount: number;
    currency: string;
  } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();

    if (code === 'VIRALCUTE20') {
      setPromoApplied({ code, bonusPercent: 20 });
      playSound('sparkle', soundEnabled);
    } else if (code === 'PESAPAL10') {
      setPromoApplied({ code, bonusPercent: 15 });
      playSound('sparkle', soundEnabled);
    } else {
      playSound('cancel', soundEnabled);
      setPromoError('Try promo code VIRALCUTE20 or PESAPAL10 for extra balance!');
    }
  };

  const calculateBonus = () => {
    let bonus = 0;
    if (selectedMethod === 'pesapal') {
      bonus += amount * 0.05; // 5% Pesapal promotion bonus
    }
    if (promoApplied) {
      bonus += amount * (promoApplied.bonusPercent / 100);
    }
    return Number(bonus.toFixed(2));
  };

  const bonusAmount = calculateBonus();
  const totalCredited = amount + bonusAmount;

  // Test Pesapal API Keys
  const handleTestPesapalKeys = async () => {
    if (!pesapalForm.consumerKey || !pesapalForm.consumerSecret) {
      alert('Please fill in both Pesapal Consumer Key and Consumer Secret first!');
      return;
    }

    setIsTestingKeys(true);
    playSound('pop', soundEnabled);

    const result = await PesapalService.requestToken(pesapalForm);

    if (result.success && result.token) {
      const updated: PesapalConfig = {
        ...pesapalForm,
        status: 'connected',
        lastTested: new Date().toLocaleTimeString(),
        lastToken: result.token,
        tokenExpires: result.expiryDate || '5 minutes',
      };
      setPesapalForm(updated);
      onUpdatePesapalConfig(updated);
      setTestSuccess(`Connected! Bearer Token generated (${result.token.slice(0, 16)}...)`);
      playSound('chime', soundEnabled);
      try {
        confetti({ particleCount: 60, spread: 55 });
      } catch {}
    } else {
      alert(`Pesapal Authentication Failed: ${result.error || 'Check Consumer Key & Secret'}`);
    }

    setIsTestingKeys(false);
  };

  // Save Pesapal config
  const handleSavePesapalConfig = () => {
    onUpdatePesapalConfig(pesapalForm);
    playSound('coin', soundEnabled);
    alert('Pesapal API settings saved successfully!');
  };

  // Process payment
  const handleInitiatePayment = async () => {
    if (amount <= 0 || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    playSound('sparkle', soundEnabled);

    if (selectedMethod === 'pesapal') {
      // Step 1: Ensure token
      const auth = await PesapalService.requestToken(pesapalConfig);
      const token = auth.token || 'temp_token';

      // Step 2: Submit order to Pesapal
      const orderRes = await PesapalService.submitOrder(pesapalConfig, token, {
        amount,
        currency,
        description: `ViralCute Panel Wallet Top-up ($${amount})`,
        email: customerEmail,
        phone: phoneNumber,
        firstName: customerName.split(' ')[0] || 'Viral',
        lastName: customerName.split(' ')[1] || 'Cute',
      });

      setIsProcessing(false);

      if (orderRes.success) {
        setCheckoutModal({
          show: true,
          trackingId: orderRes.orderTrackingId || 'pesa_demo_982',
          reference: orderRes.reference || 'VC-PESA-84910',
          redirectUrl: orderRes.redirectUrl || '',
          amount,
          currency,
        });
        playSound('pop', soundEnabled);
      } else {
        alert(`Pesapal Order Request Failed: ${orderRes.error}`);
      }
    } else {
      // Regular simulated payment
      setTimeout(() => {
        onAddFunds(amount, bonusAmount, selectedMethod.toUpperCase());
        setIsProcessing(false);
        playSound('chime', soundEnabled);
        try {
          confetti({ particleCount: 90, spread: 60 });
        } catch {}
        alert(`🎉 Deposit of $${amount} (+ $${bonusAmount} bonus) credited successfully!`);
      }, 700);
    }
  };

  // Simulate complete Pesapal payment
  const handleCompletePesapalPayment = () => {
    if (!checkoutModal) return;
    onAddFunds(checkoutModal.amount, bonusAmount, 'Pesapal (M-Pesa / Cards)', {
      trackingId: checkoutModal.trackingId,
      reference: checkoutModal.reference,
    });
    setCheckoutModal(null);
    playSound('chime', soundEnabled);
    try {
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#ec4899', '#06b6d4'],
      });
    } catch {}
    alert(`🎉 Pesapal Payment Verified!\nTracking ID: ${checkoutModal.trackingId}\nAmount: ${checkoutModal.currency} ${checkoutModal.amount} credited to your ViralCute balance!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner highlighting both APIs */}
      <div className={`p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Add Funds & Pesapal Payment Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Pesapal v3.0 API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Top up with M-Pesa, Airtel Money, Visa/Mastercard, or configure your Pesapal Consumer Key & Secret.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                setActiveTab('pesapal-config');
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure Pesapal API</span>
            </button>
            <div className="px-3 py-2 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-400 font-bold">
              Balance: ${balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              setActiveTab('pesapal-pay');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'pesapal-pay'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-black/20 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pay with Pesapal (M-Pesa / Cards)</span>
          </button>

          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              setActiveTab('pesapal-config');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'pesapal-config'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-black/20 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Pesapal API Key & Secret Settings</span>
            <span className={`w-2 h-2 rounded-full ${pesapalConfig.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              setActiveTab('history');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'bg-black/20 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Deposit History ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PAY WITH PESAPAL */}
      {activeTab === 'pesapal-pay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form */}
          <div className={`lg:col-span-8 p-6 rounded-3xl border transition-colors ${
            isCuteLight
              ? 'bg-white/90 border-pink-100 shadow-xl'
              : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
          } space-y-5`}>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span className="text-xl">🇰🇪</span>
                  <span>Pesapal Mobile Money & Card Checkout</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Instant deposit via Safaricom M-Pesa, Airtel Money, Visa, Mastercard, or Bank Transfer.
                </p>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +5% Extra Bonus On Pesapal
                </span>
              </div>
            </div>

            {/* Quick Currency & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Currency
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['USD', 'KES', 'UGX', 'TZS'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        playSound('pop', soundEnabled);
                        setCurrency(curr);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        currency === curr
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                          : 'bg-black/20 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`w-full pl-12 pr-4 py-2.5 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      isCuteLight
                        ? 'bg-slate-50 border-pink-200 text-slate-800'
                        : 'bg-slate-950/70 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2">
              {[10, 25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setAmount(amt);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    amount === amt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {currency} {amt}
                </button>
              ))}
            </div>

            {/* Customer Details for Pesapal Billing */}
            <div className="p-4 rounded-2xl bg-black/20 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Billing Details (For M-Pesa Prompt / Receipt)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Phone (M-Pesa / Mobile Money)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254712345678"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="First & Last Name"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. VIRALCUTE20 or PESAPAL10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs uppercase font-mono text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Coupon {promoApplied.code} applied (+{promoApplied.bonusPercent}% bonus)</span>
                </div>
              )}
              {promoError && <div className="text-xs text-rose-400">{promoError}</div>}
            </form>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Payment Amount:</span>
                <span className="font-bold text-white">{currency} {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Pesapal + Promo Bonus:</span>
                <span>+{currency} {bonusAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Received in Account:</span>
                <span className="text-emerald-400 text-base font-black">
                  ${totalCredited.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              disabled={isProcessing || amount <= 0}
              onClick={handleInitiatePayment}
              className="w-full py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating Pesapal v3 Order...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Proceed to Pesapal Secure Payment ({currency} {amount})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Col: Pesapal badges & payment channels */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-6 rounded-3xl border transition-colors ${
              isCuteLight
                ? 'bg-white/90 border-pink-100 shadow-xl'
                : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
            } space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Supported Pesapal Channels</span>
              </h4>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Safaricom M-Pesa</div>
                    <div className="text-[10px] text-slate-400">Instant STK push to your mobile phone</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 font-black flex items-center justify-center text-xs">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Airtel Money</div>
                    <div className="text-[10px] text-slate-400">Kenya, Uganda, Tanzania, Rwanda</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-black flex items-center justify-center text-xs">
                    💳
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Visa & Mastercard</div>
                    <div className="text-[10px] text-slate-400">3D-Secure worldwide debit & credit cards</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/20 border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">
                    🏦
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Bank Transfers & EFT</div>
                    <div className="text-[10px] text-slate-400">Direct account settlement</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <span className="font-bold block mb-1">🔒 Pesapal Merchant Status:</span>
                <span className="text-[11px] text-slate-300">
                  Using Consumer Key: <code className="text-emerald-400 font-mono">{pesapalConfig.consumerKey ? `${pesapalConfig.consumerKey.slice(0, 10)}...` : 'Demo Config'}</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURE PESAPAL API KEYS */}
      {activeTab === 'pesapal-config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-8 p-6 rounded-3xl border transition-colors ${
            isCuteLight
              ? 'bg-white/90 border-pink-100 shadow-xl'
              : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
          } space-y-5`}>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <span>Pesapal API Credentials Setup</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your Pesapal Merchant Consumer Key & Consumer Secret to process live transactions.
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                pesapalForm.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {pesapalForm.status === 'connected' ? '🟢 Pesapal Verified' : '🟡 Keys Unverified'}
              </span>
            </div>

            {/* Environment Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Environment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setPesapalForm({ ...pesapalForm, environment: 'sandbox' });
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    pesapalForm.environment === 'sandbox'
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                      : 'bg-black/20 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-extrabold">Demo / Sandbox Mode</div>
                  <div className="text-[10px] opacity-75 font-mono">cybqa.pesapal.com/pesapalv3</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setPesapalForm({ ...pesapalForm, environment: 'live' });
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    pesapalForm.environment === 'live'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-black/20 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-extrabold">Live Production Mode</div>
                  <div className="text-[10px] opacity-75 font-mono">pay.pesapal.com/v3</div>
                </button>
              </div>
            </div>

            {/* Consumer Key */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Pesapal Consumer Key</span>
                <span className="text-[11px] text-emerald-400 font-mono">Required</span>
              </label>
              <input
                type="text"
                required
                value={pesapalForm.consumerKey}
                onChange={(e) => setPesapalForm({ ...pesapalForm, consumerKey: e.target.value })}
                placeholder="e.g. q1a2z3x4c5v6b7n8m9..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Consumer Secret */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Pesapal Consumer Secret</span>
                <span className="text-[11px] text-slate-400">Keep strictly confidential</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={pesapalForm.consumerSecret}
                  onChange={(e) => setPesapalForm({ ...pesapalForm, consumerSecret: e.target.value })}
                  placeholder="Paste Consumer Secret from Pesapal Merchant Dashboard"
                  className="w-full pl-4 pr-12 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* IPN ID & Callback URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Registered IPN Notification ID (Optional)
                </label>
                <input
                  type="text"
                  value={pesapalForm.ipnId || ''}
                  onChange={(e) => setPesapalForm({ ...pesapalForm, ipnId: e.target.value })}
                  placeholder="e.g. b89c-491a-821b"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Callback Redirect URL
                </label>
                <input
                  type="text"
                  value={pesapalForm.callbackUrl || ''}
                  onChange={(e) => setPesapalForm({ ...pesapalForm, callbackUrl: e.target.value })}
                  placeholder="https://viralcute.app/pesapal/callback"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs font-mono text-white"
                />
              </div>
            </div>

            {testSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{testSuccess}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestPesapalKeys}
                disabled={isTestingKeys}
                className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20"
              >
                {isTestingKeys ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Test Pesapal v3.0 Auth</span>
              </button>

              <button
                type="button"
                onClick={handleSavePesapalConfig}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95"
              >
                Save Pesapal Settings
              </button>
            </div>
          </div>

          {/* Guide to get Pesapal Keys */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-6 rounded-3xl border transition-colors ${
              isCuteLight
                ? 'bg-white/90 border-pink-100 shadow-xl'
                : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
            } space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Where to get Pesapal API Keys</span>
              </h4>

              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Register a merchant account at <a href="https://www.pesapal.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">pesapal.com</a> (or <a href="https://cybqa.pesapal.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">cybqa.pesapal.com</a> for sandbox).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>Log in and scroll to the bottom of your merchant dashboard or check your welcome email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Copy your <strong className="text-white">Consumer Key</strong> & <strong className="text-white">Consumer Secret</strong> and paste them in this form.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className={`p-6 rounded-3xl border transition-colors ${
          isCuteLight
            ? 'bg-white/90 border-pink-100 shadow-xl'
            : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
        } space-y-4`}>
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Deposit Transactions</span>
          </h3>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500">No deposit history yet.</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-black/20 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">
                      ${tx.amount.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {tx.date} • {tx.method} {tx.pesapalTrackingId ? `• Ref: ${tx.pesapalTrackingId}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {tx.status}
                    </span>
                    {tx.bonus > 0 && (
                      <div className="text-[10px] text-pink-400 font-semibold mt-0.5">
                        +${tx.bonus.toFixed(2)} bonus
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PESAPAL CHECKOUT MODAL */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl relative space-y-4">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-white">Pesapal Checkout Initiated</h3>
              <p className="text-xs text-slate-400">
                Payment request sent to Pesapal API v3.0
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking ID:</span>
                <span className="font-mono font-bold text-emerald-400">{checkoutModal.trackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono text-slate-300">{checkoutModal.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-white">{checkoutModal.currency} {checkoutModal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Phone:</span>
                <span className="font-bold text-slate-200">{phoneNumber}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 text-center">
              📱 Check your phone ({phoneNumber}) for the M-Pesa STK PIN prompt, or complete card payment on Pesapal.
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCompletePesapalPayment}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95"
              >
                Simulate Payment Approved & Credit Wallet
              </button>

              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
