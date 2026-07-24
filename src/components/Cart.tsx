import React, { useState } from 'react';
import { ShoppingCart, Trash2, Shield, CreditCard, CheckCircle, Truck, Info, Download, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Product, Order, OrderItem, DiscountCode } from '../types';
import { TAX_RATES, INITIAL_DISCOUNT_CODES } from '../data/initialData';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  discountCodes?: DiscountCode[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (order: Order) => void;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  discountCodes = INITIAL_DISCOUNT_CODES,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}: CartProps) {
  const [step, setStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [selectedProvinceTax, setSelectedProvinceTax] = useState(TAX_RATES[0]); // Default to Punjab
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card' | 'Bank Transfer'>('COD');

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Credit Card Simulation State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Completed Order Placeholder
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Direct Download PDF Invoice Handler (No Print Dialog)
  const handleDownloadOrderPdf = async () => {
    if (!placedOrder || isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      // Create temporary offscreen container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '700px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '30px';
      container.style.fontFamily = 'sans-serif';
      container.style.color = '#111827';

      const dateStr = new Date(placedOrder.orderDate).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      container.innerHTML = `
        <div style="border-bottom: 2px solid #022c22; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 22px; font-weight: 900; color: #022c22; margin: 0; text-transform: uppercase;">MALIK OIL EXPELLERS</h1>
            <p style="font-size: 11px; color: #4b5563; margin: 2px 0 0 0;">100% Pure Organic & Cold-Pressed Essential Oils</p>
            <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">Main Faisalabad Road, Near Ghalla Mandi, Samundri</p>
            <p style="font-size: 10px; color: #6b7280; margin: 2px 0 0 0;">Phone: +92 300 672 1970 | WhatsApp: +92 300 672 1970</p>
          </div>
          <div style="text-align: right; background: #ecfdf5; padding: 10px; border-radius: 8px; border: 1px solid #a7f3d0;">
            <div style="font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase;">OFFICIAL TAX INVOICE</div>
            <div style="font-size: 16px; font-weight: 900; color: #022c22;">${placedOrder.invoiceNo}</div>
            <div style="font-size: 10px; color: #4b5563;">Date: ${dateStr}</div>
          </div>
        </div>

        <div style="border: 2px dashed #022c22; padding: 12px; border-radius: 8px; background-color: #fffbeb; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 900; background: #022c22; color: #fbbf24; padding: 2px 8px; display: inline-block; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px;">
            CUSTOMER / SHIP TO
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <div>
              <span style="font-size: 9px; color: #6b7280; display: block; font-weight: bold;">CUSTOMER NAME:</span>
              <strong style="font-size: 13px; color: #022c22;">${placedOrder.customerName}</strong>
              <div style="color: #065f46; font-weight: bold; margin-top: 2px;">Phone: ${placedOrder.customerPhone}</div>
              ${placedOrder.customerEmail ? `<div style="color: #4b5563; font-size: 10px;">Email: ${placedOrder.customerEmail}</div>` : ''}
            </div>
            <div style="text-align: right; max-width: 250px;">
              <span style="font-size: 9px; color: #6b7280; display: block; font-weight: bold;">DELIVERY ADDRESS:</span>
              <div style="color: #1f2937; font-weight: 500;">${placedOrder.address}</div>
              <strong style="color: #022c22; display: block; margin-top: 2px;">${placedOrder.city}, ${placedOrder.province}</strong>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #022c22; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px;">
            ORDER SUMMARY
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #374151; font-weight: bold; font-size: 10px; text-transform: uppercase;">
                <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">#</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb;">Product</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Qty</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Price</th>
                <th style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${placedOrder.items.map((it, idx) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 6px 8px; color: #9ca3af;">${idx + 1}</td>
                  <td style="padding: 6px 8px; font-weight: bold; color: #1f2937;">${it.productName}</td>
                  <td style="padding: 6px 8px; text-align: center;">${it.quantity} ${it.unit}</td>
                  <td style="padding: 6px 8px; text-align: right;">Rs. ${it.priceAtPurchase.toLocaleString()}</td>
                  <td style="padding: 6px 8px; text-align: right; font-weight: bold; color: #022c22;">Rs. ${(it.priceAtPurchase * it.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e5e7eb; padding-top: 12px;">
          <div style="font-size: 10px; color: #6b7280; max-width: 250px;">
            <p style="font-weight: bold; color: #022c22; margin: 0 0 2px 0;">Malik Oil Expellers Guarantee:</p>
            <p style="margin: 0;">• 100% Pure Organic Oils</p>
            <p style="margin: 0;">• Dispatched from Samundri warehouse</p>
          </div>
          <div style="width: 200px; font-size: 11px; text-align: right;">
            <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 2px;">
              <span>Subtotal:</span>
              <span>Rs. ${placedOrder.subtotal.toLocaleString()}</span>
            </div>
            ${placedOrder.discount && placedOrder.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: #059669; font-weight: bold; margin-bottom: 2px;">
                <span>Discount (${placedOrder.discountCode || 'Promo'}):</span>
                <span>-Rs. ${placedOrder.discount.toLocaleString()}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 2px;">
              <span>GST Tax:</span>
              <span>Rs. ${placedOrder.tax.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 4px;">
              <span>Delivery Charges:</span>
              <span>Rs. ${placedOrder.shipping.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 900; color: #022c22; font-size: 13px; border-top: 2px solid #022c22; padding-top: 4px;">
              <span>Net Total:</span>
              <span>Rs. ${placedOrder.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 10px; text-align: center; font-size: 10px; color: #9ca3af;">
          Official Computerized Invoice — Thank you for your purchase from Malik Oil Expellers!
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${placedOrder.invoiceNo}.pdf`);
    } catch (error) {
      console.error('PDF Download error:', error);
      alert('Failed to generate PDF file. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!isOpen) return null;

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Dynamic Promo discounts application
  const activeDiscountCodeObj = discountCodes.find(
    d => d.code.toUpperCase() === appliedPromo?.toUpperCase() && d.isActive
  );

  let discount = 0;
  if (appliedPromo) {
    if (activeDiscountCodeObj) {
      if (activeDiscountCodeObj.type === 'percentage') {
        discount = Math.round((subtotal * activeDiscountCodeObj.value) / 100);
      } else if (activeDiscountCodeObj.type === 'flat') {
        discount = Math.min(subtotal, activeDiscountCodeObj.value);
      }
    } else {
      // Fallback legacy code handling
      if (appliedPromo === 'MALIK10') discount = Math.round(subtotal * 0.10);
      else if (appliedPromo === 'RAMADAN20') discount = Math.round(subtotal * 0.20);
      else if (appliedPromo === 'ASLI200') discount = Math.min(subtotal, 200);
      else if (appliedPromo === 'SAMUNDRI15') discount = Math.round(subtotal * 0.15);
    }
  }

  // Tax calculation based on province selection
  let tax = Math.round(subtotal * selectedProvinceTax.rate);
  if (appliedPromo === 'FREETAX') {
    tax = 0;
  }
  
  // Heavy shipping rate if Khall or Wanda is in the cart
  const containsHeavyItems = cartItems.some(
    (item) => item.product.category === 'By-Product' || item.product.category === 'Animal Feed'
  );
  let shipping = subtotal === 0 ? 0 : containsHeavyItems ? 1000 : 250;
  if (appliedPromo === 'FREEFRT') {
    shipping = 0;
  }

  const total = Math.max(0, subtotal - discount + tax + shipping);

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const matched = discountCodes.find((d) => d.code.toUpperCase() === code);

    if (matched) {
      if (!matched.isActive) {
        setPromoError('Yeh promo code is waqt inactive hai.');
        return;
      }
      if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
        setPromoError(`Is code ke liye Kam se kam Rs. ${matched.minOrderAmount.toLocaleString()} ki khareedari lazmi hai.`);
        return;
      }
      setAppliedPromo(matched.code);
      if (matched.type === 'percentage') {
        setPromoSuccess(`${matched.code} lag gaya! Subtotal par ${matched.value}% discount mil gaya hai.`);
      } else {
        setPromoSuccess(`${matched.code} lag gaya! Rs. ${matched.value.toLocaleString()} flat discount mil gaya hai.`);
      }
    } else if (code === 'MALIK10') {
      setAppliedPromo('MALIK10');
      setPromoSuccess('MALIK10 lag gaya! Subtotal par 10% discount mil gaya hai.');
    } else if (code === 'RAMADAN20') {
      setAppliedPromo('RAMADAN20');
      setPromoSuccess('RAMADAN20 lag gaya! Subtotal par 20% discount mil gaya hai.');
    } else if (code === 'FREETAX') {
      setAppliedPromo('FREETAX');
      setPromoSuccess('FREETAX lag gaya! 100% Tax maaf ho gaya hai.');
    } else if (code === 'FREEFRT') {
      setAppliedPromo('FREEFRT');
      setPromoSuccess('FREEFRT lag gaya! Delivery shipping bilkul free ho gayi hai.');
    } else {
      setPromoError('Ghalat promo code! Dobara check karke lagayein.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleNextStep = () => {
    if (step === 'cart') {
      if (cartItems.length === 0) return;
      setStep('details');
    } else if (step === 'details') {
      if (!name || !phone || !address || !city) {
        alert('Please fill out all required delivery fields.');
        return;
      }
      setStep('payment');
    }
  };

  const handleCheckoutSubmit = () => {
    if (paymentMethod === 'Card') {
      if (cardNumber.length < 16 || !cardExpiry || cardCvv.length < 3) {
        alert('Please enter valid credit card details.');
        return;
      }
      setIsProcessingPayment(true);
      
      // Simulate secure gateway delay
      setTimeout(() => {
        setIsProcessingPayment(false);
        completeOrder();
      }, 1800);
    } else {
      completeOrder();
    }
  };

  const completeOrder = () => {
    const nextInvoiceNo = 'MEO-' + Math.floor(1000 + Math.random() * 9000);
    const orderItems: OrderItem[] = cartItems.map((item, index) => ({
      id: 'oi-' + Math.random().toString(36).substr(2, 9),
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
      unit: item.product.unit,
    }));

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      invoiceNo: nextInvoiceNo,
      customerName: name,
      customerEmail: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerPhone: phone,
      address,
      city,
      province: selectedProvinceTax.province,
      orderDate: new Date().toISOString(),
      items: orderItems,
      subtotal,
      discount,
      discountCode: appliedPromo || undefined,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card' ? 'Paid' : 'Unpaid',
      orderStatus: 'Pending',
    };

    onPlaceOrder(newOrder);
    setPlacedOrder(newOrder);
    setStep('success');
  };

  const handleResetCart = () => {
    setStep('cart');
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white flex flex-col shadow-2xl border-l border-gray-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gold-500" />
              <h2 className="text-base font-serif font-extrabold tracking-wider uppercase">
                {step === 'cart' && 'YOUR SHOPPING CART'}
                {step === 'details' && 'DELIVERY DETAILS'}
                {step === 'payment' && 'SECURE PAYMENT GATEWAY'}
                {step === 'success' && 'ORDER CONFIRMED'}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Steps Progress Bar (if not successful) */}
          {step !== 'success' && (
            <div className="bg-gold-50/50 border-b border-gray-100 px-6 py-3 flex items-center justify-between text-[10px] font-bold tracking-widest text-gray-400">
              <span className={step === 'cart' ? 'text-gold-700' : 'text-emerald-900'}>1. CART</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className={step === 'details' ? 'text-gold-700' : step !== 'cart' ? 'text-emerald-900' : ''}>2. DETAILS</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className={step === 'payment' ? 'text-gold-700' : ''}>3. PAYMENT</span>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: CART LIST */}
              {step === 'cart' && (
                <motion.div
                  key="cart-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gold-600">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                      <h3 className="font-serif font-extrabold text-sm text-emerald-950 uppercase tracking-wide">Your Cart is Empty</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                        Add some cold pressed pure oils or high protein animal feed bags from our catalog to place your order.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 px-5 py-2.5 bg-emerald-950 text-gold-500 hover:text-white font-bold text-xs tracking-wider rounded-lg border border-gold-500/20 transition-all cursor-pointer"
                      >
                        CONTINUE SHOPPING
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {cartItems.map((item) => (
                        <div key={item.product.id} className="py-4 flex items-center gap-4 first:pt-0">
                          {/* Mini Representation */}
                          <div className="w-12 h-12 rounded-lg bg-stone-50 border border-gray-100 flex items-center justify-center text-xl">
                            {item.product.image === 'khall' || item.product.image === 'wanda' ? '🌾' : '🫙'}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-emerald-950 font-serif leading-tight">{item.product.name}</h4>
                            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Rs. {item.product.price} / {item.product.unit}</span>
                            
                            {/* Quantity Editor */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-gray-200 rounded bg-gray-50 text-[10px]">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                  className="px-2 py-1 font-black text-gray-600 hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="px-2.5 font-bold text-emerald-950">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                                  className="px-2 py-1 font-black text-gray-600 hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-[10px] text-emerald-800 font-bold">
                                Rs. {(item.product.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Alert Banner for shipping weight */}
                  {containsHeavyItems && cartItems.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/50 flex gap-2.5 items-start">
                      <Truck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-[10px] text-amber-800">
                        <span className="font-bold">Heavy Shipment Alert:</span> This order contains bulky animal feed bags (Khall/Wanda). Heavy-weight delivery fee of Rs. 1,000 applies instead of standard rates.
                      </div>
                    </div>
                  )}

                  {/* Promo Coupons Section */}
                  {cartItems.length > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2 mt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-500">Izafi Discount / Coupon Code</span>
                        <span className="text-[9px] text-emerald-900 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Codes: MALIK10, RAMADAN20, FREETAX</span>
                      </div>
                      
                      {appliedPromo ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-lg text-[11px] font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Code Applied: <strong className="font-bold">{appliedPromo}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer px-1 py-0.5 rounded hover:bg-rose-50"
                          >
                            Hatao ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. MALIK10"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-4 py-2 bg-emerald-950 text-gold-500 hover:bg-emerald-900 hover:text-white font-bold text-[10px] tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            APPLY
                          </button>
                        </div>
                      )}
                      
                      {promoError && (
                        <p className="text-[10px] font-bold text-rose-600 animate-pulse">{promoError}</p>
                      )}
                      {promoSuccess && (
                        <p className="text-[10px] font-bold text-emerald-700">{promoSuccess}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: DELIVERY INFO */}
              {step === 'details' && (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 text-xs"
                >
                  <div className="bg-emerald-50 text-emerald-950 p-3 rounded-lg border border-emerald-100 text-[10px] leading-relaxed mb-2">
                    Please provide authentic delivery information. We currently deliver orders across Punjab and all major cities of Pakistan using local cargo services.
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Usman"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0300-1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. usman@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Province (For GST Tax Rate) *</label>
                      <select
                        value={selectedProvinceTax.province}
                        onChange={(e) => {
                          const taxRate = TAX_RATES.find(t => t.province === e.target.value);
                          if (taxRate) setSelectedProvinceTax(taxRate);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 font-medium"
                      >
                        {TAX_RATES.map((rate) => (
                          <option key={rate.province} value={rate.province}>
                            {rate.province}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Samundri"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Postal Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 37000"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Complete Home/Farm Address *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. House #22, Street #5, Samundri Road, Okara"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT TYPE & SECURE PORTAL */}
              {step === 'payment' && (
                <motion.div
                  key="payment-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Choose Billing Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3.5 rounded-xl border text-center font-bold tracking-wide transition-all cursor-pointer ${
                          paymentMethod === 'COD'
                            ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        💵 COD
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Card')}
                        className={`p-3.5 rounded-xl border text-center font-bold tracking-wide transition-all cursor-pointer ${
                          paymentMethod === 'Card'
                            ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        💳 Card
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Bank Transfer')}
                        className={`p-3.5 rounded-xl border text-center font-bold tracking-wide transition-all cursor-pointer ${
                          paymentMethod === 'Bank Transfer'
                            ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        🏦 Bank
                      </button>
                    </div>
                  </div>

                  {/* Cash On Delivery Detail */}
                  {paymentMethod === 'COD' && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                      <Truck className="w-5 h-5 text-emerald-950 mt-0.5" />
                      <div>
                        <h4 className="font-serif font-extrabold text-emerald-950 text-[11px] uppercase">Cash On Delivery Selected</h4>
                        <p className="text-[10px] text-gray-600 mt-1 leading-relaxed">
                          Please pay the total bill amount of <span className="font-bold text-emerald-950">Rs. {total.toLocaleString()}</span> directly to our logistic rider on product delivery.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer details */}
                  {paymentMethod === 'Bank Transfer' && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/60 space-y-3">
                      <div className="flex gap-2.5 items-start">
                        <Info className="w-5 h-5 text-amber-700 shrink-0" />
                        <div>
                          <h4 className="font-serif font-extrabold text-amber-900 text-[11px] uppercase">Malik Oil Expellers Bank Account</h4>
                          <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">
                            Please transfer the billing amount to HBL and email the receipt or WhatsApp the screenshot of receipt to 0300-7618236.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-amber-200 text-[10px] space-y-1.5 font-mono">
                        <div><span className="text-gray-400">Bank:</span> Habib Bank Limited (HBL)</div>
                        <div><span className="text-gray-400">Branch:</span> Samundri Road, Okara Branch</div>
                        <div><span className="text-gray-400">Title:</span> MALIK OIL EXPELLERS LTD</div>
                        <div><span className="text-gray-400">Account No:</span> 0300-7618236-01</div>
                        <div><span className="text-gray-400">IBAN:</span> PK53HABB0300761823601</div>
                      </div>
                    </div>
                  )}

                  {/* Secure Card Payment Sandbox gateway */}
                  {paymentMethod === 'Card' && (
                    <div className="space-y-4">
                      {/* Interactive Credit Card layout */}
                      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl border border-gold-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between h-40">
                        <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl"></div>
                        
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black tracking-widest text-gold-500 font-serif">MALIK SECUREPAY</span>
                          <CreditCard className="w-5 h-5 text-gold-100" />
                        </div>

                        <div className="font-mono text-base tracking-widest my-2">
                          {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                        </div>

                        <div className="flex justify-between items-end font-mono text-[9px] uppercase tracking-wider text-gray-300">
                          <div>
                            <span className="text-[6px] text-gray-400 block">Card Holder</span>
                            <span>{name || 'YOUR NAME'}</span>
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[6px] text-gray-400 block">Expiry</span>
                              <span>{cardExpiry || 'MM/YY'}</span>
                            </div>
                            <div>
                              <span className="text-[6px] text-gray-400 block">CVV</span>
                              <span>{cardCvv || '•••'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Input fields */}
                      <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Card Number</label>
                          <input
                            type="text"
                            maxLength={16}
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gold-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Security CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gold-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SSL Padlock warning block */}
                      <div className="flex gap-2 items-center justify-center text-gray-400 text-[10px]">
                        <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Secure 256-bit SSL encrypted connection.</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4: ORDER SUCCESS */}
              {step === 'success' && placedOrder && (
                <motion.div
                  key="success-step"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 text-center py-6 text-xs"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-sm">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-green-600 font-extrabold tracking-widest uppercase">Thank You, {placedOrder.customerName}!</span>
                    <h3 className="font-serif font-extrabold text-lg text-emerald-950">Your Order is Placed Successfully</h3>
                    <p className="text-xs text-gray-500">Invoice: <span className="font-mono font-bold text-emerald-950">{placedOrder.invoiceNo}</span></p>
                  </div>

                  {/* Summary Invoice Container */}
                  <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-500/10 text-left space-y-3 font-sans">
                    <div className="flex justify-between border-b border-gray-200 pb-2 text-[10px] font-bold text-emerald-950 uppercase tracking-wide">
                      <span>Products Summary</span>
                      <span>Total Price</span>
                    </div>

                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {placedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-gray-600">
                          <span>{it.productName} (x{it.quantity} {it.unit})</span>
                          <span>Rs. {(it.priceAtPurchase * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-2 space-y-1 text-[11px]">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal:</span>
                        <span>Rs. {placedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {placedOrder.discount && placedOrder.discount > 0 ? (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Discount ({placedOrder.discountCode || 'Promo'}):</span>
                          <span>-Rs. {placedOrder.discount.toLocaleString()}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-gray-500">
                        <span>GST Sales Tax:</span>
                        <span>Rs. {placedOrder.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Shipping/Freight:</span>
                        <span>Rs. {placedOrder.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-950 font-black text-xs border-t border-gray-200 pt-1.5 mt-1">
                        <span>Total Paid:</span>
                        <span>Rs. {placedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-900 p-3 rounded-lg text-[10px] leading-relaxed">
                    We will notify you at <span className="font-bold">{placedOrder.customerPhone}</span> with tracking status when your parcel leaves our Samundri warehouse.
                  </div>

                  {/* Download PDF Invoice Button */}
                  <button
                    type="button"
                    disabled={isDownloadingPdf}
                    onClick={handleDownloadOrderPdf}
                    className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-emerald-950 hover:bg-emerald-900 disabled:opacity-60 text-gold-400 hover:text-gold-300 font-bold tracking-wider uppercase text-xs rounded-xl shadow-md border border-gold-500/30 transition-all cursor-pointer"
                  >
                    {isDownloadingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
                        <span>GENERATING PDF (پی ڈی ایف بن رہی ہے...)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-gold-400" />
                        <span>DOWNLOAD PDF INVOICE (پی ڈی ایف ڈاون لوڈ کریں)</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Summary Bottom Panel (if not successful) */}
          {step !== 'success' && cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                    <span>Discount ({appliedPromo}):</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Sales Tax ({selectedProvinceTax.province.split(' ')[1] || 'GST'}):</span>
                  <span>Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Cargo Shipping:</span>
                  <span>Rs. {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-950 font-black text-sm pt-2 border-t border-gray-200">
                  <span>Total Amount:</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {step !== 'cart' && (
                  <button
                    type="button"
                    onClick={() => setStep(step === 'payment' ? 'details' : 'cart')}
                    className="px-4 py-3 border border-gray-200 rounded-lg font-bold text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    BACK
                  </button>
                )}
                
                {step === 'payment' ? (
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isProcessingPayment}
                    className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-lg border border-gold-500/20 shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                        SECURING TRANSACTION...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-gold-500" />
                        PLACE ORDER (Rs. {total.toLocaleString()})
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-lg border border-gold-500/20 shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    PROCEED TO {step === 'cart' ? 'DETAILS' : 'PAYMENT'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reset cart action inside success step */}
          {step === 'success' && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleResetCart}
                className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-lg border border-gold-500/20 shadow cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
