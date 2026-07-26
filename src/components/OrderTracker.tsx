import React, { useState } from 'react';
import { Order } from '../types';
import { Search, Compass, PackageCheck, Truck, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackerProps {
  orders: Order[];
}

export default function OrderTracker({ orders }: OrderTrackerProps) {
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInvoice = invoiceQuery.trim().toUpperCase();
    const match = orders.find((o) => o.invoiceNo === cleanInvoice);
    setTrackedOrder(match || null);
    setHasSearched(true);
  };

  const getStepStatusClass = (orderStatus: Order['orderStatus'], target: 'Pending' | 'Dispatched' | 'Delivered') => {
    if (orderStatus === 'Cancelled') return 'text-gray-300';
    
    const indexMap = { 'Pending': 1, 'Dispatched': 2, 'Delivered': 3, 'Cancelled': 0 };
    const currentIdx = indexMap[orderStatus];
    const targetIdx = indexMap[target];

    if (currentIdx >= targetIdx) {
      return 'bg-emerald-950 text-gold-500 border-gold-500';
    }
    return 'bg-gray-100 text-gray-400 border-gray-200';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16 space-y-8 font-sans text-xs">
      {/* Title */}
      <div className="text-center space-y-2">
        <Compass className="w-10 h-10 text-gold-500 mx-auto" />
        <h2 className="font-serif font-black text-2xl text-emerald-950">LIVE CARGO TRACKING</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Enter your 8-digit Invoice No (e.g. MEO-1024 or MEO-1025) to trace dispatch status.
        </p>
      </div>

      {/* Tracker search bar */}
      <form onSubmit={handleTrackSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            required
            placeholder="e.g. MEO-1024"
            value={invoiceQuery}
            onChange={(e) => setInvoiceQuery(e.target.value)}
            className="w-full text-sm bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          className="px-6 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-xl border border-gold-500/20 shadow-md transition-colors cursor-pointer"
        >
          TRACK
        </button>
      </form>

      {/* Track Result */}
      <AnimatePresence mode="wait">
        {hasSearched && trackedOrder ? (
          <motion.div
            key="found-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 md:p-8 space-y-6"
          >
            {/* Order status card summary */}
            <div className="flex justify-between items-start border-b border-gray-50 pb-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400">Order Placed On</span>
                <div className="flex items-center gap-1.5 text-gray-700 font-medium mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" />
                  <span>{new Date(trackedOrder.orderDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-gray-400">Status</span>
                <span className={`block px-2.5 py-1 rounded-full text-[9px] font-black uppercase mt-0.5 ${
                  trackedOrder.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                  trackedOrder.orderStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                  trackedOrder.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {trackedOrder.orderStatus}
                </span>
              </div>
            </div>

            {/* Tracking flow diagram visual */}
            <div className="relative flex justify-between items-center py-4">
              {/* Connected Line */}
              <div className="absolute top-1/2 left-[5%] right-[5%] -translate-y-1/2 h-1 bg-gray-100 -z-10 rounded"></div>
              {trackedOrder.orderStatus !== 'Cancelled' && (
                <div
                  style={{
                    width: trackedOrder.orderStatus === 'Pending' ? '0%' :
                           trackedOrder.orderStatus === 'Dispatched' ? '50%' : '100%'
                  }}
                  className="absolute top-1/2 left-[5%] -translate-y-1/2 h-1 bg-emerald-950 -z-10 transition-all duration-500 rounded"
                ></div>
              )}

              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(trackedOrder.orderStatus, 'Pending')}`}>
                  1
                </div>
                <span className="font-bold text-[10px] mt-2 text-emerald-950 uppercase tracking-wide">Pending</span>
                <span className="text-[8px] text-gray-400 mt-0.5">Confirmed</span>
              </div>

              {/* Step 2: Dispatched */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(trackedOrder.orderStatus, 'Dispatched')}`}>
                  2
                </div>
                <span className="font-bold text-[10px] mt-2 text-emerald-950 uppercase tracking-wide">Dispatched</span>
                <span className="text-[8px] text-gray-400 mt-0.5">Left Warehouse</span>
              </div>

              {/* Step 3: Delivered */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${getStepStatusClass(trackedOrder.orderStatus, 'Delivered')}`}>
                  3
                </div>
                <span className="font-bold text-[10px] mt-2 text-emerald-950 uppercase tracking-wide">Delivered</span>
                <span className="text-[8px] text-gray-400 mt-0.5">Received Safely</span>
              </div>
            </div>

            {/* Cancelled Warning if Cancelled */}
            {trackedOrder.orderStatus === 'Cancelled' && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Order Cancelled:</span> This parcel has been voided/cancelled. Please contact support at 0300-7618236.
                </div>
              </div>
            )}

            {/* Items details nested list */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <h4 className="font-serif font-black text-xs text-emerald-950 uppercase">Order Summary</h4>
              <div className="divide-y divide-gray-100">
                {trackedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between">
                    <span className="text-gray-600">{it.productName} (x{it.quantity} {it.unit})</span>
                    <span className="font-bold text-emerald-950">Rs. {(it.priceAtPurchase * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-black text-sm text-emerald-950">
                <span>Total Bill Payable:</span>
                <span>Rs. {trackedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ) : hasSearched ? (
          <motion.div
            key="not-found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center space-y-2 max-w-sm mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-serif font-black text-amber-950 text-sm">Invoice Not Found</h4>
            <p className="text-[10px] text-gray-500">
              We couldn't trace invoice "{invoiceQuery}". Please verify the code on your invoice sheet and try again.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
