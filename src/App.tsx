import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Storefront from './components/Storefront';
const Cart = lazy(() => import('./components/Cart'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const OrderHelp = lazy(() => import('./components/OrderHelp'));
const About = lazy(() => import('./components/About'));
const OrderTracker = lazy(() => import('./components/OrderTracker'));
import Footer from './components/Footer';

import type { CheckoutRequest } from './utils/checkout';
import { Product, Order, Customer, StoreSettings, DiscountCode } from './types';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from './data/initialData';
import {
  subscribeToAuth,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToCustomers,
  subscribeToSettings,
  subscribeToDiscountCodes,
  addProduct as dbAddProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  updateProductStock as dbUpdateProductStock,
  updateProductPrice as dbUpdateProductPrice,
  placeOrder as dbPlaceOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  updatePaymentStatus as dbUpdatePaymentStatus,
  deleteOrder as dbDeleteOrder,
  saveStoreSettings as dbSaveStoreSettings,
  saveDiscountCode as dbSaveDiscountCode,
  deleteDiscountCode as dbDeleteDiscountCode
} from './services/dbService';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

// Initial helper to read from localStorage immediately
function loadInitialLocal<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

export default function App() {
  // Central Real-time State initialized immediately from localStorage / Browser Storage
  const [products, setProducts] = useState<Product[]>(() => loadInitialLocal('malik_oil_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => []);
  const [customers, setCustomers] = useState<Customer[]>(() => []);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => loadInitialLocal('malik_oil_store_settings', DEFAULT_STORE_SETTINGS));
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => []);

  // Local Shopping Cart State for current visitor session
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>(() => { const saved = loadInitialLocal<unknown>('malik_oil_cart', []); return Array.isArray(saved) ? saved.filter(line => line?.product?.id && Number.isInteger(line.quantity) && line.quantity > 0) : []; });

  // Navigation & UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'about' | 'track'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartHasOpened, setCartHasOpened] = useState(false);
  useEffect(() => { if (isCartOpen) setCartHasOpened(true); }, [isCartOpen]);

  // Sync / Connection state
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    try { for (const key of ['malik_oil_orders', 'malik_oil_customers']) localStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
    const failed = () => setSyncError('Store data could not refresh. Please check your connection before ordering.');
    const unsubs = [
      subscribeToProducts(data => { setProducts(data); setSyncError(null); }, failed),
      subscribeToSettings(setStoreSettings, failed),
      subscribeToDiscountCodes(setDiscountCodes, failed)
    ];
    let privateUnsubs: (() => void)[] = [];
    const unsubAuth = subscribeToAuth(user => {
      privateUnsubs.forEach(unsub => unsub());
      privateUnsubs = [];
      setOrders([]); setCustomers([]);
      if (user) privateUnsubs = [subscribeToOrders(setOrders, failed), subscribeToCustomers(setCustomers, failed)];
    });
    return () => { unsubs.forEach(unsub => unsub()); privateUnsubs.forEach(unsub => unsub()); unsubAuth(); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('malik_oil_cart', JSON.stringify(cartItems)); } catch { /* Private browsing/storage limit */ }
  }, [cartItems]);

  useEffect(() => {
    setCartItems(previous => previous.flatMap(line => {
      const product = products.find(p => p.id === line.product.id && p.isActive !== false);
      if (!product || product.stock < 1) return [];
      return [{ product, quantity: Math.min(line.quantity, product.stock) }];
    }));
  }, [products]);

  // Cart operations (In-Memory per session)
  const handleAddToCart = (product: Product, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || product.isActive === false) return;
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;

      if (targetQty > product.stock) {
        alert(`Sorry, you cannot add more. Only ${product.stock} items left in stock.`);
        return;
      }
      updatedCart[existingIndex].quantity = targetQty;
    } else {
      if (quantity > product.stock) {
        alert(`Sorry, only ${product.stock} items are in stock.`);
        return;
      }
      updatedCart.push({ product, quantity });
    }

    setCartItems(updatedCart);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (!Number.isFinite(newQuantity)) return;
    const updatedCart = cartItems.flatMap(item => {
      if (item.product.id === productId) {
        // Keep cart state valid even if a quantity update comes from a stale UI
        // event or a future caller outside the Cart component.
        if (item.product.stock <= 0) return [];
        const safeQuantity = Math.min(item.product.stock, Math.max(1, Math.floor(newQuantity)));
        return [{ ...item, quantity: safeQuantity }];
      }
      return [item];
    });
    setCartItems(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    setCartItems(updatedCart);
  };

  const handlePlaceOrder = async (request: CheckoutRequest): Promise<Order> => {
    const saved = await dbPlaceOrder(request);
    setCartItems([]);
    return saved;
  };
  // Admin Panel callbacks -> Real-time Firestore Mutations
  const handleAddProduct = async (newProduct: Product) => {
    try {
      await dbAddProduct(newProduct);
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await dbUpdateProduct(updatedProduct);
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await dbDeleteProduct(productId);
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    try {
      await dbUpdateProductStock(productId, newStock);
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const handleUpdateProductPrice = async (productId: string, newPrice: number) => {
    try {
      await dbUpdateProductPrice(productId, newPrice);
    } catch (err) {
      console.error('Error updating price:', err);
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      await dbUpdateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    try {
      await dbUpdatePaymentStatus(orderId, status);
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await dbDeleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  };

  const handleSaveStoreSettings = async (newSettings: StoreSettings) => {
    try {
      await dbSaveStoreSettings(newSettings);
      setStoreSettings(newSettings);
    } catch (err) {
      console.error('Error saving store settings:', err);
      throw err;
    }
  };

  const handleSaveDiscountCodes = async (updatedCodes: DiscountCode[]) => {
    try {
      for (const dc of updatedCodes) {
        await dbSaveDiscountCode(dc);
      }
      for (const removed of discountCodes.filter(old => !updatedCodes.some(code => code.id === old.id))) await dbDeleteDiscountCode(removed.id);
      setDiscountCodes(updatedCodes);
    } catch (err) {
      console.error('Error saving discount codes:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-serif text-emerald-950">Malik Oil Expellers</h2>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          Synchronizing with Firebase Cloud Database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F5] selection:bg-gold-500 selection:text-white">
      {/* Real-Time Sync Indicator Banner if sync issue */}
      {syncError && (
        <div className="bg-rose-600 text-white text-xs px-4 py-2 text-center flex items-center justify-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4" />
          {syncError}
        </div>
      )}

      {/* Universal Sticky Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onAdminToggle={() => {
          setIsAdmin(!isAdmin);
          setActiveTab('home');
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsAdmin(false);
          setActiveTab(tab);
        }}
        onTrackOrderClick={() => {
          setIsAdmin(false);
          setActiveTab('track');
        }}
        storeSettings={storeSettings}
      />

      {/* Main content viewport */}
      <main className="flex-1">
        {isAdmin ? (
          /* SHOPIFY ADMIN VIEW */
          <Suspense fallback={<p className="p-6 text-center">Loading store admin...</p>}><AdminDashboard
            products={products}
            orders={orders}
            customers={customers}
            storeSettings={storeSettings}
            discountCodes={discountCodes}
            onUpdateStoreSettings={handleSaveStoreSettings}
            onUpdateDiscountCodes={handleSaveDiscountCodes}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateProductPrice={handleUpdateProductPrice}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onDeleteOrder={handleDeleteOrder}
          /></Suspense>
        ) : (
          /* CUSTOMER STOREFRONT PORTAL */
          <>
            {activeTab === 'home' && (
              <>
                <Hero
                  storeSettings={storeSettings}
                  onOrderNowClick={() => {
                    const el = document.getElementById('products-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <Storefront
                  products={products}
                  storeSettings={storeSettings}
                  onAddToCart={handleAddToCart}
                  cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                />
              </>
            )}

            {activeTab === 'about' && <Suspense fallback={<p className="p-6">Loading...</p>}><About storeSettings={storeSettings} /></Suspense>}

            {activeTab === 'policies' && <Suspense fallback={<p className="p-6">Loading...</p>}><OrderHelp settings={storeSettings} /></Suspense>}
            {activeTab === 'track' && <Suspense fallback={<p className="p-6">Loading tracking...</p>}><OrderTracker phone={storeSettings.phone} /></Suspense>}
          </>
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        storeSettings={storeSettings}
        onNavClick={(tab) => {
          setIsAdmin(false);
          setActiveTab(tab);
        }}
        onTrackOrderClick={() => {
          setIsAdmin(false);
          setActiveTab('track');
        }}
      />

      {/* Shopping Cart Drawer */}
      {(isCartOpen || cartHasOpened) && <Suspense fallback={<p role="status" className="fixed bottom-4 right-4 bg-white p-4 shadow">Opening cart...</p>}><Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        discountCodes={discountCodes}
        storeSettings={storeSettings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onPlaceOrder={handlePlaceOrder}
      /></Suspense>}
    </div>
  );
}
