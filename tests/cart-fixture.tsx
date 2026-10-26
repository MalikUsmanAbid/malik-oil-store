import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Cart from '../src/components/Cart';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from '../src/data/initialData';
import type { Order } from '../src/types';
import '../src/index.css';

function Fixture() {
  const [calls, setCalls] = useState(0);
  return <><output data-testid="calls">{calls}</output><Cart isOpen onClose={() => {}} cartItems={[{ product: INITIAL_PRODUCTS[0], quantity: 1 }]} discountCodes={[]} storeSettings={DEFAULT_STORE_SETTINGS} onUpdateQuantity={() => {}} onRemoveItem={() => {}}
    onPlaceOrder={async request => {
      setCalls(value => value + 1);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (location.search.includes('fail')) throw new Error('Order could not be saved. Please try again.');
      return { ...request, id: 'ord-' + request.requestId, invoiceNo: 'MEO-CONFIRMED', orderDate: new Date().toISOString(), items: [], subtotal: 650, tax: 0, shipping: 200, total: 850, paymentStatus: 'Unpaid', orderStatus: 'Pending' } as Order;
    }} /></>;
}
createRoot(document.getElementById('root')!).render(<Fixture />);
