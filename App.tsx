import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, NavTab } from './Sidebar';
import { NewOrderView } from './NewOrderView';
import { MassOrderView } from './MassOrderView';
import { ServicesView } from './ServicesView';
import { OrdersView } from './OrdersView';
import { ApiProviderView } from './ApiProviderView';
import { ApiDocsView } from './ApiDocsView';
import { AddFundsView } from './AddFundsView';
import { SupportView } from './SupportView';
import { DownloadZipModal } from './DownloadZipModal';
import { INITIAL_SERVICES, INITIAL_ORDERS } from './mockServices';
import { Service, Order, ProviderConfig, PesapalConfig, Transaction } from './types';
import { playSound } from './sound';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('new-order');
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('vc_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vc_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('vc_balance');
    return saved ? parseFloat(saved) : 58.50;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCuteLight, setIsCuteLight] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | null>(null);

  // 1. External SMM Provider API Configuration (Where you get services from another website)
  const [provider, setProvider] = useState<ProviderConfig>(() => {
    const saved = localStorage.getItem('vc_provider');
    if (saved) return JSON.parse(saved);
    return {
      id: 'prov_1',
      name: 'JustAnotherPanel (v2 API)',
      apiUrl: 'https://justanotherpanel.com/api/v2',
      apiKey: '8df9a8f273b019c4d929b311728e9a21',
      markupPercent: 30,
      autoForward: true,
      currency: 'USD',
      balance: 142.80,
      status: 'connected',
      lastSync: 'Today, 14:10',
      totalSyncedServices: 19,
      lastHttpCode: 200,
    };
  });

  // 2. Pesapal Payment Gateway API Configuration (Consumer Key & Consumer Secret)
  const [pesapalConfig, setPesapalConfig] = useState<PesapalConfig>(() => {
    const saved = localStorage.getItem('vc_pesapal');
    if (saved) return JSON.parse(saved);
    return {
      consumerKey: 'qk1sv9qWssx4n4/4vL2a9fA1fR+P0wG4',
      consumerSecret: 't2X5Z6+g7k8p9m0n1b2v3c4x5z6a7s8d',
      environment: 'sandbox',
      currency: 'KES',
      ipnId: 'b9421890-4819-4820-9128-482910382910',
      callbackUrl: 'https://viralcute.app/pesapal/callback',
      status: 'connected',
      lastTested: 'Just now',
      lastToken: 'pp_tok_live_sandbox_94821',
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-9021',
      date: '2026-03-30 11:00',
      method: 'Pesapal (Safaricom M-Pesa)',
      amount: 25.0,
      bonus: 1.25,
      status: 'Completed',
      pesapalTrackingId: 'pesa_mpesa_9482190',
    },
    {
      id: 'TXN-8942',
      date: '2026-03-27 15:30',
      method: 'Credit Card (Pesapal 3D Secure)',
      amount: 50.0,
      bonus: 10.0,
      status: 'Completed',
      pesapalTrackingId: 'pesa_card_849201',
    },
  ]);

  // Persist state
  useEffect(() => {
    localStorage.setItem('vc_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('vc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vc_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('vc_provider', JSON.stringify(provider));
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('vc_pesapal', JSON.stringify(pesapalConfig));
  }, [pesapalConfig]);

  // Handle new single order
  const handleOrderPlaced = (newOrder: Order, newBalance: number) => {
    setOrders([newOrder, ...orders]);
    setBalance(Number(newBalance.toFixed(2)));
  };

  // Handle batch orders
  const handleBatchOrdersPlaced = (newOrders: Order[], totalCharge: number) => {
    setOrders([...newOrders, ...orders]);
    setBalance((prev) => Number(Math.max(0, prev - totalCharge).toFixed(2)));
  };

  // Handle Add Funds
  const handleAddFunds = (amount: number, bonus: number, method: string, meta?: any) => {
    const total = amount + bonus;
    setBalance((prev) => Number((prev + total).toFixed(2)));
    const newTx: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      method,
      amount,
      bonus,
      status: 'Completed',
      pesapalTrackingId: meta?.trackingId,
      reference: meta?.reference,
    };
    setTransactions([newTx, ...transactions]);
  };

  // Quick Order from Services Catalog: opens Place Order page with service selected
  const handleQuickOrder = (serviceId: number) => {
    setPreselectedServiceId(serviceId);
    setCurrentTab('new-order');
    playSound('pop', soundEnabled);
  };

  // Refill order handler
  const handleRefillOrder = (orderId: number) => {
    playSound('chime', soundEnabled);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'In Progress',
            providerNote: `Refill #${Math.floor(10000 + Math.random() * 90000)} queued for provider API dispatch`,
          };
        }
        return o;
      })
    );
    alert(`💖 Refill requested for Order #${orderId}! Replacement delivery is processing.`);
  };

  // Simulate progress on orders
  const handleSimulateProgress = () => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.status === 'Completed' || order.status === 'Canceled') return order;
        const step = Math.ceil(order.quantity * 0.25);
        const newRemains = Math.max(0, order.remains - step);
        const newStatus = newRemains === 0 ? 'Completed' : 'In Progress';
        return {
          ...order,
          remains: newRemains,
          status: newStatus,
        };
      })
    );
  };

  // Import services synced from API provider
  const handleImportServices = (newServices: Service[]) => {
    setServices(newServices);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isCuteLight
          ? 'bg-gradient-to-br from-pink-50 via-rose-50/50 to-purple-50 text-slate-800'
          : 'bg-[#090b12] text-slate-100'
      } selection:bg-pink-500 selection:text-white relative overflow-x-hidden`}
    >
      {/* Background ambient cute glow orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Navbar with both SMM Provider API & Pesapal Gateway status */}
      <Navbar
        balance={balance}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCuteLight={isCuteLight}
        onToggleTheme={() => setIsCuteLight(!isCuteLight)}
        provider={provider}
        pesapalConfig={pesapalConfig}
        onOpenAddFunds={() => setCurrentTab('add-funds')}
        onOpenDownloadZip={() => setIsZipModalOpen(true)}
        onNavigate={(tab) => {
          setCurrentTab(tab as NavTab);
          setMobileMenuOpen(false);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden mb-6 animate-fade-in">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              ordersCount={orders.length}
              servicesCount={services.length}
              soundEnabled={soundEnabled}
              isCuteLight={isCuteLight}
              pesapalConfigured={pesapalConfig.status === 'connected'}
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block sticky top-20">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
              ordersCount={orders.length}
              servicesCount={services.length}
              soundEnabled={soundEnabled}
              isCuteLight={isCuteLight}
              pesapalConfigured={pesapalConfig.status === 'connected'}
            />
          </div>

          {/* Tab Views */}
          <div className="flex-1 w-full min-w-0">
            {currentTab === 'new-order' && (
              <NewOrderView
                services={services}
                balance={balance}
                provider={provider}
                onOrderPlaced={handleOrderPlaced}
                onOpenAddFunds={() => setCurrentTab('add-funds')}
                onViewOrders={() => setCurrentTab('orders')}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
                preselectedServiceId={preselectedServiceId}
                currencySymbol="KES"
                currencyRate={130}
              />
            )}

            {currentTab === 'services' && (
              <ServicesView
                services={services}
                onQuickOrder={handleQuickOrder}
                onNavigateToApi={() => setCurrentTab('api-provider')}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
                currencySymbol="KES"
                currencyRate={130}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersView
                orders={orders}
                onRefillOrder={handleRefillOrder}
                onSimulateProgress={handleSimulateProgress}
                onReOrder={handleQuickOrder}
                onPlaceNewOrder={() => setCurrentTab('new-order')}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
                currencySymbol="KES"
                currencyRate={130}
              />
            )}

            {currentTab === 'mass-order' && (
              <MassOrderView
                services={services}
                balance={balance}
                provider={provider}
                onBatchOrdersPlaced={handleBatchOrdersPlaced}
                onOpenAddFunds={() => setCurrentTab('add-funds')}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
              />
            )}

            {currentTab === 'api-provider' && (
              <ApiProviderView
                provider={provider}
                onUpdateProvider={setProvider}
                onImportServices={handleImportServices}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
              />
            )}

            {currentTab === 'add-funds' && (
              <AddFundsView
                balance={balance}
                onAddFunds={handleAddFunds}
                transactions={transactions}
                soundEnabled={soundEnabled}
                isCuteLight={isCuteLight}
                pesapalConfig={pesapalConfig}
                onUpdatePesapalConfig={setPesapalConfig}
              />
            )}

            {currentTab === 'api-docs' && (
              <ApiDocsView soundEnabled={soundEnabled} isCuteLight={isCuteLight} />
            )}

            {currentTab === 'support' && (
              <SupportView soundEnabled={soundEnabled} isCuteLight={isCuteLight} />
            )}
          </div>
        </div>
      </main>

      {/* Option Two Download ZIP Modal */}
      <DownloadZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        soundEnabled={soundEnabled}
        isCuteLight={isCuteLight}
      />

      {/* Cute Footer */}
      <footer className={`border-t mt-16 py-6 transition-colors ${
        isCuteLight ? 'bg-white/50 border-pink-100 text-slate-500' : 'bg-slate-950/60 border-slate-900 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-1">
          <p className="font-semibold text-slate-400">
            ViralCute SMM Panel • Powered by External SMM Provider API + Pesapal Payment Gateway 🌸
          </p>
          <p className="text-[11px] text-slate-600">
            Accept M-Pesa, Airtel & Cards with Pesapal API v3.0 • Auto-sync services & dispatch orders to external SMM panels
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;
