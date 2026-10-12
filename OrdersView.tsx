import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Copy,
  Check,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { PlatformBadge } from './PlatformIcons';
import { playSound } from '../utils/sound';

interface OrdersViewProps {
  orders: Order[];
  onRefillOrder: (orderId: number) => void;
  onSimulateProgress: () => void;
  onReOrder: (serviceId: number) => void;
  onPlaceNewOrder: () => void;
  soundEnabled: boolean;
  isCuteLight: boolean;
  currencySymbol?: string;
  currencyRate?: number;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onRefillOrder,
  onSimulateProgress,
  onReOrder,
  onPlaceNewOrder,
  soundEnabled,
  isCuteLight,
  currencySymbol = 'KES',
  currencyRate = 130,
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const statuses: (OrderStatus | 'All')[] = [
    'All',
    'Pending',
    'In Progress',
    'Processing',
    'Completed',
    'Partial',
    'Canceled',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus !== 'All' && o.status !== filterStatus) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        String(o.id).includes(q) ||
        o.serviceName.toLowerCase().includes(q) ||
        o.link.toLowerCase().includes(q)
      );
    });
  }, [orders, filterStatus, search]);

  const copyToClipboard = (text: string, orderId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    playSound('pop', soundEnabled);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Processing</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <span>Partial</span>
          </span>
        );
      case 'Canceled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span>Canceled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
                <History className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <span>Order History & Real-Time Tracking</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                    {orders.length} Total
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track delivery progress, review target links, refill orders, or test simulation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                playSound('pop', soundEnabled);
                onPlaceNewOrder();
              }}
              className="px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:opacity-95 flex items-center gap-1.5 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 fill-current" />
              <span>Place Order</span>
            </button>

            <button
              onClick={() => {
                playSound('chime', soundEnabled);
                onSimulateProgress();
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Progress</span>
            </button>
          </div>
        </div>

        {/* User Account / Session indicator */}
        <div className="p-3 mb-5 rounded-2xl bg-black/25 border border-slate-800 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Logged in as: <strong className="text-white">Customer Account (#VC-USER-892)</strong></span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            <span>All orders saved to local account session</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-5">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, service, link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isCuteLight
                  ? 'bg-slate-50 border-pink-200 text-slate-800'
                  : 'bg-slate-950/70 border-slate-700 text-slate-100'
              }`}
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            {statuses.map((st) => {
              const count =
                st === 'All' ? orders.length : orders.filter((o) => o.status === st).length;
              const isActive = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setFilterStatus(st);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-extrabold'
                      : isCuteLight
                      ? 'bg-slate-100 text-slate-600 border-slate-200 hover:border-amber-300'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <span>{st}</span>
                  <span className="ml-1 opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                isCuteLight ? 'bg-pink-50/50 border-pink-100 text-slate-600' : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Service & Target Link</th>
                <th className="py-3 px-4">Total Price</th>
                <th className="py-3 px-4">Quantity / Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    <p>No orders found matching the filter.</p>
                    <button
                      onClick={onPlaceNewOrder}
                      className="mt-2 text-xs text-pink-400 underline font-bold"
                    >
                      Click here to place a new order
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const delivered = Math.max(0, order.quantity - order.remains);
                  const percent = Math.min(100, Math.round((delivered / order.quantity) * 100));
                  const kesPrice = Math.round(order.charge * currencyRate);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isCuteLight ? 'hover:bg-pink-50/30' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-pink-400">
                        #{order.id}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {order.createdAt}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <PlatformBadge platform={order.platform} showName={false} />
                          <span className="font-bold text-slate-200 truncate">
                            {order.serviceName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-pink-400">
                          <a
                            href={order.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-[190px]"
                          >
                            {order.link}
                          </a>
                          <button
                            onClick={() => copyToClipboard(order.link, order.id)}
                            className="text-slate-400 hover:text-white"
                            title="Copy link"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        <div>{currencySymbol} {kesPrice.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ${order.charge.toFixed(2)} USD
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-bold">
                            {delivered.toLocaleString()} / {order.quantity.toLocaleString()}
                          </span>
                          <span className="text-pink-400 font-semibold">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-amber-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {order.providerNote && (
                          <div className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={order.providerNote}>
                            {order.providerNote}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              playSound('sparkle', soundEnabled);
                              onRefillOrder(order.id);
                            }}
                            title="Request Refill for dropped counts"
                            className="px-2.5 py-1 text-xs font-bold rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 flex items-center gap-1 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refill</span>
                          </button>
                          <button
                            onClick={() => {
                              playSound('pop', soundEnabled);
                              onReOrder(order.serviceId);
                            }}
                            title="Order again with same service"
                            className="px-2 py-1 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                          >
                            Re-Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
