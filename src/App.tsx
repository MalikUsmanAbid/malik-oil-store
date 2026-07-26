import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Storefront from './components/Storefront';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import OrderTracker from './components/OrderTracker';
import Footer from './components/Footer';

import { Product, Order, Customer, StoreSettings, DiscountCode } from './types';
import { DEFAULT_STORE_SETTINGS, INITIAL_DISCOUNT_CODES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } from './data/initialData';
import {
  initializeAndMigrateFirestore,
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
  const [orders, setOrders] = useState<Order[]>(() => loadInitialLocal('malik_oil_orders', INITIAL_ORDERS));
  const [customers, setCustomers] = useState<Customer[]>(() => loadInitialLocal('malik_oil_customers', INITIAL_CUSTOMERS));
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => loadInitialLocal('malik_oil_store_settings', DEFAULT_STORE_SETTINGS));
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => loadInitialLocal('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES));

  // Local Shopping Cart State for current visitor session
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);

  // Navigation & UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'about' | 'track'
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync / Connection state
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Initialize and Synchronize from Firestore in background
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    async function setupFirestore() {
      try {
        // Step 1: Ensure initial database seed / migration from legacy storage
        await initializeAndMigrateFirestore();

        // Step 2: Establish real-time snapshot listeners
        const unsubProds = subscribeToProducts(
          fetchedProds => {
            if (fetchedProds && fetchedProds.length > 0) {
              setProducts(fetchedProds);
            }
          },
          err => console.warn('Products sync using local browser storage')
        );

        const unsubOrders = subscribeToOrders(
          fetchedOrders => {
            if (fetchedOrders) setOrders(fetchedOrders);
          },
          err => console.warn('Orders sync using local browser storage')
        );

        const unsubCusts = subscribeToCustomers(
          fetchedCusts => {
            if (fetchedCusts) setCustomers(fetchedCusts);
          },
          err => console.warn('Customers sync using local browser storage')
        );

        const unsubSettings = subscribeToSettings(
          fetchedSettings => {
            if (fetchedSettings) setStoreSettings(fetchedSettings);
          },
          err => console.warn('Settings sync using local browser storage')
        );

        const unsubDiscounts = subscribeToDiscountCodes(
          fetchedDiscounts => {
            if (fetchedDiscounts && fetchedDiscounts.length > 0) {
              setDiscountCodes(fetchedDiscounts);
            }
          },
          err => console.warn('Discounts sync using local browser storage')
        );

        unsubs = [unsubProds, unsubOrders, unsubCusts, unsubSettings, unsubDiscounts];
      } catch (err) {
        console.warn('Firestore fallback to local browser storage:', err);
      }
    }

    setupFirestore();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Cart operations (In-Memory per session)
  const handleAddToCart = (product: Product, quantity: number) => {
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

  // Checkout Placement Handler -> Firestore Real-Time Write + Instant Local Update
  const handlePlaceOrder = async (newOrder: Order) => {
    try {
      await dbPlaceOrder(newOrder, products, customers);
      // Update the UI only after the cloud write succeeds.
      setOrders(prev => prev.some(o => o.id === newOrder.id) ? prev : [newOrder, ...prev]);
      setProducts(prevProducts => prevProducts.map(product => {
        const orderedItem = newOrder.items.find(item => item.productId === product.id);
        return orderedItem
          ? { ...product, stock: Math.max(0, product.stock - orderedItem.quantity) }
          : product;
      }));
      setCartItems([]);
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
      const firebaseError = err as { code?: string; message?: string };
      const detail = firebaseError?.code || firebaseError?.message || 'Unknown Firebase error';
      alert(`Order cloud database me save nahi ho saka: ${detail}`);
    }
  };

  // Admin Panel callbacks -> Real-time Firestore Mutations
  const handleAddProduct = async (newProduct: Product) => {
    try {
      await dbAddProduct(newProduct);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product to Firestore.');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await dbUpdateProduct(updatedProduct);
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product in Firestore.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await dbDeleteProduct(productId);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product from Firestore.');
    }
  };

  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    try {
      await dbUpdateProductStock(productId, newStock);
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleUpdateProductPrice = async (productId: string, newPrice: number) => {
    try {
      await dbUpdateProductPrice(productId, newPrice);
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    try {
      await dbUpdateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    try {
      await dbUpdatePaymentStatus(orderId, status);
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await dbDeleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Order delete karne me masla aaya.');
    }
  };

  const handleSaveStoreSettings = async (newSettings: StoreSettings) => {
    try {
      await dbSaveStoreSettings(newSettings);
      setStoreSettings(newSettings);
    } catch (err) {
      console.error('Error saving store settings:', err);
      alert('Failed to save settings to Firestore.');
    }
  };

  const handleSaveDiscountCodes = async (updatedCodes: DiscountCode[]) => {
    try {
      for (const dc of updatedCodes) {
        await dbSaveDiscountCode(dc);
      }
      setDiscountCodes(updatedCodes);
    } catch (err) {
      console.error('Error saving discount codes:', err);
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
          <AdminDashboard
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
          />
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
                  onAddToCart={handleAddToCart}
                  cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                />
              </>
            )}

            {activeTab === 'about' && <About />}

            {activeTab === 'track' && <OrderTracker orders={orders} />}
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
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        discountCodes={discountCodes}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
