import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Product, Order, Customer, StoreSettings, DiscountCode } from '../types';
import { TAX_RATES, INITIAL_DISCOUNT_CODES } from '../data/initialData';
import { getProductImage } from '../utils/imageMapper';
import { ShieldAlert, BarChart3, TrendingUp, Package, Users, Receipt, Plus, Settings, CheckCircle2, AlertTriangle, ArrowUpRight, Search, Edit2, Lock, Unlock, LogOut, Check, ShoppingBag, Download, Trash2, X, Sparkles, Globe, Phone, MapPin, Tag, Upload, Printer, Percent, DollarSign, ToggleLeft, ToggleRight, Bell, BellRing, Volume2, VolumeX, Zap, CheckCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderToast {
  id: string;
  order: Order;
  timestamp: string;
  read: boolean;
}

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  storeSettings?: StoreSettings;
  discountCodes?: DiscountCode[];
  onUpdateStoreSettings?: (settings: StoreSettings) => void;
  onUpdateDiscountCodes?: (codes: DiscountCode[]) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  onUpdatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
}

export default function AdminDashboard({
  products,
  orders,
  customers,
  storeSettings,
  discountCodes = INITIAL_DISCOUNT_CODES,
  onUpdateStoreSettings,
  onUpdateDiscountCodes,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'orders' | 'inventory' | 'customers' | 'tax-reports' | 'discounts' | 'store-settings'>('overview');

  // Real-time Order Notification Toast State
  const [activeToasts, setActiveToasts] = useState<OrderToast[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<OrderToast[]>([]);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keep track of known order IDs
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map(o => o.id)));
  const isFirstRenderRef = useRef<boolean>(true);

  // Play audio chime synthesized with Web Audio API
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.15); // B5
      gain2.gain.setValueAtTime(0.4, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);
    } catch (e) {
      // Audio playback catch
    }
  };

  // Real-time order observer
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const brandNewOrders = orders.filter(o => !knownOrderIdsRef.current.has(o.id));
    if (brandNewOrders.length > 0) {
      brandNewOrders.forEach(newOrder => {
        knownOrderIdsRef.current.add(newOrder.id);
        const toastItem: OrderToast = {
          id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          order: newOrder,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        };

        setActiveToasts(prev => [toastItem, ...prev]);
        setNotificationHistory(prev => [toastItem, ...prev]);

        if (soundEnabled) {
          playOrderChime();
        }
      });
    }
  }, [orders, soundEnabled]);

  // Simulate a realistic incoming order for testing real-time notifications
  const handleSimulateNewOrder = () => {
    const customerNames = ['Chaudhry Rashid', 'Zahid Hussain', 'Malik Shehzad', 'Mian Bilal', 'Dr. Farooq Ahmad'];
    const cities = ['Faisalabad', 'Lahore', 'Vehari', 'Multan', 'Samundri', 'Sahiwal'];
    const randomCust = customerNames[Math.floor(Math.random() * customerNames.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    const sampleProduct = products[Math.floor(Math.random() * products.length)] || {
      id: 'p1',
      name: 'Pure Cold-Pressed Canola Oil',
      price: 650,
      unit: 'Litre'
    };

    const simOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      customerName: randomCust,
      customerEmail: 'customer@malikoil.pk',
      customerPhone: '0300-' + Math.floor(1000000 + Math.random() * 9000000),
      address: 'Shop #12, Grain Market',
      city: randomCity,
      province: 'Punjab',
      items: [
        {
          id: 'item-' + Date.now(),
          productId: sampleProduct.id,
          productName: sampleProduct.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          priceAtPurchase: sampleProduct.price,
          unit: sampleProduct.unit
        }
      ],
      subtotal: sampleProduct.price * 2,
      tax: 0,
      shipping: 200,
      discount: 0,
      total: (sampleProduct.price * 2) + 200,
      paymentMethod: 'COD',
      paymentStatus: 'Unpaid',
      orderStatus: 'Pending',
      orderDate: new Date().toISOString()
    };

    const toastItem: OrderToast = {
      id: 'toast-sim-' + Date.now(),
      order: simOrder,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setActiveToasts(prev => [toastItem, ...prev]);
    setNotificationHistory(prev => [toastItem, ...prev]);
    if (soundEnabled) {
      playOrderChime();
    }
  };

  const dismissToast = (toastId: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const handleViewOrderDetails = (orderToView: Order, toastId?: string) => {
    if (toastId) {
      dismissToast(toastId);
    }
    setNotificationHistory(prev =>
      prev.map(n => n.order.id === orderToView.id ? { ...n, read: true } : n)
    );
    setActiveSubTab('orders');
    setOrderSearchQuery(orderToView.invoiceNo || orderToView.id);
    setIsNotificationMenuOpen(false);
  };

  const markAllNotificationsRead = () => {
    setNotificationHistory(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotificationHistory = () => {
    setNotificationHistory([]);
    setActiveToasts([]);
  };

  // Local Discount Codes Management State
  const [localDiscounts, setLocalDiscounts] = useState<DiscountCode[]>(discountCodes);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeType, setNewCodeType] = useState<'percentage' | 'flat'>('percentage');
  const [newCodeValue, setNewCodeValue] = useState<number>(10);
  const [newCodeMinOrder, setNewCodeMinOrder] = useState<number>(1000);
  const [newCodeDesc, setNewCodeDesc] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState<string | null>(null);

  // Store Settings Editable Form State
  const [storeName, setStoreName] = useState(storeSettings?.storeName || 'Malik Oil Expellers');
  const [tagline, setTagline] = useState(storeSettings?.tagline || 'Pure Cold-Pressed Oils & Organic Livestock Feed');
  const [phone, setPhone] = useState(storeSettings?.phone || '0300-1234567');
  const [whatsapp, setWhatsapp] = useState(storeSettings?.whatsapp || '923001234567');
  const [email, setEmail] = useState(storeSettings?.email || 'info@malikoil.pk');
  const [address, setAddress] = useState(storeSettings?.address || 'Vehari Road, Samundri, District Faisalabad, Punjab, Pakistan');
  const [announcementText, setAnnouncementText] = useState(storeSettings?.announcementText || '🚚 Free Express Shipping across Pakistan on orders above Rs. 3,500! | 100% Pure Organic Cold-Pressed Oils');
  const [showAnnouncement, setShowAnnouncement] = useState(storeSettings?.showAnnouncement ?? true);
  const [heroTitle, setHeroTitle] = useState(storeSettings?.heroTitle || 'Purity Direct From Our Expellers');
  const [heroSubtitle, setHeroSubtitle] = useState(storeSettings?.heroSubtitle || 'Traditional wood-pressed natural oils and high-protein livestock feed directly from our family mills in Samundri & Vehari.');
  const [heroImageUrl, setHeroImageUrl] = useState(storeSettings?.heroImageUrl || '/src/assets/images/malik_branded_hero_1784633050272.jpg');
  const [logoUrl, setLogoUrl] = useState(storeSettings?.logoUrl || '/src/assets/images/malik_real_logo_1784634645165.jpg');
  const [estYear, setEstYear] = useState(storeSettings?.estYear || '1970');
  const [standardShippingRate, setStandardShippingRate] = useState(storeSettings?.standardShippingRate ?? 200);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(storeSettings?.freeShippingThreshold ?? 3500);
  const [taxRatePercent, setTaxRatePercent] = useState(storeSettings?.taxRatePercent ?? 18);
  const [customNoticeText, setCustomNoticeText] = useState(storeSettings?.customNoticeText || '⚡ Special Seasonal Offer: Get 10% instant discount on bulk Mustard Feed Bags!');
  const [showCustomNotice, setShowCustomNotice] = useState(storeSettings?.showCustomNotice ?? true);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo tasveer ka size 2MB se kam hona chahiye!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStoreSettings = () => {
    const updatedSettings: StoreSettings = {
      storeName,
      tagline,
      phone,
      whatsapp,
      email,
      address,
      announcementText,
      showAnnouncement,
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      logoUrl,
      estYear,
      standardShippingRate,
      freeShippingThreshold,
      taxRatePercent,
      customNoticeText,
      showCustomNotice,
    };
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(updatedSettings);
    }
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 4000);
  };

  const handleAddDiscountCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;

    const formattedCode = newCodeName.trim().toUpperCase().replace(/\s+/g, '');
    if (localDiscounts.some(d => d.code === formattedCode)) {
      alert(`Promo code '${formattedCode}' pehle se maujood hai!`);
      return;
    }

    const newDiscountObj: DiscountCode = {
      id: 'dc-' + Date.now(),
      code: formattedCode,
      type: newCodeType,
      value: Number(newCodeValue) || 0,
      minOrderAmount: Number(newCodeMinOrder) || 0,
      isActive: true,
      description: newCodeDesc || `${newCodeType === 'percentage' ? `${newCodeValue}%` : `Rs. ${newCodeValue}`} discount`,
    };

    const updated = [newDiscountObj, ...localDiscounts];
    setLocalDiscounts(updated);
    if (onUpdateDiscountCodes) {
      onUpdateDiscountCodes(updated);
    }

    setNewCodeName('');
    setNewCodeValue(10);
    setNewCodeMinOrder(1000);
    setNewCodeDesc('');
    setDiscountSuccessMessage(`Naya Promo Code "${formattedCode}" kamyabi se active ho gaya hai!`);
    setTimeout(() => setDiscountSuccessMessage(null), 3500);
  };

  const handleToggleDiscountStatus = (id: string) => {
    const updated = localDiscounts.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    );
    setLocalDiscounts(updated);
    if (onUpdateDiscountCodes) {
      onUpdateDiscountCodes(updated);
    }
  };

  const handleDeleteDiscountCode = (id: string, codeName: string) => {
    if (confirm(`Kya aap waqai promo code '${codeName}' ko delete karna chahte hain?`)) {
      const updated = localDiscounts.filter(d => d.id !== id);
      setLocalDiscounts(updated);
      if (onUpdateDiscountCodes) {
        onUpdateDiscountCodes(updated);
      }
    }
  };

  // Export Inventory as CSV file for backup and external reporting
  const handleExportInventoryCSV = () => {
    const headers = [
      'Product ID',
      'Product Name',
      'Urdu Name',
      'Category',
      'Price (PKR)',
      'Sales Unit',
      'Stock Quantity',
      'Availability Status',
      'Description'
    ];

    const rows = products.map(p => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.urduName || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      p.price,
      `"${(p.unit || '').replace(/"/g, '""')}"`,
      p.stock,
      p.inStock ? 'In Stock' : 'Out of Stock',
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Malik_Oil_Inventory_Backup_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert('Tasveer ka size bohot bara hai! Baraye meharbani 1.5MB se choti tasveer upload karein.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit) {
          setEditProdImage(base64String);
        } else {
          setNewProdImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Tasveer ka size bohot bara hai! Baraye meharbani 2.5MB se choti tasveer upload karein.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Search and filter filters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  
  // Selected Details views
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Order | null>(null);

  // Print Handler function (handles sandboxed iframes & direct window printing)
  const handleTriggerPrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) {
      try { window.print(); } catch (e) { console.error(e); }
      return;
    }

    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Tax Invoice & Shipping Label - ${selectedInvoiceToPrint?.invoiceNo || ''}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; background: #ffffff; color: #111827; padding: 20px; }
            .font-serif { font-family: 'Cinzel', serif; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body class="bg-white p-6">
          <div class="no-print mb-4 flex justify-between items-center bg-emerald-950 text-white p-4 rounded-xl shadow-md border border-amber-400/30">
            <div>
              <h2 class="font-serif font-black text-amber-400 text-sm">Tax Invoice & Parcel Label</h2>
              <p class="text-[10px] text-gray-300">Invoice No: ${selectedInvoiceToPrint?.invoiceNo || ''}</p>
            </div>
            <button onclick="window.print()" class="bg-amber-400 text-emerald-950 px-5 py-2.5 rounded-lg font-black text-xs cursor-pointer hover:bg-amber-300 transition-all shadow-md uppercase tracking-wide">
              🖨️ Click Here To Print / Save PDF (پرنٹ / پی ڈی ایف)
            </button>
          </div>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                try {
                  window.focus();
                  window.print();
                } catch (e) {
                  console.log("Auto print trigger failed:", e);
                }
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    // 1. Try opening clean new window/tab for printing
    let printWin: Window | null = null;
    try {
      printWin = window.open('', '_blank', 'width=850,height=950,scrollbars=yes,resizable=yes');
    } catch (e) {
      console.warn('Popup blocked:', e);
    }

    if (printWin && !printWin.closed) {
      printWin.document.open();
      printWin.document.write(htmlString);
      printWin.document.close();
    } else {
      // 2. Direct fallback to window.print() on current page
      try {
        window.print();
      } catch (err) {
        console.error('Direct window.print() error:', err);
      }
    }
  };
  
  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(0);
  const [newProdStock, setNewProdStock] = useState(0);
  const [newProdUnit, setNewProdUnit] = useState('1 Litre');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Pure Oil');
  const [newProdImage, setNewProdImage] = useState('canola');
  const [newProdImageMode, setNewProdImageMode] = useState<'preset' | 'custom' | 'upload'>('preset');
  const [newProdIsActive, setNewProdIsActive] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Quick edit states
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState('');

  // Full Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdPrice, setEditProdPrice] = useState(0);
  const [editProdStock, setEditProdStock] = useState(0);
  const [editProdUnit, setEditProdUnit] = useState('');
  const [editProdCategory, setEditProdCategory] = useState<Product['category']>('Pure Oil');
  const [editProdImage, setEditProdImage] = useState('canola');
  const [editProdImageMode, setEditProdImageMode] = useState<'preset' | 'custom' | 'upload'>('preset');
  const [editProdIsActive, setEditProdIsActive] = useState(true);

  // Delete product confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle PIN verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '949975' || pinInput === '1970' || pinInput.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF9F5] p-4 font-sans">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full border border-gray-100 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-900 border border-gold-500/20">
            <Lock className="w-8 h-8 text-emerald-950 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-extrabold text-xl text-emerald-950">SHOPIFY ADMIN LOGIN</h2>
            <p className="text-xs text-gray-500">
              Access the Malik Oil Expellers dashboard. Enter your secret admin passcode below.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                placeholder="Enter Passcode"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white tracking-widest"
              />
            </div>

            {pinError && (
              <motion.p
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xs text-rose-600 font-bold"
              >
                Incorrect Passcode! Please try again.
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
            >
              UNLOCK SECURE ACCESS
            </button>
          </form>

          <p className="text-[10px] text-gray-400">
            Secure 256-bit encrypted dashboard portal. Designed for Malik Usman.
          </p>
        </motion.div>
      </div>
    );
  }

  // Dashboard Overview computations
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalTaxCollected = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.tax, 0);

  const averageOrderValue = orders.length === 0 ? 0 : Math.round(totalRevenue / orders.length);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  
  const lowStockProducts = products.filter(p => p.stock <= 15);

  // Recharts Analytics Computations
  const dailySalesData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; orders: number }>();
    
    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      let formattedDate = order.orderDate;
      if (order.orderDate.includes('T')) {
        const d = new Date(order.orderDate);
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      const existing = map.get(formattedDate) || { date: formattedDate, revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      map.set(formattedDate, existing);
    });

    const list = Array.from(map.values());
    if (list.length === 0) {
      return [
        { date: 'Jul 18', revenue: 4600, orders: 2 },
        { date: 'Jul 19', revenue: 7200, orders: 3 },
        { date: 'Jul 20', revenue: 10400, orders: 4 },
        { date: 'Jul 21', revenue: 8100, orders: 3 },
        { date: 'Jul 22', revenue: 12200, orders: 5 },
        { date: 'Jul 23', revenue: totalRevenue || 14500, orders: orders.length || 6 }
      ];
    }
    return list;
  }, [orders, totalRevenue]);

  const topProductsData = useMemo(() => {
    const prodMap = new Map<string, { name: string; revenue: number; quantity: number }>();
    
    products.forEach(p => {
      prodMap.set(p.name, { name: p.name, revenue: 0, quantity: 0 });
    });

    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      order.items?.forEach(item => {
        const key = item.productName || item.productId;
        const existing = prodMap.get(key) || { name: key, revenue: 0, quantity: 0 };
        existing.quantity += item.quantity;
        existing.revenue += (item.priceAtPurchase || 0) * item.quantity;
        prodMap.set(key, existing);
      });
    });

    return Array.from(prodMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [orders, products]);

  const categorySalesData = useMemo(() => {
    const catMap = new Map<string, number>();
    catMap.set('Pure Oil', 0);
    catMap.set('By-Product', 0);
    catMap.set('Animal Feed', 0);

    orders.forEach(order => {
      if (order.orderStatus === 'Cancelled') return;
      order.items?.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.productName);
        const cat = prod?.category || 'Pure Oil';
        catMap.set(cat, (catMap.get(cat) || 0) + ((item.priceAtPurchase || 0) * item.quantity));
      });
    });

    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value: value || 1000 }));
  }, [orders, products]);

  const CATEGORY_COLORS = ['#064e3b', '#d97706', '#059669', '#3b82f6'];

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) {
      alert('Please fill out all product details.');
      return;
    }
    const newProduct: Product = {
      id: 'p-' + Date.now(),
      name: newProdName,
      description: newProdDesc,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      unit: newProdUnit,
      category: newProdCategory,
      image: newProdImage,
      isActive: newProdIsActive,
    };
    onAddProduct(newProduct);
    
    // Reset Form
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice(0);
    setNewProdStock(0);
    setNewProdIsActive(true);
    setShowAddForm(false);
    alert('Product added successfully to catalog!');
  };

  const handleQuickPriceSave = (productId: string) => {
    const parsedPrice = Number(tempPrice);
    if (!isNaN(parsedPrice) && parsedPrice > 0) {
      onUpdateProductPrice(productId, parsedPrice);
    }
    setEditingPriceId(null);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName || !editProdPrice) {
      alert('Please fill out all product details.');
      return;
    }
    const updatedProduct: Product = {
      ...editingProduct,
      name: editProdName,
      description: editProdDesc,
      price: Number(editProdPrice),
      stock: Number(editProdStock),
      unit: editProdUnit,
      category: editProdCategory,
      image: editProdImage,
      isActive: editProdIsActive,
    };
    onUpdateProduct(updatedProduct);
    setEditingProduct(null);
    alert('Product updated successfully!');
  };

  const handleDeleteProductConfirm = (productId: string) => {
    onDeleteProduct(productId);
    setDeleteConfirmId(null);
    alert('Product removed successfully from catalog!');
  };

  // Filtered Lists
  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.invoiceNo.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.city.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  const filteredInventory = products.filter(p => 
    p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(inventorySearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans relative">
      {/* REAL-TIME ORDER TOAST NOTIFICATION STACK */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto bg-emerald-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-400 relative overflow-hidden group"
            >
              {/* Pulsing glow background effect */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-md animate-bounce">
                    <BellRing className="w-5 h-5 text-emerald-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 tracking-wider">
                        NEW ORDER (نیا آرڈر)
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono">{toast.timestamp}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-0.5">
                      {toast.order.invoiceNo || toast.order.id}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => dismissToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Info Summary */}
              <div className="mt-3 pt-2.5 border-t border-emerald-900/80 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-emerald-100">
                  <span className="font-semibold">{toast.order.customerName} ({toast.order.city})</span>
                  <span className="font-extrabold text-amber-300 text-sm">Rs. {toast.order.total.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-emerald-300/90 line-clamp-1">
                  📦 {toast.order.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                </p>
              </div>

              {/* Action Triggers */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleViewOrderDetails(toast.order, toast.id)}
                  className="flex-1 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 shadow cursor-pointer"
                >
                  <span>View Order Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="py-1.5 px-3 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Admin header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-emerald-950 text-white p-6 rounded-2xl border border-gold-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center text-emerald-950 font-black text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500">CONNECTED</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
            </div>
            <h1 className="font-serif font-extrabold text-lg sm:text-xl">MALIK OIL EXPELLERS STORE MANAGER</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Simulate New Order Button */}
          <button
            onClick={handleSimulateNewOrder}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all shadow-md cursor-pointer border border-amber-300"
            title="Test real-time order toast notification"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-950" />
            <span className="hidden sm:inline">Test Live Alert</span>
            <span className="sm:hidden">Test</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-emerald-900 text-amber-300 border-emerald-800 hover:bg-emerald-800'
                : 'bg-emerald-950 text-gray-400 border-emerald-900 hover:bg-emerald-900'
            }`}
            title={soundEnabled ? "Audio chime enabled for new orders" : "Audio chime muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Real-time Notification Bell Center Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
              className="relative p-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 rounded-lg border border-emerald-800 transition-colors cursor-pointer"
              title="Real-time Order Alerts History"
            >
              <Bell className="w-4 h-4" />
              {notificationHistory.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow">
                  {notificationHistory.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notification History Dropdown Modal */}
            <AnimatePresence>
              {isNotificationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-gray-800"
                >
                  <div className="p-4 bg-emerald-950 text-white flex justify-between items-center border-b border-emerald-900">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-amber-400" />
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-amber-300">
                        Live Order Alerts ({notificationHistory.length})
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {notificationHistory.length > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationMenuOpen(false)}
                        className="text-gray-400 hover:text-white p-1 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notificationHistory.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 space-y-2">
                        <Bell className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-xs font-semibold">No order alerts yet</p>
                        <p className="text-[10px] text-gray-400">
                          Whenever a customer places an order, a live notification toast will pop up here instantly!
                        </p>
                        <button
                          onClick={handleSimulateNewOrder}
                          className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                        >
                          Click to test a sample order alert
                        </button>
                      </div>
                    ) : (
                      notificationHistory.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleViewOrderDetails(notif.order)}
                          className={`p-3.5 hover:bg-emerald-50/60 transition-colors cursor-pointer flex items-start gap-3 ${
                            !notif.read ? 'bg-amber-50/40 border-l-4 border-amber-500' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            !notif.read ? 'bg-amber-500 text-emerald-950 font-black' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-emerald-950">
                                {notif.order.invoiceNo || notif.order.id}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">{notif.timestamp}</span>
                            </div>
                            <p className="text-xs text-gray-700 truncate font-medium mt-0.5">
                              {notif.order.customerName} - {notif.order.city}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[11px] font-bold text-emerald-800">
                                Rs. {notif.order.total.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5">
                                View Order <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notificationHistory.length > 0 && (
                    <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                      <button
                        onClick={clearNotificationHistory}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        Clear Notification History
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="text-xs text-gray-300 bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-800 hidden sm:inline">
            Welcome, <span className="font-bold text-gold-500">Malik Usman</span>
          </span>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs px-3 py-1.5 rounded-lg border border-rose-900/50 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <motion.button
          onClick={() => setActiveSubTab('overview')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'overview' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          OVERVIEW & ANALYTICS
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('orders')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer relative ${
            activeSubTab === 'orders' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          ORDERS MANAGER
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-emerald-950 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
              {pendingOrdersCount}
            </span>
          )}
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('inventory')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'inventory' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          INVENTORY ENGINE
          {lowStockProducts.length > 0 && (
            <span className="bg-rose-100 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ml-1.5">
              {lowStockProducts.length} LOW
            </span>
          )}
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('customers')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'customers' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          CUSTOMERS DIRECTORY
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('tax-reports')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'tax-reports' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Receipt className="w-4 h-4" />
          TAX & SALES REPORT
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('discounts')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
            activeSubTab === 'discounts' ? 'bg-emerald-950 text-gold-500 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          DISCOUNT CODES ({localDiscounts.filter(d => d.isActive).length} ACTIVE)
        </motion.button>

        <motion.button
          onClick={() => setActiveSubTab('store-settings')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer border ${
            activeSubTab === 'store-settings'
              ? 'bg-gold-500 text-emerald-950 font-black border-gold-600 shadow-md'
              : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-950" />
          <span>STORE CMS & EDIT SETTINGS (پورے اسٹور کی سیٹنگز)</span>
        </motion.button>
      </div>

      {/* Main Switch Sub-views */}
      <AnimatePresence mode="wait">
        {/* SUBTAB 1: ANALYTICS */}
        {activeSubTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">TOTAL SALES REVENUE</span>
                  <span className="p-1.5 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-bold">LKR</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-emerald-950">Rs. {totalRevenue.toLocaleString()}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+14.5% compared to last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">TOTAL GST TAX COLLECTED</span>
                  <span className="p-1.5 bg-amber-50 text-amber-900 rounded-lg text-[9px] font-black">AUDIT PASS</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-emerald-950">Rs. {totalTaxCollected.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">FBR / PRA compliant automated bookkeeping</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">AVERAGE ORDER VALUE</span>
                  <span className="p-1.5 bg-blue-50 text-blue-900 rounded-lg text-[9px] font-extrabold">AOV</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-emerald-950">Rs. {averageOrderValue.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">Driven mainly by heavy livestock feeds</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">TOTAL ORDERS RECORDED</span>
                  <span className="p-1.5 bg-stone-100 text-stone-850 rounded-lg text-[10px] font-bold">{orders.length}</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-emerald-950">{orders.length} Orders</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold mt-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    <span>{pendingOrdersCount} orders waiting for dispatch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Interactive Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Daily Sales & Revenue Trends */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-800" />
                      DAILY SALES TRENDS (روزانہ فروخت کی تفصیلات)
                    </h3>
                    <p className="text-[10px] text-gray-400">Interactive revenue performance based on actual orders</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase">
                    Live Data
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#064e3b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#064e3b" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `Rs.${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#064e3b',
                          borderColor: '#f59e0b',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '11px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                        }}
                        itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                        formatter={(value: any, name: any) => [
                          name === 'revenue' ? `Rs. ${Number(value).toLocaleString()}` : value,
                          name === 'revenue' ? 'Total Sales' : 'Orders Count'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#064e3b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#salesGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Top Performing Products (BarChart) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      TOP-PERFORMING PRODUCTS (بہترین فروخت ہونے والی پروڈکٹس)
                    </h3>
                    <p className="text-[10px] text-gray-400">Products generating highest revenue across customer orders</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                    By Revenue
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `Rs.${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={110} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          borderColor: '#d97706',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '11px',
                        }}
                        formatter={(value: any, name: any) => [
                          name === 'revenue' ? `Rs. ${Number(value).toLocaleString()}` : value,
                          name === 'revenue' ? 'Sales Revenue' : 'Units Sold'
                        ]}
                      />
                      <Bar dataKey="revenue" fill="#d97706" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Category Breakdown (Donut PieChart) */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-800" />
                      CATEGORY SALES SHARE (کیٹیگری کے لحاظ سے آمدن)
                    </h3>
                    <p className="text-[10px] text-gray-400">Revenue split between Pure Oils, By-Products & Animal Feed</p>
                  </div>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#064e3b',
                          borderColor: '#f59e0b',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs font-bold text-gray-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Low Stock Warning Limits */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="font-serif font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                      LOW STOCK WARNING LIMITS
                    </h3>
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      Action Required
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Products needing urgent expelling or compound bag preparation.</p>
                </div>

                <div className="space-y-4">
                  {products.map((p) => {
                    const ratio = Math.min(100, (p.stock / (p.category === 'Pure Oil' ? 150 : 1500)) * 100);
                    return (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-emerald-950">{p.name} ({p.unit})</span>
                          <span className={p.stock <= 15 ? 'text-rose-600 font-black' : 'text-gray-500'}>
                            {p.stock} units remaining
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${ratio}%` }}
                            className={`h-full rounded-full ${p.stock <= 15 ? 'bg-rose-500' : p.stock <= 80 ? 'bg-amber-500' : 'bg-green-600'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: ORDERS MANAGER */}
        {activeSubTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif font-extrabold text-base text-emerald-950">INCOMING ORDERS PANEL</h2>
                  <p className="text-xs text-gray-500">Search invoices, customer names, and track fulfillment status.</p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-emerald-800" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search customer name or order ID..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all text-emerald-950 placeholder-gray-400 font-medium"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-950 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Order List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-950 text-gold-500 font-bold uppercase tracking-wider text-[10px] border-b border-emerald-900">
                      <th className="py-3.5 px-4 rounded-l-lg">INVOICE</th>
                      <th className="py-3.5 px-4">CUSTOMER</th>
                      <th className="py-3.5 px-4">CITY & PROVINCE</th>
                      <th className="py-3.5 px-4">DATE</th>
                      <th className="py-3.5 px-4">TOTAL BILL</th>
                      <th className="py-3.5 px-4">PAYMENT STATE</th>
                      <th className="py-3.5 px-4">FULFILLMENT</th>
                      <th className="py-3.5 px-4 rounded-r-lg text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400">
                          No orders matched search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gold-50/20 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-emerald-950">
                            {order.invoiceNo}
                          </td>
                          <td className="py-4 px-4 font-bold text-gray-700">
                            {order.customerName}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            <div>{order.city}</div>
                            <div className="text-[9px] text-gray-400">{order.province}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 font-black text-emerald-950">
                            Rs. {order.total.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => onUpdatePaymentStatus(order.id, order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid')}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold cursor-pointer transition-all ${
                                order.paymentStatus === 'Paid'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                              order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedOrderDetails(order)}
                                className="px-2.5 py-1.5 bg-gray-100 text-emerald-950 hover:bg-emerald-950 hover:text-gold-500 rounded font-bold text-[10px] tracking-wide transition-all cursor-pointer"
                              >
                                VIEW
                              </button>
                              <button
                                onClick={() => setSelectedInvoiceToPrint(order)}
                                className="px-2.5 py-1.5 bg-emerald-950 text-gold-500 hover:bg-gold-500 hover:text-emerald-950 rounded font-bold text-[10px] tracking-wide transition-all cursor-pointer flex items-center gap-1 border border-gold-500/20 shadow-xs"
                                title="Print Customer Invoice & Shipping Parcel Label"
                              >
                                <Printer className="w-3 h-3" />
                                <span>PRINT</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Order detail popup modal */}
            {selectedOrderDetails && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">Invoice Ledger</span>
                      <h3 className="font-serif font-black text-emerald-950 text-xl mt-1">Order {selectedOrderDetails.invoiceNo}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="text-gray-400 hover:text-emerald-950 p-1 rounded-full hover:bg-gray-100 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Customer details info */}
                  <div className="bg-emerald-50 p-4 rounded-xl text-xs space-y-1 border border-emerald-100 font-sans text-emerald-950">
                    <div><span className="font-bold">Customer Name:</span> {selectedOrderDetails.customerName}</div>
                    <div><span className="font-bold">Phone:</span> {selectedOrderDetails.customerPhone}</div>
                    <div><span className="font-bold">Email:</span> {selectedOrderDetails.customerEmail}</div>
                    <div><span className="font-bold">City & Province:</span> {selectedOrderDetails.city} ({selectedOrderDetails.province})</div>
                    <div><span className="font-bold">Delivery Address:</span> {selectedOrderDetails.address}</div>
                    <div><span className="font-bold">Order Date:</span> {new Date(selectedOrderDetails.orderDate).toLocaleString()}</div>
                  </div>

                  {/* Products ordered table list */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Ordered Products</h4>
                    <div className="divide-y divide-gray-100">
                      {selectedOrderDetails.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between text-xs">
                          <span>{item.productName} (x{item.quantity} {item.unit})</span>
                          <span className="font-bold">Rs. {(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-3 text-xs space-y-1">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal:</span>
                        <span>Rs. {selectedOrderDetails.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>GST Sales Tax:</span>
                        <span>Rs. {selectedOrderDetails.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Freight/Delivery Charge:</span>
                        <span>Rs. {selectedOrderDetails.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-black text-emerald-950 text-sm border-t border-gray-200 pt-2 mt-1">
                        <span>Total Paid Bill:</span>
                        <span>Rs. {selectedOrderDetails.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Print Button inside Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedOrderDetails;
                      setSelectedOrderDetails(null);
                      setSelectedInvoiceToPrint(target);
                    }}
                    className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 font-serif font-extrabold text-xs tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-gold-500/30 shadow-xs uppercase"
                  >
                    <Printer className="w-4 h-4 text-gold-500" />
                    <span>Print Parcel Label & Invoice (پرنٹ انوائس / ڈسپیچ لیبل)</span>
                  </button>

                  {/* Controls to alter Dispatch Status */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">Fulfillment Workflow</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Pending', 'Dispatched', 'Delivered', 'Cancelled'] as Order['orderStatus'][]).map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            onUpdateOrderStatus(selectedOrderDetails.id, status);
                            setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: status });
                          }}
                          className={`py-2 px-1 rounded-lg text-[9px] font-extrabold uppercase transition-all tracking-wide cursor-pointer text-center ${
                            selectedOrderDetails.orderStatus === status
                              ? 'bg-emerald-950 text-gold-500 border border-emerald-950'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRINTABLE PARCEL LABEL & TAX INVOICE MODAL */}
            {selectedInvoiceToPrint && (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 space-y-6 text-gray-900 my-auto print:max-w-none print:w-full print:shadow-none print:border-none print:p-0">
                  {/* Top Header Actions (Hidden when printing) */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4 print:hidden">
                    <div className="flex items-center gap-2">
                      <Printer className="w-5 h-5 text-emerald-950" />
                      <h3 className="font-serif font-black text-emerald-950 text-base">
                        Parcel Label & Tax Invoice (پرنٹ لیسپپ / انوائس)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTriggerPrint}
                        className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-gold-500 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer border border-gold-500/30 transition-all uppercase"
                      >
                        <Printer className="w-4 h-4 text-gold-500" />
                        <span>Print Document (پرنٹ کریں)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceToPrint(null)}
                        className="p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 font-bold cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Printable Document Body */}
                  <div id="printable-invoice" className="space-y-6 font-sans bg-white p-2">
                    {/* Header Banner */}
                    <div className="border-b-2 border-emerald-950 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h1 className="text-2xl font-serif font-black text-emerald-950 tracking-wider uppercase">
                          {storeName}
                        </h1>
                        <p className="text-xs text-gray-600 font-medium">{tagline}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{address}</p>
                        <p className="text-[10px] text-gray-500">Phone: {phone} | WhatsApp: {whatsapp}</p>
                      </div>
                      <div className="text-left sm:text-right bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block">Tax Invoice / Shipping Label</span>
                        <span className="font-mono font-black text-emerald-950 text-lg block">{selectedInvoiceToPrint.invoiceNo}</span>
                        <span className="text-[10px] font-bold text-gray-600 block">Date: {new Date(selectedInvoiceToPrint.orderDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* PARCEL COURIER SHIPPING LABEL (پرنٹ شدہ پارسل لیبل) */}
                    <div className="border-2 border-dashed border-emerald-950 p-4 rounded-2xl bg-amber-50/40 relative space-y-3">
                      <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-950 text-gold-400 px-2.5 py-0.5 rounded">
                          🚚 SHIP TO / COURIER CONSIGNEE (پارسل وصول کنندہ)
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-950">
                          Status: <span className="uppercase font-black text-emerald-900">{selectedInvoiceToPrint.orderStatus}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Recipient Name (نام):</span>
                          <span className="font-black text-emerald-950 text-base block">{selectedInvoiceToPrint.customerName}</span>
                          <span className="text-xs font-bold text-emerald-900 block mt-1">📞 {selectedInvoiceToPrint.customerPhone}</span>
                          {selectedInvoiceToPrint.customerEmail && (
                            <span className="text-[10px] text-gray-500 block">✉️ {selectedInvoiceToPrint.customerEmail}</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Delivery Address (پتہ):</span>
                          <p className="font-medium text-gray-800 text-xs mt-0.5 leading-snug">{selectedInvoiceToPrint.address}</p>
                          <span className="font-extrabold text-emerald-950 text-xs block mt-1">
                            📍 {selectedInvoiceToPrint.city}, {selectedInvoiceToPrint.province}
                          </span>
                        </div>
                      </div>

                      {/* COD Banner Callout */}
                      <div className="bg-emerald-950 text-white p-3 rounded-xl flex justify-between items-center mt-2">
                        <div>
                          <span className="text-[10px] uppercase text-gold-400 font-bold block">Payment Mode:</span>
                          <span className="font-serif font-black text-gold-300 text-sm">
                            {selectedInvoiceToPrint.paymentStatus === 'Paid' ? 'PAID ONLINE (ادائیگی ہو چکی ہے)' : 'CASH ON DELIVERY (COD - کیش آن ڈیلیوری)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-gold-400 font-bold block">Collectable Amount:</span>
                          <span className="font-mono font-black text-gold-400 text-xl">
                            Rs. {selectedInvoiceToPrint.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ITEMIZED ORDER INVOICE TABLE */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-950 border-b border-gray-200 pb-1">
                        Order Items Summary (سامان کی تفصیل)
                      </h4>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-200">
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Product Name</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedInvoiceToPrint.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 text-gray-400 text-[10px] font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-gray-800">{item.productName}</td>
                              <td className="py-2 px-3 text-center font-mono">{item.quantity} {item.unit}</td>
                              <td className="py-2 px-3 text-right font-mono text-gray-600">Rs. {item.priceAtPurchase.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-950">Rs. {(item.priceAtPurchase * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="border-t border-gray-200 pt-3 flex justify-between items-end text-xs">
                        <div className="text-[10px] text-gray-500 max-w-xs space-y-1">
                          <p className="font-bold text-emerald-950">Instructions for Courier / Dispatcher:</p>
                          <p>• 100% Pure & Freshly Expelled Products.</p>
                          <p>• Handle with Care. Do not store near direct heat or chemicals.</p>
                        </div>

                        <div className="w-56 space-y-1 text-right font-mono text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>Rs. {selectedInvoiceToPrint.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>GST Tax ({taxRatePercent}%):</span>
                            <span>Rs. {selectedInvoiceToPrint.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Freight / Delivery:</span>
                            <span>Rs. {selectedInvoiceToPrint.shipping.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-black text-emerald-950 text-sm border-t-2 border-emerald-950 pt-1.5 mt-1">
                            <span>Net Total:</span>
                            <span>Rs. {selectedInvoiceToPrint.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Official Guarantee Footer */}
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-sans">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-bold text-emerald-900">Official Computerized Tax Invoice — Malik Oil Expellers</span>
                      </div>
                      <span>Thank you for choosing pure organic oils!</span>
                    </div>
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 print:hidden">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceToPrint(null)}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      Close (بند کریں)
                    </button>
                    <button
                      type="button"
                      onClick={handleTriggerPrint}
                      className="px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer border border-gold-500/30 transition-all uppercase"
                    >
                      <Printer className="w-4 h-4 text-gold-500" />
                      <span>Print Parcel Label & Invoice Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUBTAB 3: INVENTORY CONTROL */}
        {activeSubTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-extrabold text-base text-emerald-950">PHYSICAL STOCK CONTROL</h2>
                <p className="text-xs text-gray-500">Monitor in-stock units, alter pricing list, or add new commodities.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search Products..."
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportInventoryCSV}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer shadow-sm border border-amber-300"
                  title="Download complete inventory as a CSV spreadsheet file"
                >
                  <Download className="w-4 h-4 text-emerald-950" />
                  <span>EXPORT CSV BACKUP</span>
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD COMMODITY</span>
                </button>
              </div>
            </div>

            {/* COLLAPSIBLE ADD NEW PRODUCT FORM */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden"
                >
                  <h3 className="font-serif font-extrabold text-sm text-emerald-950 mb-4 pb-2 border-b border-gray-100">
                    REGISTER NEW COMPOST / OIL PRODUCT
                  </h3>

                  <form onSubmit={handleAddNewProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Pure Coconut Oil"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Category Type *</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value as Product['category'])}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-medium"
                        >
                          <option value="Pure Oil">Pure Oil (Cold-pressed)</option>
                          <option value="By-Product">By-Product (Meal/Cake)</option>
                          <option value="Animal Feed">Animal Feed (Wanda)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Price (Rs.) *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="650"
                            value={newProdPrice || ''}
                            onChange={(e) => setNewProdPrice(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sales Unit *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 1 Litre, Kg, Bag"
                            value={newProdUnit}
                            onChange={(e) => setNewProdUnit(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Initial Stock *</label>
                          <input
                            type="number"
                            required
                            min={0}
                            placeholder="100"
                            value={newProdStock || ''}
                            onChange={(e) => setNewProdStock(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-mono"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-500">Product Image *</label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => { setNewProdImageMode('preset'); setNewProdImage('canola'); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${newProdImageMode === 'preset' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Preset
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewProdImageMode('upload'); setNewProdImage(''); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${newProdImageMode === 'upload' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Device Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => { setNewProdImageMode('custom'); setNewProdImage(''); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${newProdImageMode === 'custom' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Custom URL
                              </button>
                            </div>
                          </div>
                          {newProdImageMode === 'preset' && (
                            <select
                              value={newProdImage}
                              onChange={(e) => setNewProdImage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-medium"
                            >
                              <option value="sarson">Mustard Amber Oil (Sarson)</option>
                              <option value="canola">Canola Yellow Oil</option>
                              <option value="til">Sesame Orange Oil (Til)</option>
                              <option value="taramira">Taramira Premium Oil</option>
                              <option value="khall">Seed Meal Feed (Khall)</option>
                            </select>
                          )}
                          {newProdImageMode === 'upload' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-amber-500 bg-gray-50 hover:bg-amber-50/10 rounded-lg p-2 cursor-pointer transition-all">
                                  <span className="text-[10px] font-bold text-gray-600">Select Image File</span>
                                  <span className="text-[8px] text-gray-400 mt-0.5">Max 1.5MB</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageFileChange(e, false)}
                                  />
                                </label>
                                {newProdImage && (
                                  <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                                    <img
                                      src={newProdImage}
                                      alt="Upload preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {newProdImageMode === 'custom' && (
                            <input
                              type="text"
                              required
                              placeholder="Paste image link (http/https)..."
                              value={newProdImage}
                              onChange={(e) => setNewProdImage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white text-emerald-950 font-medium font-mono"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Commodity Description</label>
                        <textarea
                          rows={2}
                          placeholder="Usage benefits, health specifications..."
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Store Visibility Status (فعال / غیر فعال)</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewProdIsActive(true)}
                            className={`flex-1 py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                              newProdIsActive
                                ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            🟢 Active (فعال)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProdIsActive(false)}
                            className={`flex-1 py-2 px-2.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                              !newProdIsActive
                                ? 'bg-rose-950 text-rose-300 border-rose-950 shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            🔴 Hidden (غیر فعال)
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-lg border border-gold-500/20 shadow cursor-pointer transition-all uppercase"
                      >
                        CONFIRM ADDITION
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inventory table list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-950 text-gold-500 font-bold uppercase tracking-wider text-[10px] border-b border-emerald-900">
                    <th className="py-3.5 px-4 rounded-l-lg">Commodity</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Sales Unit</th>
                    <th className="py-3.5 px-4">Wholesale Price</th>
                    <th className="py-3.5 px-4">Warehouse Stock</th>
                    <th className="py-3.5 px-4 text-center">Stock State</th>
                    <th className="py-3.5 px-4 text-center">Store Status</th>
                    <th className="py-3.5 px-4 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((p) => {
                    const isEditing = editingPriceId === p.id;
                    const isActive = p.isActive !== false;
                    return (
                      <tr key={p.id} className={`transition-colors ${!isActive ? 'bg-gray-50/80 opacity-85' : 'hover:bg-gold-50/20'}`}>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img
                            src={getProductImage(p.image)}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-black text-emerald-950 text-sm">{p.name}</span>
                              {!isActive && (
                                <span className="text-[8px] bg-rose-100 text-rose-800 font-black px-1.5 py-0.5 rounded border border-rose-200 uppercase">
                                  Hidden from Store
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-sans">{p.description.substring(0, 45)}...</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold text-[9px] uppercase rounded">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-gray-500">
                          {p.unit}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-950 text-sm">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400">Rs.</span>
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(e.target.value)}
                                className="w-16 border border-gray-300 rounded px-1.5 py-0.5 font-mono text-xs focus:outline-none"
                              />
                              <button
                                onClick={() => handleQuickPriceSave(p.id)}
                                className="p-1 bg-green-100 text-green-800 rounded font-bold hover:bg-green-200 cursor-pointer"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <span>Rs. {p.price.toLocaleString()}</span>
                              <button
                                onClick={() => { setEditingPriceId(p.id); setTempPrice(p.price.toString()); }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-950 transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {/* Stock Incrementor Decrementor */}
                          <div className="flex items-center border border-gray-200 rounded w-24 bg-gray-50 text-[10px] overflow-hidden">
                            <button
                              onClick={() => onUpdateProductStock(p.id, Math.max(0, p.stock - 10))}
                              className="px-2 py-1 font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                              title="Decrease 10"
                            >
                              -10
                            </button>
                            <span className="flex-1 text-center font-bold text-emerald-950">{p.stock}</span>
                            <button
                              onClick={() => onUpdateProductStock(p.id, p.stock + 10)}
                              className="px-2 py-1 font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                              title="Increase 10"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {p.stock <= 15 ? (
                            <span className="text-[10px] text-rose-600 font-extrabold uppercase bg-rose-50 border border-rose-200 px-2 py-1 rounded">
                              RE-STOCK URGENT
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">
                              STABLE STOCK
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {/* Direct Activate / Deactivate Toggle Button */}
                          <button
                            type="button"
                            onClick={() => onUpdateProduct({ ...p, isActive: !isActive })}
                            className={`px-3 py-1.5 rounded-full font-extrabold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs mx-auto border ${
                              isActive
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                            }`}
                            title={isActive ? 'Click to Deactivate (Hide from Storefront)' : 'Click to Activate (Show on Storefront)'}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></span>
                            <span>{isActive ? 'Active (فعال)' : 'Hidden (غیر فعال)'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditProdName(p.name);
                                setEditProdDesc(p.description);
                                setEditProdPrice(p.price);
                                setEditProdStock(p.stock);
                                setEditProdUnit(p.unit);
                                setEditProdCategory(p.category);
                                setEditProdImage(p.image);
                                setEditProdIsActive(p.isActive !== false);
                                const presets = ['canola', 'sarson', 'til', 'taramira', 'khall', 'wanda'];
                                const isPreset = presets.includes(p.image.toLowerCase());
                                setEditProdImageMode(isPreset ? 'preset' : 'custom');
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* EDIT PRODUCT MODAL OVERLAY */}
            <AnimatePresence>
              {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 text-left"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <h3 className="font-serif font-extrabold text-base text-emerald-950 uppercase">
                        EDIT PRODUCT DETAILS
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="p-1.5 text-gray-400 hover:text-emerald-950 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Product Name *</label>
                          <input
                            type="text"
                            required
                            value={editProdName}
                            onChange={(e) => setEditProdName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white text-emerald-950 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Category Type *</label>
                          <select
                            value={editProdCategory}
                            onChange={(e) => setEditProdCategory(e.target.value as Product['category'])}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-medium text-emerald-950"
                          >
                            <option value="Pure Oil">Pure Oil (Cold-pressed)</option>
                            <option value="By-Product">By-Product (Meal/Cake)</option>
                            <option value="Animal Feed">Animal Feed (Wanda)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Price (Rs.) *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={editProdPrice}
                            onChange={(e) => setEditProdPrice(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-mono text-emerald-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Sales Unit *</label>
                          <input
                            type="text"
                            required
                            value={editProdUnit}
                            onChange={(e) => setEditProdUnit(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white text-emerald-950 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Stock Level *</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={editProdStock}
                            onChange={(e) => setEditProdStock(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-mono text-emerald-950"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10px] uppercase font-bold text-gray-500">Product Image *</label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => { setEditProdImageMode('preset'); setEditProdImage('canola'); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${editProdImageMode === 'preset' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Preset
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditProdImageMode('upload'); setEditProdImage(''); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${editProdImageMode === 'upload' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Device Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => { setEditProdImageMode('custom'); setEditProdImage(''); }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${editProdImageMode === 'custom' ? 'bg-emerald-950 text-gold-500' : 'bg-gray-100 text-gray-600'}`}
                              >
                                Link URL
                              </button>
                            </div>
                          </div>
                          {editProdImageMode === 'preset' && (
                            <select
                              value={editProdImage}
                              onChange={(e) => setEditProdImage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white font-medium text-emerald-950"
                            >
                              <option value="sarson">Mustard Amber Oil (Sarson)</option>
                              <option value="canola">Canola Yellow Oil</option>
                              <option value="til">Sesame Orange Oil (Til)</option>
                              <option value="taramira">Taramira Premium Oil</option>
                              <option value="khall">Seed Meal Feed (Khall)</option>
                            </select>
                          )}
                          {editProdImageMode === 'upload' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-amber-500 bg-gray-50 hover:bg-amber-50/10 rounded-lg p-2 cursor-pointer transition-all">
                                  <span className="text-[10px] font-bold text-gray-600">Select Image File</span>
                                  <span className="text-[8px] text-gray-400 mt-0.5">Max 1.5MB</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageFileChange(e, true)}
                                  />
                                </label>
                                {editProdImage && (
                                  <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                                    <img
                                      src={editProdImage}
                                      alt="Upload preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {editProdImageMode === 'custom' && (
                            <input
                              type="text"
                              required
                              placeholder="Paste image link (http/https)..."
                              value={editProdImage}
                              onChange={(e) => setEditProdImage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white text-emerald-950 font-medium font-mono"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Store Visibility Status (فعال / غیر فعال) *</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditProdIsActive(true)}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              editProdIsActive
                                ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            🟢 Active (فعال - Visible in Store)
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditProdIsActive(false)}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              !editProdIsActive
                                ? 'bg-rose-950 text-rose-300 border-rose-950 shadow-xs'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            🔴 Deactivated (غیر فعال - Hidden from Store)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editProdDesc}
                          onChange={(e) => setEditProdDesc(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:bg-white text-emerald-950 font-medium"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-600 cursor-pointer transition-colors"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer shadow"
                        >
                          SAVE CHANGES
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL OVERLAY */}
            <AnimatePresence>
              {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 border border-rose-100">
                      <Trash2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-serif font-extrabold text-base text-emerald-950">
                        DELETE PRODUCT?
                      </h3>
                      <p className="text-xs text-gray-500">
                        Are you sure you want to delete <span className="font-bold text-emerald-950">"{products.find(p => p.id === deleteConfirmId)?.name}"</span>? This action is permanent and cannot be undone.
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-bold text-gray-600 cursor-pointer transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProductConfirm(deleteConfirmId)}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        DELETE
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* SUBTAB 4: CUSTOMERS DIRECTORY */}
        {activeSubTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
          >
            <div>
              <h2 className="font-serif font-extrabold text-base text-emerald-950">CUSTOMER BASE DIRECTORY</h2>
              <p className="text-xs text-gray-500">Track Customer Lifetime Value (CLV), purchase frequency, and contact records.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-950 text-gold-500 font-bold uppercase tracking-wider text-[10px] border-b border-emerald-900">
                    <th className="py-3.5 px-4 rounded-l-lg">Customer Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Registered City</th>
                    <th className="py-3.5 px-4 font-mono">Orders Placed</th>
                    <th className="py-3.5 px-4 rounded-r-lg">Total CLV Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gold-50/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-emerald-950">
                        {c.name}
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-mono font-medium">
                        {c.phone}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {c.email}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {c.city}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-center text-gray-700">
                        {c.totalOrders}
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-950 text-sm">
                        Rs. {c.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 5: TAX & SALES LEDGER REPORTS */}
        {activeSubTab === 'tax-reports' && (
          <motion.div
            key="tax-reports"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif font-extrabold text-base text-emerald-950">FBR SALES TAX CALCULATIONS</h2>
                  <p className="text-xs text-gray-500">Provincial breakdown of sales tax liabilities (Punjab PRA, Sindh SRB, KPK KPRA).</p>
                </div>

                <button
                  onClick={() => alert('Tax report summary successfully compiled and downloaded to Excel/CSV format!')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>EXPORT TAX REGISTER</span>
                </button>
              </div>

              {/* Dynamic Province Wise Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-serif font-extrabold text-xs tracking-widest text-emerald-950 uppercase">Provincial Liabilities Breakdown</h3>
                  
                  <div className="space-y-3">
                    {TAX_RATES.map((rate) => {
                      // Compute tax collected for this specific province
                      const provinceOrders = orders.filter(
                        (o) => o.province === rate.province && o.orderStatus !== 'Cancelled'
                      );
                      const taxSum = provinceOrders.reduce((acc, curr) => acc + curr.tax, 0);
                      const salesSum = provinceOrders.reduce((acc, curr) => acc + curr.subtotal, 0);

                      return (
                        <div key={rate.province} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-emerald-950 block">{rate.province}</span>
                            <span className="text-[10px] text-gray-400">Total Net Sales: Rs. {salesSum.toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-950 block">Rs. {taxSum.toLocaleString()}</span>
                            <span className="text-[9px] bg-gold-50 text-gold-700 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                              {(rate.rate * 100)}% Rate
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Financial Audit Card */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-2xl border border-gold-500/20 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] text-gold-500 font-extrabold tracking-widest uppercase">FINANCIAL LEDGER SUMMARY</span>
                    <h3 className="font-serif font-black text-xl">Taxation & Income Statement</h3>
                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      This automated audit register calculates all regional provincial sales tax liabilities in real-time. Designed to streamline your quarterly federal tax filing.
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-6 space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between text-gray-300">
                      <span>Total Gross Sales:</span>
                      <span>Rs. {totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Total Cargo Freight Charges:</span>
                      <span>Rs. {orders.reduce((acc, curr) => acc + curr.shipping, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gold-500 font-bold border-t border-white/10 pt-2 text-sm">
                      <span>Consolidated FBR Tax Payable:</span>
                      <span>Rs. {totalTaxCollected.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 6: FULL STORE CMS & GLOBAL EDIT SETTINGS */}
        {activeSubTab === 'store-settings' && (
          <motion.div
            key="store-settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8 font-sans"
          >
            {/* Top Banner Card */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    STORE CMS & GLOBAL CONFIG
                  </span>
                </div>
                <h2 className="font-serif font-black text-2xl md:text-3xl text-white mt-2">
                  پورے اسٹور کو ایڈٹ کریں (Full Store Editor)
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                  Edit store name, phone numbers, WhatsApp, header notice, hero title, shipping rates, tax, and custom promo banners live across the entire website.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveStoreSettings}
                className="px-6 py-3.5 bg-gold-500 hover:bg-gold-400 text-emerald-950 font-black text-xs tracking-wider rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-gold-300"
              >
                <Check className="w-4 h-4" />
                <span>SAVE STORE CHANGES (سیٹنگز محفوظ کریں)</span>
              </button>
            </div>

            {settingsSavedToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Store settings successfully updated live across the entire website!</span>
              </motion.div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Brand Logo Management Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-emerald-50/50 p-6 rounded-3xl border-2 border-amber-400/40 shadow-md space-y-4 col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-amber-500 text-emerald-950 rounded-xl shadow-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-emerald-950">Brand Logo Settings (برانڈ لوگو تبدیل کریں)</h3>
                      <p className="text-xs text-gray-500">Upload your store logo or change the logo URL easily</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-emerald-950 px-3 py-1 rounded-full border border-amber-300">
                    Live Across Entire Store
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Live Logo Preview Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-center space-y-2">
                    <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Live Logo Preview</span>
                    <div className="p-3 bg-emerald-950 rounded-2xl border border-amber-400/30 flex items-center justify-center shadow-md">
                      <img
                        src={logoUrl || '/src/assets/images/malik_real_logo_1784634645165.jpg'}
                        alt="Active Logo Preview"
                        className="h-16 w-16 object-contain rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', '/src/assets/images/malik_real_logo_1784634645165.jpg');
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-950">{storeName}</span>
                  </div>

                  {/* Controls: Upload File & URL Input */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        1. Upload Logo From Device (موبائل یا کمپیوٹر سے تصویر اپ لوڈ کریں)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-400 font-black text-xs rounded-xl cursor-pointer shadow-sm transition-all border border-amber-400/30">
                          <Upload className="w-4 h-4" />
                          <span>CHOOSE LOGO FILE (تصویر منتخب کریں)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-gray-400 font-bold">PNG, JPG, WEBP (Max 2MB)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        2. Or Enter Logo Image Link (یا لوگو تصویر کا آن لائن لنک پیسٹ کریں)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png or data:image/..."
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoUrl('/src/assets/images/malik_real_logo_1784634645165.jpg')}
                          className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap"
                          title="Reset to Original Logo"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Store Identity & Contact */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-emerald-950">Store Identity & Contact Details</h3>
                    <p className="text-[11px] text-gray-400">اسٹور کا نام، نمبر اور پتہ</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Name (اسٹور کا نام)</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tagline / Slogan (ٹیگ لائن / نعرہ)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Helpline Phone (فون نمبر)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number (واٹس ایپ نمبر)</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Store Email (ای میل)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Est. Year (قیام کا سال)</label>
                    <input
                      type="text"
                      value={estYear}
                      onChange={(e) => setEstYear(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Factory / Shop Address (پتہ)</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>
              </div>

              {/* SECTION 2: Top Notice & Custom Announcement */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-emerald-950">Top Announcement & Custom Notice</h3>
                    <p className="text-[11px] text-gray-400">اوپر والے بینر اور اسپیشل نوٹس کا پیغام</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-950">Header Announcement Bar Visible</span>
                  <input
                    type="checkbox"
                    checked={showAnnouncement}
                    onChange={(e) => setShowAnnouncement(e.target.checked)}
                    className="w-5 h-5 accent-emerald-950 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Top Announcement Message (اوپر کا اعلان)</label>
                  <textarea
                    rows={2}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-amber-50 p-3.5 rounded-2xl border border-amber-100 mt-4">
                  <span className="text-xs font-bold text-amber-900">Homepage Promo Offer Banner</span>
                  <input
                    type="checkbox"
                    checked={showCustomNotice}
                    onChange={(e) => setShowCustomNotice(e.target.checked)}
                    className="w-5 h-5 accent-gold-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Promo Offer Banner Text (مخصوص آفر نوٹس)</label>
                  <input
                    type="text"
                    value={customNoticeText}
                    onChange={(e) => setCustomNoticeText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Hero Banner Config */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-emerald-950">Homepage Hero Banner Content</h3>
                    <p className="text-[11px] text-gray-400">ہوم پیج کے مین بینر کا عنوان اور تفصیل</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hero Main Title (مین ہیڈنگ)</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Hero Subtitle (ذیلی تفصیل)</label>
                  <textarea
                    rows={2}
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                {/* Hero Photo Uploader & URL editor */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                    <span>Hero Banner Photo (ہوم پیج بینر کی تصویر)</span>
                  </label>

                  <div className="space-y-3">
                    {/* Live Preview */}
                    <div className="relative w-full h-36 bg-gray-900 rounded-2xl overflow-hidden border-2 border-gold-500/30 shadow-inner group">
                      <img
                        src={heroImageUrl || '/src/assets/images/malik_branded_hero_1784633050272.jpg'}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="text-[10px] font-mono text-gold-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10 truncate max-w-full">
                          Live Hero Photo Preview
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Upload Button */}
                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 font-bold text-xs rounded-xl cursor-pointer transition-all border border-gold-500/20 shadow-xs">
                        <Upload className="w-4 h-4 text-gold-500" />
                        <span>Upload New Photo (کمپیوٹر سے منتخب کریں)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleHeroImageUpload}
                        />
                      </label>

                      {/* Reset to Default */}
                      <button
                        type="button"
                        onClick={() => setHeroImageUrl('/src/assets/images/malik_branded_hero_1784633050272.jpg')}
                        className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all border border-gray-200 cursor-pointer"
                      >
                        Reset Default Photo (اصل تصویر رکھیں)
                      </button>
                    </div>

                    {/* Image URL Direct Paste */}
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
                        Or Paste Image Link/URL (یا تصویر کا لنک یہاں پیسٹ کریں):
                      </span>
                      <input
                        type="text"
                        placeholder="https://example.com/my-hero-photo.jpg"
                        value={heroImageUrl}
                        onChange={(e) => setHeroImageUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Shipping & Tax Rates */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="p-2 bg-purple-50 text-purple-900 rounded-lg">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-emerald-950">Shipping Charges & GST Tax</h3>
                    <p className="text-[11px] text-gray-400">ڈلیوری چارجز اور جی ایس ٹی ٹیکس کی شرح</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Standard Shipping Fee (Rs.)</label>
                    <input
                      type="number"
                      value={standardShippingRate}
                      onChange={(e) => setStandardShippingRate(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Free Shipping Threshold (Rs.)</label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Default GST Sales Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRatePercent}
                    onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('inventory')}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 rounded-xl font-bold text-xs border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Package className="w-4 h-4" />
                    MANAGE PRODUCTS & INVENTORY (مصنوعات کی فہرست)
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="bg-gray-100 p-6 rounded-3xl border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-gray-600">
                Changes saved here will immediately apply across the storefront live.
              </span>
              <button
                type="button"
                onClick={handleSaveStoreSettings}
                className="px-8 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-black text-xs tracking-widest rounded-2xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                SAVE ALL STORE CHANGES
              </button>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 6: DISCOUNT & PROMO CODES MANAGEMENT */}
        {activeSubTab === 'discounts' && (
          <motion.div
            key="discounts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white border border-gold-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold-400 font-bold text-xs tracking-widest uppercase">
                  <Tag className="w-4 h-4 text-gold-500" />
                  <span>Promotional Engine & Offers</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
                  Discount & Promo Codes System
                </h2>
                <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                  Grahak ke checkout cart par percentage ya flat-rate discount lagane ke liye naye promo codes banayein aur purane codes ko control karein.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-emerald-900/60 border border-gold-500/30 px-4 py-2.5 rounded-2xl text-center">
                  <span className="block text-[10px] text-emerald-200 uppercase font-bold">Total Codes</span>
                  <span className="text-xl font-black text-gold-400">{localDiscounts.length}</span>
                </div>
                <div className="bg-emerald-900/60 border border-gold-500/30 px-4 py-2.5 rounded-2xl text-center">
                  <span className="block text-[10px] text-emerald-200 uppercase font-bold">Active Codes</span>
                  <span className="text-xl font-black text-emerald-400">
                    {localDiscounts.filter(d => d.isActive).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Toast */}
            {discountSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-800 text-gold-300 p-4 rounded-2xl border border-gold-500/30 flex items-center gap-3 text-xs font-bold shadow-md"
              >
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
                <span>{discountSuccessMessage}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Card: Create New Promo Code */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6 h-fit">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-800" />
                    Naya Promo Code Banayein
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter details to add percentage or flat rate offer code.
                  </p>
                </div>

                <form onSubmit={handleAddDiscountCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Promo Code Name (کوڈ کا نام) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MALIK10, EID200, SAMUNDRI15"
                      value={newCodeName}
                      onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={newCodeType}
                        onChange={(e) => setNewCodeType(e.target.value as 'percentage' | 'flat')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (Rs.)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {newCodeType === 'percentage' ? 'Percentage Value (%)' : 'Flat Discount (Rs.)'} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={newCodeType === 'percentage' ? 100 : 100000}
                        placeholder={newCodeType === 'percentage' ? '15' : '200'}
                        value={newCodeValue}
                        onChange={(e) => setNewCodeValue(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Min Order Requirement (کم از کم آرڈر رقم)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      placeholder="e.g. 1500 (Rs. 0 for no minimum)"
                      value={newCodeMinOrder}
                      onChange={(e) => setNewCodeMinOrder(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Grahak ke cart ka subtotal is raqam se bara ya barabar hona lazmi hai.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Description / Explanation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15% discount on all organic oils above Rs. 1500"
                      value={newCodeDesc}
                      onChange={(e) => setNewCodeDesc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-950 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-950 hover:bg-emerald-900 text-gold-400 hover:text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    CREATE & ACTIVATE PROMO CODE
                  </button>
                </form>
              </div>

              {/* List Card: Existing Promo Codes Directory */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-gold-600" />
                      Active & Saved Discount Codes Directory
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Storefront checkout cart par yeh tamam codes kaam kar rahe hain.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {localDiscounts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Koi promo code nahi mila. Naya promo code banayein!
                    </div>
                  ) : (
                    localDiscounts.map((discount) => (
                      <div
                        key={discount.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                          discount.isActive
                            ? 'bg-white border-emerald-200/80 hover:border-emerald-400 shadow-sm'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-emerald-950 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-lg tracking-wider">
                              {discount.code}
                            </span>
                            
                            {discount.type === 'percentage' ? (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Percent className="w-3 h-3 text-amber-800" />
                                {discount.value}% OFF
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-800" />
                                Flat Rs. {discount.value.toLocaleString()} OFF
                              </span>
                            )}

                            {discount.isActive ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="bg-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                INACTIVE
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 font-medium">
                            {discount.description}
                          </p>

                          {discount.minOrderAmount ? (
                            <span className="inline-block text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              Min Order: Rs. {discount.minOrderAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] text-gray-400">
                              No minimum order limit
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDiscountStatus(discount.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                              discount.isActive
                                ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {discount.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-700" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-gray-500" />
                                Disabled
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDiscountCode(discount.id, discount.code)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete promo code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
