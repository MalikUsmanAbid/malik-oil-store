export interface Product {
  id: string;
  name: string;
  urduName?: string;
  description: string;
  price: number; // in PKR (Rs.)
  unit: string;  // e.g., "1 Litre", "Kg", "5 Kg"
  image: string; // Tailwind representation or high-quality illustration
  stock: number;
  category: 'Pure Oil' | 'By-Product' | 'Animal Feed';
  isActive?: boolean; // Controls storefront visibility
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  unit: string;
}

export interface Order {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number; // dynamically calculated based on province (GST)
  shipping: number;
  discount?: number;
  discountCode?: string;
  total: number;
  paymentMethod: 'COD' | 'Card' | 'Bank Transfer';
  paymentStatus: 'Paid' | 'Unpaid';
  orderStatus: 'Pending' | 'Dispatched' | 'Delivered' | 'Cancelled';
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number; // e.g. 10 for 10% or 200 for Rs. 200
  minOrderAmount?: number;
  isActive: boolean;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface TaxRate {
  province: string;
  rate: number; // percentage (e.g., 0.15 for 15%)
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  announcementText: string;
  showAnnouncement: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  logoUrl?: string;
  estYear: string;
  standardShippingRate: number;
  freeShippingThreshold: number;
  taxRatePercent: number;
  customNoticeText?: string;
  showCustomNotice?: boolean;
}
