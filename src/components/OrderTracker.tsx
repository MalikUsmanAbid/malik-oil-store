import React, { useState } from 'react';
import SecurityChallenge from './SecurityChallenge';
export default function OrderTracker() {
  const [invoice, setInvoice] = useState('');
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState('');
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  async function track(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !challenge) return;
    setBusy(true); setError(''); setOrder(null);
    try {
      const base = import.meta.env.VITE_ORDER_API_URL;
      if (!base) throw new Error('Tracking setup pending. Please contact the shop.');
      const result = await fetch(`${base.replace(/\/$/, '')}/track`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invoiceNo: invoice.trim().toUpperCase(), phone: phone.trim(), challenge }) });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Order not found');
      setOrder(data.order);
    } catch (err) { setError(err instanceof Error ? err.message : 'Tracking unavailable'); }
    finally { setBusy(false); setChallenge(''); setVersion(v => v + 1); }
  }
  return <section className="max-w-xl mx-auto p-6 space-y-4">
    <h1 className="text-2xl font-bold text-emerald-950">Track your order</h1>
    <p>Invoice number aur order wala phone number enter karein. Purane orders ke liye shop se rabta karein.</p>
    <form onSubmit={track} className="space-y-3">
      <label className="block">Invoice number<input required value={invoice} onChange={e => setInvoice(e.target.value)} className="block border rounded p-3 w-full" /></label>
      <label className="block">Phone number<input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="block border rounded p-3 w-full" /></label>
      <SecurityChallenge resetKey={version} onToken={setChallenge} />
      <button disabled={busy || !challenge} className="bg-emerald-950 text-white rounded p-3 disabled:opacity-50">{busy ? 'Checking…' : 'Track order'}</button>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {order && <div className="rounded border p-4 space-y-2"><p>{order.invoiceNo}</p><p>Order: {order.orderStatus}</p><p>Payment: {order.paymentStatus}</p></div>}
  </section>;
}
