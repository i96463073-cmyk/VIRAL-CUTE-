import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  FolderArchive,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Smartphone,
  Server,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { generateProjectZip } from '../utils/generateZip';
import { playSound } from '../utils/sound';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  isCuteLight: boolean;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  isCuteLight,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    playSound('pop', soundEnabled);

    try {
      const zipBlob = await generateProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `viralcute-smm-pesapal-v2.5.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadSuccess(true);
      playSound('chime', soundEnabled);

      try {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#10b981', '#06b6d4', '#f59e0b'],
        });
      } catch {}
    } catch (err) {
      console.error('ZIP generation failed:', err);
      setIsGenerating(false);
      alert('Failed to generate ZIP. Please try again.');
    }
  };

  const copyEnvSample = () => {
    const text = `PESAPAL_CONSUMER_KEY=your_key_here\nPESAPAL_CONSUMER_SECRET=your_secret_here\nPESAPAL_ENV=live\nPESAPAL_IPN_ID=your_ipn_id\nSMM_PROVIDER_URL=https://justanotherpanel.com/api/v2\nSMM_PROVIDER_KEY=your_provider_key`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    playSound('pop', soundEnabled);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`max-w-xl w-full p-6 sm:p-7 rounded-3xl border shadow-2xl relative space-y-5 transition-colors ${
          isCuteLight
            ? 'bg-white border-pink-200 text-slate-800'
            : 'bg-slate-900 border-pink-500/30 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                <span>Option Two: ViralCute ZIP Package</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Full standalone source code with Pesapal v3.0 Gateway & SMM API Provider.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-4 rounded-2xl bg-black/25 border border-slate-800 space-y-2.5 text-xs">
          <h4 className="font-extrabold text-slate-200 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-pink-400" />
            <span>What is included inside this ZIP:</span>
          </h4>

          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Complete Services + Place Order System:</strong> Instant search, 5 category filters (Instagram, TikTok, Facebook, YouTube, Telegram), auto-price calculation, and Order History.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Option Two (Real Pesapal v3.0 Gateway):</strong> M-Pesa STK push prompt, Airtel Money, Visa/Mastercard checkout, and Consumer Key/Secret inputs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Server className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Production Backend (<code>server/index.js</code>):</strong> Secure Node.js/Express server that safely holds your keys and handles token authentication and IPN callbacks without exposing them in the browser.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <span>
                <strong>Environment Template (<code>.env.example</code>) & README.md:</strong> Clear instructions to deploy on Vercel, Netlify, Render, Railway, or VPS.
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Env Preview */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 font-mono">.env (Configuration)</span>
            <button
              onClick={copyEnvSample}
              className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
            >
              {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEnv ? 'Copied' : 'Copy Example'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto bg-black/40 p-2 rounded-xl">
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_ENV=live
SMM_PROVIDER_URL=https://justanotherpanel.com/api/v2
SMM_PROVIDER_KEY=your_api_key
          </pre>
        </div>

        {/* Success message */}
        {downloadSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ZIP file created and downloaded successfully! Extract it and run <code>npm install && npm run dev</code>.</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownload}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-emerald-500 hover:from-pink-600 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Bundling Option Two ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Option Two ZIP (.zip)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
