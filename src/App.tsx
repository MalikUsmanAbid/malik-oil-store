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
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS, DEFAULT_STORE_SETTINGS, INITIAL_DISCOUNT_CODES } from './data/initialData';

export default function App() {
  // Central State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);

  // Navigation and UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'about' | 'track'
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize and Synchronize from local storage
  useEffect(() => {
    const storedProducts = localStorage.getItem('malik_oil_products');
    const storedOrders = localStorage.getItem('malik_oil_orders');
    const storedCustomers = localStorage.getItem('malik_oil_customers');
    const storedCart = localStorage.getItem('malik_oil_cart');
    const storedSettings = localStorage.getItem('malik_oil_store_settings');
    const storedDiscounts = localStorage.getItem('malik_oil_discount_codes');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('malik_oil_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders(INITIAL_ORDERS);
      localStorage.setItem('malik_oil_orders', JSON.stringify(INITIAL_ORDERS));
    }

    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      setCustomers(INITIAL_CUSTOMERS);
      localStorage.setItem('malik_oil_customers', JSON.stringify(INITIAL_CUSTOMERS));
    }

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    if (storedSettings) {
      setStoreSettings(JSON.parse(storedSettings));
    } else {
      localStorage.setItem('malik_oil_store_settings', JSON.stringify(DEFAULT_STORE_SETTINGS));
    }

    if (storedDiscounts) {
      setDiscountCodes(JSON.parse(storedDiscounts));
    } else {
      setDiscountCodes(INITIAL_DISCOUNT_CODES);
      localStorage.setItem('malik_oil_discount_codes', JSON.stringify(INITIAL_DISCOUNT_CODES));
    }
  }, []);

  // Helper helper to save states
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('malik_oil_products', JSON.stringify(updatedProducts));
  };

  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('malik_oil_orders', JSON.stringify(updatedOrders));
  };

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem('malik_oil_customers', JSON.stringify(updatedCustomers));
  };

  const saveCart = (updatedCart: { product: Product; quantity: number }[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('malik_oil_cart', JSON.stringify(updatedCart));
  };

  const saveStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    localStorage.setItem('malik_oil_store_settings', JSON.stringify(newSettings));
  };

  const saveDiscountCodes = (updatedCodes: DiscountCode[]) => {
    setDiscountCodes(updatedCodes);
    localStorage.setItem('malik_oil_discount_codes', JSON.stringify(updatedCodes));
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;
      
      // Prevent exceeding stock limit
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

    saveCart(updatedCart);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.product.id !== productId);
    saveCart(updatedCart);
  };

  // Checkout Placement Handler
  const handlePlaceOrder = (newOrder: Order) => {
    // 1. Add order to order list
    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);

    // 2. Reduce products inventory levels
    const updatedProducts = products.map(prod => {
      const orderedItem = newOrder.items.find(it => it.productId === prod.id);
      if (orderedItem) {
        const newStock = Math.max(0, prod.stock - orderedItem.quantity);
        return { ...prod, stock: newStock };
      }
      return prod;
    });
    saveProducts(updatedProducts);

    // 3. Synchronize / register customer details
    const existingCustIndex = customers.findIndex(
      c => c.phone === newOrder.customerPhone || c.email === newOrder.customerEmail
    );
    let updatedCustomers = [...customers];

    if (existingCustIndex > -1) {
      updatedCustomers[existingCustIndex] = {
        ...updatedCustomers[existingCustIndex],
        totalOrders: updatedCustomers[existingCustIndex].totalOrders + 1,
        totalSpent: updatedCustomers[existingCustIndex].totalSpent + newOrder.total,
        lastOrderDate: new Date().toISOString().split('T')[0],
      };
    } else {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        phone: newOrder.customerPhone,
        address: newOrder.address,
        city: newOrder.city,
        totalOrders: 1,
        totalSpent: newOrder.total,
        lastOrderDate: new Date().toISOString().split('T')[0],
      };
      updatedCustomers.push(newCust);
    }
    saveCustomers(updatedCustomers);

    // 4. Reset Cart
    saveCart([]);
  };

  // Admin Panel callbacks
  const handleAddProduct = (newProduct: Product) => {
    saveProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    const updated = products.map(p => (p.id === productId ? { ...p, stock: newStock } : p));
    saveProducts(updated);
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    const updated = products.map(p => (p.id === productId ? { ...p, price: newPrice } : p));
    saveProducts(updated);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o));
    saveOrders(updated);
  };

  const handleUpdatePaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, paymentStatus: status } : o));
    saveOrders(updated);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F5] selection:bg-gold-500 selection:text-white">
      {/* Universal Sticky Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onAdminToggle={() => {
          setIsAdmin(!isAdmin);
          setActiveTab('home'); // Reset tab on switch
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setIsAdmin(false); // Entering user mode
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
            onUpdateStoreSettings={saveStoreSettings}
            onUpdateDiscountCodes={saveDiscountCodes}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateProductPrice={handleUpdateProductPrice}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
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
