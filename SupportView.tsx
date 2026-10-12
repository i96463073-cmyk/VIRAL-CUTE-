import React, { useState } from 'react';
import {
  MessageCircleQuestion,
  Send,
  Plus,
} from 'lucide-react';
import { SupportTicket } from './types';
import { playSound } from './sound';

interface SupportViewProps {
  soundEnabled: boolean;
  isCuteLight: boolean;
}

export const SupportView: React.FC<SupportViewProps> = ({ soundEnabled, isCuteLight }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-8819',
      subject: 'External API Provider auto-sync question',
      orderId: 84920,
      status: 'Answered',
      createdAt: '2026-03-30 12:45',
      messages: [
        {
          id: '1',
          sender: 'user',
          name: 'You',
          text: 'Hi! Can I connect my JustAnotherPanel API key and set a 30% profit markup on all TikTok services?',
          timestamp: '12:45',
        },
        {
          id: '2',
          sender: 'support',
          name: 'ViralCute Support 💖',
          text: 'Hello! Yes, absolutely! Go to the "Provider API Sync" tab, paste your Provider API URL and Key, adjust the markup slider to +30%, and click "Sync Services". Your panel will automatically resell with your profit added!',
          timestamp: '12:47',
        },
      ],
    },
    {
      id: 'TCK-8812',
      subject: 'Refill requested for Instagram Likes',
      orderId: 84918,
      status: 'Closed',
      createdAt: '2026-03-29 16:10',
      messages: [
        {
          id: '1',
          sender: 'user',
          name: 'You',
          text: 'Refill requested for order #84918. Start count was 450.',
          timestamp: '16:10',
        },
        {
          id: '2',
          sender: 'bot',
          name: 'Auto-Refill Bot 🤖',
          text: 'Refill trigger sent to provider API! Delivery completed and verified.',
          timestamp: '16:15',
        },
      ],
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>('TCK-8819');
  const [newMsg, setNewMsg] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newOrderId, setNewOrderId] = useState('');
  const [newInitialMsg, setNewInitialMsg] = useState('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeTicket) return;

    playSound('pop', soundEnabled);
    const userText = newMsg.trim();
    const userMsgObj = {
      id: String(Date.now()),
      sender: 'user' as const,
      name: 'You',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: 'Open' as const,
          messages: [...t.messages, userMsgObj],
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setNewMsg('');

    // Cute automatic response after brief timeout
    setTimeout(() => {
      playSound('sparkle', soundEnabled);
      let replyText = 'Thanks for your message! Our cute support team and API automation are reviewing your request right now. Rest assured your order and API stream are safe.';
      const lower = userText.toLowerCase();

      if (lower.includes('api') || lower.includes('provider') || lower.includes('key')) {
        replyText = 'Regarding API: You can manage your external provider endpoint in the "Provider API Sync" tab! If you experience CORS restrictions, you can paste raw JSON directly or use our built-in Sandbox tester.';
      } else if (lower.includes('refill') || lower.includes('drop')) {
        replyText = 'Refill check initiated! If the service has a 💖 Refill badge, click "Refill" in your Orders Tracking tab to trigger an instant replacement refill.';
      } else if (lower.includes('balance') || lower.includes('deposit') || lower.includes('money')) {
        replyText = 'All deposits are processed instantly. Remember you can use promo code VIRALCUTE20 for an extra 20% bonus!';
      }

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === activeTicket.id) {
            return {
              ...t,
              status: 'Answered' as const,
              messages: [
                ...t.messages,
                {
                  id: String(Date.now() + 1),
                  sender: 'support',
                  name: 'ViralCute Specialist 🌸',
                  text: replyText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          }
          return t;
        })
      );
    }, 1000);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMsg.trim()) return;

    playSound('chime', soundEnabled);
    const newId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const created: SupportTicket = {
      id: newId,
      subject: newSubject.trim(),
      orderId: newOrderId ? Number(newOrderId) : undefined,
      status: 'Open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      messages: [
        {
          id: '1',
          sender: 'user',
          name: 'You',
          text: newInitialMsg.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setTickets([created, ...tickets]);
    setSelectedTicketId(newId);
    setIsCreatingTicket(false);
    setNewSubject('');
    setNewOrderId('');
    setNewInitialMsg('');
  };

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-colors ${
        isCuteLight
          ? 'bg-white/90 border-pink-100 shadow-xl shadow-pink-500/5'
          : 'bg-slate-900/80 border-slate-800/80 backdrop-blur-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-fuchsia-400" />
              <span>ViralCute 24/7 Help & Support</span>
            </h2>
            <p className="text-xs text-slate-400">
              Have questions about your external SMM provider API or order refills? Chat with our team.
            </p>
          </div>

          <button
            onClick={() => {
              playSound('pop', soundEnabled);
              setIsCreatingTicket(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-fuchsia-500/25 flex items-center gap-1.5 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Open New Ticket</span>
          </button>
        </div>

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket list */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Your Tickets ({tickets.length})
            </h4>

            {tickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    playSound('pop', soundEnabled);
                    setSelectedTicketId(t.id);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/40 shadow-sm'
                      : 'bg-black/20 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-fuchsia-400">
                      #{t.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Answered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'Open'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-200 line-clamp-1">{t.subject}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {t.createdAt} {t.orderId ? `• Order #${t.orderId}` : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Ticket Chat Box */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-800 bg-black/30 overflow-hidden min-h-[420px]">
            {activeTicket ? (
              <>
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-fuchsia-400">
                      {activeTicket.id}:
                    </span>{' '}
                    <span className="text-xs font-bold text-white">{activeTicket.subject}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Status: <span className="font-bold text-emerald-400">{activeTicket.status}</span>
                  </span>
                </div>

                {/* Messages scroll */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[320px]">
                  {activeTicket.messages.map((m) => {
                    const isMe = m.sender === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0 text-xs shadow-md shadow-pink-500/25">
                            🌸
                          </div>
                        )}
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-br-none shadow-md shadow-pink-500/20'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                            <span className="font-bold">{m.name}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type your response to support..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold text-xs shadow-sm hover:opacity-95 flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select a ticket to view conversation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-fuchsia-500/40 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white">Open Support Ticket</h3>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need help connecting my provider API"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Order ID (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 84920"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your issue or question..."
                  value={newInitialMsg}
                  onChange={(e) => setNewInitialMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-bold text-xs shadow-md shadow-fuchsia-500/30"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
