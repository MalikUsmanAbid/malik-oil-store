import { Product, Order, Customer, TaxRate, StoreSettings, DiscountCode } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Malik Oil Expellers',
  tagline: 'Pure Cold-Pressed Oils & Organic Livestock Feed',
  phone: '0300-1234567',
  whatsapp: '923001234567',
  email: 'info@malikoil.pk',
  address: 'Vehari Road, Samundri, District Faisalabad, Punjab, Pakistan',
  announcementText: '🚚 Free Express Shipping across Pakistan on orders above Rs. 3,500! | 100% Pure Organic Cold-Pressed Oils',
  showAnnouncement: true,
  heroTitle: 'Purity Direct From Our Expellers',
  heroSubtitle: 'Traditional wood-pressed natural oils and high-protein livestock feed directly from our family mills in Samundri & Vehari.',
  heroImageUrl: '/src/assets/images/malik_branded_hero_1784633050272.jpg',
  logoUrl: '/src/assets/images/malik_real_logo_1784634645165.jpg',
  estYear: '1970',
  standardShippingRate: 200,
  freeShippingThreshold: 3500,
  taxRatePercent: 18,
  customNoticeText: '⚡ Special Seasonal Offer: Get 10% instant discount on bulk Mustard Feed Bags!',
  showCustomNotice: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Canola Oil',
    urduName: 'کینولا آئل',
    description: '100% Pure, cold-pressed Canola Oil. Ideal for healthy daily cooking, high in Omega-3 and low in saturated fats.',
    price: 650,
    unit: '1 Litre',
    image: 'canola',
    stock: 120,
    category: 'Pure Oil',
    isActive: true
  },
  {
    id: 'p2',
    name: 'Sarson Oil (Mustard)',
    urduName: 'سرسوں کا تیل',
    description: 'Traditionally extracted cold-pressed Mustard Oil. Strong aroma and rich taste, perfect for traditional cooking, pickles, and massage.',
    price: 550,
    unit: '1 Litre',
    image: 'sarson',
    stock: 250,
    category: 'Pure Oil',
    isActive: true
  },
  {
    id: 'p3',
    name: 'Til Oil (Sesame)',
    urduName: 'تل کا تیل',
    description: 'Premium wood-pressed Sesame (Til) Oil. Deep nutty flavor, rich in antioxidants, vitamins, and minerals.',
    price: 850,
    unit: '1 Litre',
    image: 'til',
    stock: 75,
    category: 'Pure Oil',
    isActive: true
  },
  {
    id: 'p4',
    name: 'Taramira Oil',
    urduName: 'تارامیرا کا تیل',
    description: 'Pure Rocket Seed (Taramira) Oil. Highly effective for hair care, skin issues, and traditional therapeutic remedies.',
    price: 700,
    unit: '1 Litre',
    image: 'taramira',
    stock: 90,
    category: 'Pure Oil',
    isActive: true
  },
  {
    id: 'p5',
    name: 'Khall (Sarson Cake)',
    urduName: 'کھل (سرسوں)',
    description: 'Nutritious oil-cake byproduct from Mustard pressing. Highly recommended high-protein organic feed for milking livestock.',
    price: 35,
    unit: 'Kg',
    image: 'khall',
    stock: 1500,
    category: 'By-Product',
    isActive: true
  },
  {
    id: 'p6',
    name: 'Wanda (Premium Feed)',
    urduName: 'وانڈا (پشووں کی خوراک)',
    description: 'Balanced compound feed containing grain proteins, vitamins, and essential minerals for optimal dairy animal health and milk yields.',
    price: 30,
    unit: 'Kg',
    image: 'wanda',
    stock: 2000,
    category: 'Animal Feed',
    isActive: true
  }
];

export const TAX_RATES: TaxRate[] = [
  { province: 'Punjab (16% GST)', rate: 0.16 },
  { province: 'Sindh (13% GST)', rate: 0.13 },
  { province: 'Khyber Pakhtunkhwa (15% GST)', rate: 0.15 },
  { province: 'Balochistan (15% GST)', rate: 0.15 },
  { province: 'Federal Capital Islamabad (15% GST)', rate: 0.15 }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    invoiceNo: 'MEO-1024',
    customerName: 'Muhammad Usman',
    customerEmail: 'usman.abid@gmail.com',
    customerPhone: '0300-1234567',
    address: 'Chaudhry House, Block B',
    city: 'Samundri',
    province: 'Punjab (16% GST)',
    orderDate: '2026-07-10T14:32:00-07:00',
    items: [
      { id: 'oi1', productId: 'p1', productName: 'Canola Oil', quantity: 5, priceAtPurchase: 650, unit: '1 Litre' },
      { id: 'oi2', productId: 'p2', productName: 'Sarson Oil (Mustard)', quantity: 10, priceAtPurchase: 550, unit: '1 Litre' }
    ],
    subtotal: 8750,
    tax: 1400, // 16% of 8750 is 1400
    shipping: 250,
    total: 10400,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered'
  },
  {
    id: 'o2',
    invoiceNo: 'MEO-1025',
    customerName: 'Aisha Bibi',
    customerEmail: 'aisha.dairy@yahoo.com',
    customerPhone: '0312-9876543',
    address: 'Al-Noor Dairy Farm, Bypass Road',
    city: 'Okara',
    province: 'Punjab (16% GST)',
    orderDate: '2026-07-15T09:15:00-07:00',
    items: [
      { id: 'oi3', productId: 'p5', productName: 'Khall (Sarson Cake)', quantity: 100, priceAtPurchase: 35, unit: 'Kg' },
      { id: 'oi4', productId: 'p6', productName: 'Wanda (Premium Feed)', quantity: 200, priceAtPurchase: 30, unit: 'Kg' }
    ],
    subtotal: 9500,
    tax: 1520, // 16% of 9500 is 1520
    shipping: 1200, // Heavy weight shipping
    total: 12220,
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    orderStatus: 'Dispatched'
  },
  {
    id: 'o3',
    invoiceNo: 'MEO-1026',
    customerName: 'Zainab Fatima',
    customerEmail: 'zainab.f@gmail.com',
    customerPhone: '0333-5551212',
    address: 'Defence Phase 6',
    city: 'Karachi',
    province: 'Sindh (13% GST)',
    orderDate: '2026-07-18T18:40:00-07:00',
    items: [
      { id: 'oi5', productId: 'p3', productName: 'Til Oil (Sesame)', quantity: 2, priceAtPurchase: 850, unit: '1 Litre' },
      { id: 'oi6', productId: 'p4', productName: 'Taramira Oil', quantity: 3, priceAtPurchase: 700, unit: '1 Litre' }
    ],
    subtotal: 3800,
    tax: 494, // 13% of 3800 is 494
    shipping: 350,
    total: 4644,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    orderStatus: 'Pending'
  },
  {
    id: 'o4',
    invoiceNo: 'MEO-1027',
    customerName: 'Kamran Khan',
    customerEmail: 'kamran_peshawar@hotmail.com',
    customerPhone: '0321-4448899',
    address: 'Hayatabad Phase 3',
    city: 'Peshawar',
    province: 'Khyber Pakhtunkhwa (15% GST)',
    orderDate: '2026-07-19T11:05:00-07:00',
    items: [
      { id: 'oi7', productId: 'p2', productName: 'Sarson Oil (Mustard)', quantity: 6, priceAtPurchase: 550, unit: '1 Litre' }
    ],
    subtotal: 3300,
    tax: 495, // 15% of 3300 is 495
    shipping: 300,
    total: 4095,
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    orderStatus: 'Pending'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Muhammad Usman',
    email: 'usman.abid@gmail.com',
    phone: '0300-1234567',
    address: 'Chaudhry House, Block B',
    city: 'Samundri',
    totalOrders: 1,
    totalSpent: 10400,
    lastOrderDate: '2026-07-10'
  },
  {
    id: 'c2',
    name: 'Aisha Bibi',
    email: 'aisha.dairy@yahoo.com',
    phone: '0312-9876543',
    address: 'Al-Noor Dairy Farm, Bypass Road',
    city: 'Okara',
    totalOrders: 1,
    totalSpent: 12220,
    lastOrderDate: '2026-07-15'
  },
  {
    id: 'c3',
    name: 'Zainab Fatima',
    email: 'zainab.f@gmail.com',
    phone: '0333-5551212',
    address: 'Defence Phase 6',
    city: 'Karachi',
    totalOrders: 1,
    totalSpent: 4644,
    lastOrderDate: '2026-07-18'
  },
  {
    id: 'c4',
    name: 'Kamran Khan',
    email: 'kamran_peshawar@hotmail.com',
    phone: '0321-4448899',
    address: 'Hayatabad Phase 3',
    city: 'Peshawar',
    totalOrders: 1,
    totalSpent: 4095,
    lastOrderDate: '2026-07-19'
  }
];

export const INITIAL_DISCOUNT_CODES: DiscountCode[] = [
  {
    id: 'dc1',
    code: 'MALIK10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1000,
    isActive: true,
    description: '10% OFF on orders above Rs. 1,000 (ملک10 ڈسکاؤنٹ)'
  },
  {
    id: 'dc2',
    code: 'ASLI200',
    type: 'flat',
    value: 200,
    minOrderAmount: 2000,
    isActive: true,
    description: 'Flat Rs. 200 OFF on orders above Rs. 2,000'
  },
  {
    id: 'dc3',
    code: 'SAMUNDRI15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 3500,
    isActive: true,
    description: 'Special 15% OFF on orders above Rs. 3,500'
  }
];
