import React from 'react';
import {
  Layers,
  ListFilter,
  History,
  Radio,
  Code2,
  Smartphone,
  MessageCircleQuestion,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';
import { playSound } from './sound';

export type NavTab =
  | 'new-order'
  | 'services'
  | 'orders'
  | 'mass-order'
  | 'api-provider'
  | 'api-docs'
  | 'add-funds'
  | 'support';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  ordersCount: number;
  servicesCount: number;
  soundEnabled: boolean;
  isCuteLight: boolean;
  pesapalConfigured?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  ordersCount,
  servicesCount,
  soundEnabled,
  isCuteLight,
  pesapalConfigured = true,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    highlight?: boolean;
  }[] = [
    {
      id: 'new-order',
      label: 'Place Order',
      icon: <ShoppingBag className="w-4 h-4 text-pink-400" />,
      highlight: true,
      badge: 'Order',
    },
    {
      id: 'services',
      label: 'Services Catalog',
      icon: <ListFilter className="w-4 h-4 text-cyan-400" />,
      badge: servicesCount,
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: <History className="w-4 h-4 text-amber-400" />,
      badge: ordersCount,
    },
    {
      id: 'mass-order',
      label: 'Mass Order',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'api-provider',
      label: 'SMM Provider API',
      icon: <Radio className="w-4 h-4 text-rose-400" />,
      badge: 'API 1',
    },
    {
      id: 'add-funds',
      label: 'Pesapal Gateway & Funds',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      badge: pesapalConfigured ? 'API 2' : 'Setup',
    },
    {
      id: 'api-docs',
      label: 'Reseller API Docs',
      icon: <Code2 className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'support',
      label: 'Cute Support',
      icon: <MessageCircleQuestion className="w-4 h-4 text-fuchsia-400" />,
    },
  ];

  return (
    <aside
      className={`w-full md:w-64 shrink-0 rounded-3xl p-4 border transition-colors ${
        isCuteLight
          ? 'bg-white/80 border-pink-100 shadow-sm'
          : 'bg-slate-900/60 border-slate-800/80 backdrop-blur-xl'
      }`}
    >
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Main Navigation</span>
          <span className="text-[10px] text-pink-500 font-semibold">ViralCute SMM</span>
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound('pop', soundEnabled);
                onSelectTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-transparent text-pink-400 border border-pink-500/30 shadow-sm'
                  : isCuteLight
                  ? 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                      : isCuteLight
                      ? 'bg-slate-100'
                      : 'bg-slate-800/80'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-pink-500 text-white'
                      : item.badge === 'Order'
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : item.badge === 'API 1'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : item.badge === 'API 2'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isCuteLight
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => {
            playSound('pop', soundEnabled);
            onSelectTab('new-order');
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 hover:opacity-95 transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 fill-current" />
          <span>Place Order</span>
        </button>

        <button
          onClick={() => {
            playSound('pop', soundEnabled);
            onSelectTab('orders');
          }}
          className="w-full py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>View Orders</span>
        </button>
      </div>

      {/* Dual API status mini widget */}
      <div className="mt-4 p-3.5 rounded-2xl bg-black/30 border border-slate-800 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          API Integration Status
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>SMM Provider:</span>
          </span>
          <span className="text-purple-400 font-bold font-mono text-[11px]">Ready</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pesapal:</span>
          </span>
          <span className="text-emerald-400 font-bold font-mono text-[11px]">v3.0 Ready</span>
        </div>
      </div>

      {/* Quick Help Link */}
      <div className="mt-4 px-2 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => {
            playSound('pop', soundEnabled);
            onSelectTab('support');
          }}
          className="hover:text-pink-400 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Support</span>
        </button>
        <span className="text-[10px] text-slate-500">v2.5 PRO</span>
      </div>
    </aside>
  );
};
