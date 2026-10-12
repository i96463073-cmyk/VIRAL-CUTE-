import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Layers, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { Service, Order, ProviderConfig } from '../types';
import { playSound } from '../utils/sound';

interface MassOrderViewProps {
  services: Service[];
  balance: number;
  provider: ProviderConfig;
  onBatchOrdersPlaced: (orders: Order[], totalCharge: number) => void;
  onOpenAddFunds: () => void;
  soundEnabled: boolean;
  isCuteLight: boolean;
}

export const MassOrderView: React.FC<MassOrderViewProps> = ({
  services,
  balance,
  onBatchOrdersPlaced,
  onOpenAddFunds,
  soundEnabled,
  isCuteLight,
}) => {
  const [content, setContent] = useState('');
  const [parsedRows, setParsedRows] = useState<{
    raw: string;
    valid: boolean;
    serviceId?: number;
    service?: Service;
    link?: string;
    quantity?: number;
    charge?: number;
    error?: string;
  }[]>([]);

  const handleParse = (text: string) => {
    setContent(text);
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const parsed = lines.map((line) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length < 3) {
        return {
          raw: line,
          valid: false,
          error: 'Format must be: service_id|link|quantity',
        };
      }

      const sId = Number(parts[0]);
      const link = parts[1];
      const qty = Number(parts[2]);

      if (isNaN(sId) || !link || isNaN(qty) || qty <= 0) {
        return {
          raw: line,
          valid: false,
          error: 'Invalid numbers or missing link',
        };
      }

      const foundService = services.find((s) => s.id === sId);
      if (!foundService) {
        return {
          raw: line,
          valid: false,
          error: `Service #${sId} not found in catalog`,
        };
      }

      if (qty < foundService.min || qty > foundService.max) {
        return {
          raw: line,
          valid: false,
          error: `Qty must be between ${foundService.min} and ${foundService.max}`,
        };
      }

      const itemCharge = Number(((qty / 1000) * foundService.rate).toFixed(3));
      return {
        raw: line,
        valid: true,
        serviceId: sId,
        service: foundService,
        link,
        quantity: qty,
        charge: itemCharge,
      };
    });

    setParsedRows(parsed);
  };

  const validRows = parsedRows.filter((r) => r.valid);
  const totalCost = validRows.reduce((sum, r) => sum + (r.charge || 0), 0);
  const hasEnough = balance >= totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validRows.length === 0) {
      alert('Please enter at least one valid line in format: service_id|link|quantity');
      return;
    }

    if (!hasEnough) {
      playSound('cancel', soundEnabled);
      alert('Insufficient funds for this batch!');
      onOpenAddFunds();
      return;
    }

    const newOrders: Order[] = validRows.map((r, i) => ({
      id: Math.floor(200000 + Math.random() * 800000) + i,
      serviceId: r.serviceId!,
      serviceName: r.service!.name,
      platform: r.service!.platform,
      link: r.link!,
      quantity: r.quantity!,
      charge: r.charge!,
      startCount: 0,
      remains: r.quantity!,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      apiForwarded: true,
    }));

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    playSound('chime', soundEnabled);
    onBatchOrdersPlaced(newOrders, totalCost);
    setContent('');
    setParsedRows([]);
    alert(`Success! ${newOrders.length} orders created for total $${totalCost.toFixed(2)}.`);
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>Mass Bulk Order Tool</span>
            </h2>
            <p className="text-xs text-slate-400">
              Submit hundreds of orders in one click using the standard pipe format.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
            Format: service_id|link|quantity
          </span>
        </div>

        {/* Example card */}
        <div className="p-3.5 mb-4 rounded-2xl bg-black/30 border border-slate-800 text-xs">
          <span className="font-bold text-pink-400">Quick Example (Copy & paste to try):</span>
          <pre className="mt-1 font-mono text-[11px] text-slate-300 overflow-x-auto bg-slate-950 p-2 rounded-xl">
101|https://www.tiktok.com/@cutecat|1000
202|https://www.instagram.com/p/sample123|500
103|https://www.tiktok.com/@cutecat/video/1|5000
          </pre>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="101|https://www.tiktok.com/@username|1000&#10;202|https://www.instagram.com/p/postid|500"
              className={`w-full p-4 rounded-2xl font-mono text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isCuteLight
                  ? 'bg-slate-50 border-pink-200 text-slate-800'
                  : 'bg-slate-950/80 border-slate-700 text-slate-100'
              }`}
            />
          </div>

          {/* Real-time Parser Results */}
          {parsedRows.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">
                  Detected {parsedRows.length} lines ({validRows.length} valid, {parsedRows.length - validRows.length} invalid)
                </span>
                <span className="text-pink-400 font-extrabold text-sm">
                  Total: ${totalCost.toFixed(3)}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {parsedRows.map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                      r.valid
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {r.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate">{r.raw}</span>
                    </div>

                    <div className="shrink-0 text-right">
                      {r.valid ? (
                        <span className="font-bold text-white">${r.charge?.toFixed(3)}</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-400">{r.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              Current balance: <span className="font-bold text-white">${balance.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={validRows.length === 0 || !hasEnough}
              className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
                validRows.length > 0 && hasEnough
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:opacity-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Submit {validRows.length} Mass Orders</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
