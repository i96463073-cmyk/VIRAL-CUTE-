import {
  Wallet,
  Volume2,
  VolumeX,
  Server,
  Flame,
  Plus,
  Menu,
  X,
  Smartphone,
  FolderArchive,
} from 'lucide-react';
import { ProviderConfig, PesapalConfig } from './types';
import { playSound } from './sound';

interface NavbarProps {
  balance: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCuteLight: boolean;
  onToggleTheme: () => void;
  provider: ProviderConfig;
  pesapalConfig: PesapalConfig;
  onOpenAddFunds: () => void;
  onOpenDownloadZip: () => void;
  onNavigate: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  balance,
  soundEnabled,
  onToggleSound,
  isCuteLight,
  onToggleTheme,
  provider,
  pesapalConfig,
  onOpenAddFunds,
  onOpenDownloadZip,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
      isCuteLight 
        ? 'bg-white/85 border-pink-100 text-slate-800' 
        : 'bg-slate-950/80 border-slate-800/80 text-white'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('new-order')}>
            <div className="relative group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                  ViralCute
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded bg-pink-500/10 text-pink-500 border border-pink-500/20 uppercase">
                  Dual API
                </span>
              </div>
              <p className="text-[11px] text-pink-400/80 font-medium hidden sm:block">
                SMM API Provider & Pesapal Gateway Hub
              </p>
            </div>
          </div>

          {/* Center: Both External Provider & Pesapal Status Pills */}
          <div className="hidden lg:flex items-center gap-2">
            {/* SMM Provider API Pill */}
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onNavigate('api-provider');
              }}
              title="Click to configure external SMM panel API (Provider Key)"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                provider.status === 'connected'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${provider.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                SMM API: {provider.name ? provider.name.slice(0, 16) : 'External'}
              </span>
              <span className="text-[10px] opacity-75 bg-black/25 px-1.5 py-0.5 rounded">
                +{provider.markupPercent}%
              </span>
            </button>

            {/* Pesapal Gateway Pill */}
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onNavigate('add-funds');
              }}
              title="Click to configure Pesapal Consumer Key & Secret"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                pesapalConfig.status === 'connected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${pesapalConfig.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                Pesapal API: {pesapalConfig.environment === 'live' ? 'Live' : 'Sandbox'}
              </span>
            </button>
          </div>

          {/* Right Actions: Balance, Download ZIP, Sound, Theme, Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Generate ZIP for Option Two button */}
            <button
              onClick={() => {
                playSound('sparkle', soundEnabled);
                onOpenDownloadZip();
              }}
              title="Download standalone code ZIP (Option Two: Pesapal & SMM Panel)"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-500 hover:opacity-90 shadow-sm shadow-purple-500/25 active:scale-95 transition-all flex items-center gap-1.5 border border-white/10"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </button>

            {/* Balance Pill */}
            <div className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-2xl border ${
              isCuteLight 
                ? 'bg-pink-50/70 border-pink-200/80 text-pink-950' 
                : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-inner'
            }`}>
              <div className="flex items-center gap-1.5 text-xs">
                <Wallet className="w-3.5 h-3.5 text-pink-500" />
                <span className="hidden sm:inline text-slate-400">Balance:</span>
                <span className="font-extrabold text-pink-500 text-sm">
                  ${balance.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  playSound('coin', soundEnabled);
                  onOpenAddFunds();
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-pink-500 rounded-xl hover:opacity-90 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>Deposit</span>
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) playSound('chime', true);
              }}
              title={soundEnabled ? 'Mute UI sounds' : 'Enable cute sound effects'}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-500'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Cute Pastel / Dark Mode Toggle */}
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onToggleTheme();
              }}
              title={isCuteLight ? 'Switch to Cyber-Candy Dark' : 'Switch to Pastel-Chic Light'}
              className="p-2 rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/15 text-pink-400 transition-all text-xs flex items-center gap-1"
            >
              <span>{isCuteLight ? '🌙' : '🌸'}</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
