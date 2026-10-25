import { Product, Order, Customer, TaxRate, StoreSettings, DiscountCode } from '../types';
import heroBanner from '../assets/images/malik_branded_hero_1784633050272.jpg';
import brandLogo from '../assets/images/malik_real_logo_1784634645165.jpg';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Malik Oil Expellers',
  tagline: 'Pure Cold-Pressed Oils & Organic Livestock Feed',
  phone: '0300-7618236',
  whatsapp: '923007618236',
  email: 'info@malikoil.pk',
  address: 'Tandila Road, Samundri, District Faisalabad, Punjab, Pakistan',
  announcementText: '🚚 Free Express Shipping across Pakistan on orders above Rs. 3,500! | 100% Pure Organic Cold-Pressed Oils',
  showAnnouncement: true,
  heroTitle: 'Purity Direct From Our Expellers',
  heroSubtitle: 'Traditional wood-pressed natural oils and high-protein livestock feed directly from our family mills in Samundri & Vehari.',
  heroImageUrl: heroBanner,
  logoUrl: brandLogo,
  estYear: '1970',
  standardShippingRate: 200,
  freeShippingThreshold: 3500,
  taxRatePercent: 0,
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
  { province: 'Punjab', rate: 0 },
  { province: 'Sindh', rate: 0 },
  { province: 'Khyber Pakhtunkhwa', rate: 0 },
  { province: 'Balochistan', rate: 0 },
  { province: 'Federal Capital Islamabad', rate: 0 }
];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];

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
