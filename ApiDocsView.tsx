import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ApiDocsViewProps {
  soundEnabled: boolean;
  isCuteLight: boolean;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ soundEnabled, isCuteLight }) => {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python' | 'php'>('curl');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    playSound('pop', soundEnabled);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeExamples = {
    curl: {
      services: `curl -X POST https://viralcute.app/api/v2 \\
  -d "key=YOUR_API_KEY" \\
  -d "action=services"`,
      add: `curl -X POST https://viralcute.app/api/v2 \\
  -d "key=YOUR_API_KEY" \\
  -d "action=add" \\
  -d "service=101" \\
  -d "link=https://tiktok.com/@cutestar" \\
  -d "quantity=1000"`,
      status: `curl -X POST https://viralcute.app/api/v2 \\
  -d "key=YOUR_API_KEY" \\
  -d "action=status" \\
  -d "order=84920"`,
      balance: `curl -X POST https://viralcute.app/api/v2 \\
  -d "key=YOUR_API_KEY" \\
  -d "action=balance"`,
    },
    javascript: {
      services: `const response = await fetch("https://viralcute.app/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "YOUR_API_KEY",
    action: "services"
  })
});
const services = await response.json();
console.log(services);`,
      add: `const response = await fetch("https://viralcute.app/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "YOUR_API_KEY",
    action: "add",
    service: "101",
    link: "https://tiktok.com/@cutestar",
    quantity: "1000"
  })
});
const result = await response.json(); // { order: 84920 }`,
      status: `const response = await fetch("https://viralcute.app/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "YOUR_API_KEY",
    action: "status",
    order: "84920"
  })
});
const status = await response.json();`,
      balance: `const response = await fetch("https://viralcute.app/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "YOUR_API_KEY",
    action: "balance"
  })
});
const { balance, currency } = await response.json();`,
    },
    python: {
      services: `import requests

url = "https://viralcute.app/api/v2"
payload = {
    "key": "YOUR_API_KEY",
    "action": "services"
}
response = requests.post(url, data=payload)
print(response.json())`,
      add: `import requests

url = "https://viralcute.app/api/v2"
payload = {
    "key": "YOUR_API_KEY",
    "action": "add",
    "service": 101,
    "link": "https://tiktok.com/@cutestar",
    "quantity": 1000
}
order = requests.post(url, data=payload).json()
print("Order created:", order["order"])`,
      status: `import requests

url = "https://viralcute.app/api/v2"
payload = {"key": "YOUR_API_KEY", "action": "status", "order": 84920}
status = requests.post(url, data=payload).json()
print(status)`,
      balance: `import requests

url = "https://viralcute.app/api/v2"
payload = {"key": "YOUR_API_KEY", "action": "balance"}
bal = requests.post(url, data=payload).json()
print(f"Balance: {bal['balance']} {bal['currency']}")`,
    },
    php: {
      services: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://viralcute.app/api/v2");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'key' => 'YOUR_API_KEY',
  'action' => 'services'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
print_r(json_decode($result, true));`,
      add: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://viralcute.app/api/v2");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'key' => 'YOUR_API_KEY',
  'action' => 'add',
  'service' => 101,
  'link' => 'https://tiktok.com/@cutestar',
  'quantity' => 1000
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$order = json_decode(curl_exec($ch), true);
curl_close($ch);`,
      status: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://viralcute.app/api/v2");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'key' => 'YOUR_API_KEY',
  'action' => 'status',
  'order' => 84920
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$status = json_decode(curl_exec($ch), true);`,
      balance: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://viralcute.app/api/v2");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'key' => 'YOUR_API_KEY',
  'action' => 'balance'
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$balance = json_decode(curl_exec($ch), true);`,
    },
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
              <Code2 className="w-5 h-5 text-blue-400" />
              <span>ViralCute Reseller API Docs</span>
            </h2>
            <p className="text-xs text-slate-400">
              Integrate ViralCute into your own website, Discord bot, or mobile app using our SMM v2 REST API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Your API Key:</span>
            <code className="text-xs font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1.5 rounded-xl">
              vc_live_948271039840283
            </code>
            <button
              onClick={() => handleCopy('vc_live_948271039840283', 'user_key')}
              className="p-1.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300"
            >
              {copiedKey === 'user_key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(['curl', 'javascript', 'python', 'php'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                playSound('pop', soundEnabled);
                setSelectedLang(lang);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedLang === lang
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-black/20 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          
          {/* Action: Add Order */}
          <div className="p-5 rounded-2xl bg-black/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  action=add (Place New Order)
                </span>
              </div>
              <button
                onClick={() => handleCopy(codeExamples[selectedLang].add, 'add')}
                className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copiedKey === 'add' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-pink-300 overflow-x-auto">
              {codeExamples[selectedLang].add}
            </pre>

            <div className="text-xs text-slate-400">
              <span className="font-bold text-slate-300">Success Response:</span>
              <pre className="mt-1 font-mono text-[11px] text-emerald-400 bg-slate-950 p-2 rounded-lg">
                {`{ "order": 84920 }`}
              </pre>
            </div>
          </div>

          {/* Action: Service List */}
          <div className="p-5 rounded-2xl bg-black/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  action=services (Service List)
                </span>
              </div>
              <button
                onClick={() => handleCopy(codeExamples[selectedLang].services, 'services')}
                className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copiedKey === 'services' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-blue-300 overflow-x-auto">
              {codeExamples[selectedLang].services}
            </pre>
          </div>

          {/* Action: Status */}
          <div className="p-5 rounded-2xl bg-black/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  action=status (Check Order Status)
                </span>
              </div>
              <button
                onClick={() => handleCopy(codeExamples[selectedLang].status, 'status')}
                className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copiedKey === 'status' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-amber-300 overflow-x-auto">
              {codeExamples[selectedLang].status}
            </pre>
          </div>

          {/* Action: Balance */}
          <div className="p-5 rounded-2xl bg-black/30 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500 text-white">
                  POST
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  action=balance (Account Balance)
                </span>
              </div>
              <button
                onClick={() => handleCopy(codeExamples[selectedLang].balance, 'balance')}
                className="text-xs text-slate-400 hover:text-pink-400 flex items-center gap-1"
              >
                {copiedKey === 'balance' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 overflow-x-auto">
              {codeExamples[selectedLang].balance}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
