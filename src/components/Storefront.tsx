import React, { useState } from 'react';
import { Product } from '../types';
import { getProductImage } from '../utils/imageMapper';
import { Search, ShoppingCart, Truck, ShieldCheck, Heart, Headphones, Sparkles, AlertTriangle, Eye, Check, RefreshCw, Star, MessageSquare, Calculator, Award, HelpCircle, Activity, ChevronDown, ChevronUp, Calendar, Compass, Send, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  cartCount: number;
}

interface Review {
  id: string;
  productId: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'p1', // Canola Oil
    author: 'Haji Muhammad Yousaf',
    city: 'Samundri',
    rating: 5,
    comment: 'Khushbu bohot achi hai aur khana bilkul halka banta hai. Cholestrol ke liye behtareen hai!',
    date: '2026-07-15'
  },
  {
    id: 'rev-2',
    productId: 'p1',
    author: 'Ayesha Bibi',
    city: 'Faisalabad',
    rating: 5,
    comment: 'Pehle market se brand ka canola oil lete thay, ab direct Malik Oil se mangwate hain. Price bhi sasti hai aur khalis bhi hai.',
    date: '2026-07-10'
  },
  {
    id: 'rev-3',
    productId: 'p2', // Mustard Oil (Sarson)
    author: 'Chaudhary Bashir',
    city: 'Okara',
    rating: 5,
    comment: 'Bilkul asli kachi ghani sarson ka tel hai. Achar ke liye behtareen aur sar me lagane ke liye lajawab.',
    date: '2026-07-19'
  },
  {
    id: 'rev-4',
    productId: 'p2',
    author: 'Sajid Mehmood',
    city: 'Sahiwal',
    rating: 4,
    comment: 'Tel bilkul khalis hai aur khushbu bhi tez hai. Delivery thodi 1 din late hui par tel ki quality kamaal hai.',
    date: '2026-07-12'
  },
  {
    id: 'rev-5',
    productId: 'p3', // Sesame Oil
    author: 'Dr. Amjad',
    city: 'Sahiwal',
    rating: 5,
    comment: 'Bohat hi pure khushbu hai. Joints ke dukhne par maalish ke liye use kiya, bohat hi jald faida hua.',
    date: '2026-07-18'
  },
  {
    id: 'rev-6',
    productId: 'p4', // Taramira
    author: 'Haji Aslam',
    city: 'Gojra',
    rating: 5,
    comment: 'Sar ki khushki aur balon ke liye behtareen taramira oil hai. Thoda kora hota hai par bilkul natural hai.',
    date: '2026-07-14'
  },
  {
    id: 'rev-7',
    productId: 'p5', // Khall
    author: 'Malik Tariq',
    city: 'Gojra',
    rating: 5,
    comment: 'Bhains ka doodh barh gaya hai aur khall bilkul saaf sutri hai baghair kisi milaawat ke. Highly recommended.',
    date: '2026-07-17'
  },
  {
    id: 'rev-8',
    productId: 'p6', // Wanda
    author: 'Sardar Ali',
    city: 'Depalpur',
    rating: 5,
    comment: 'Wanda se janwar tandurust ho gaye hain aur doodh ki fat bhi barh gayi hai. Delivery direct farm par mil gayi.',
    date: '2026-07-11'
  }
];

export default function Storefront({ products, onAddToCart, cartCount }: StorefrontProps) {
  const activeProducts = products.filter(p => p.isActive !== false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('malik_oil_reviews');
    if (stored) return JSON.parse(stored);
    return INITIAL_REVIEWS;
  });

  // Review Form States
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  // Standalone Review Showcase States
  const [reviewFilterProduct, setReviewFilterProduct] = useState<string>('All');
  const [isStandaloneReviewModalOpen, setIsStandaloneReviewModalOpen] = useState(false);
  const [standaloneReviewProdId, setStandaloneReviewProdId] = useState<string>('p1');

  const handleAddReview = (e: React.FormEvent, targetProdId?: string) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewCity || !newReviewComment) return;

    const prodIdToUse = targetProdId || selectedProduct?.id || standaloneReviewProdId;

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId: prodIdToUse,
      author: newReviewAuthor,
      city: newReviewCity,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem('malik_oil_reviews', JSON.stringify(updated));

    // Reset Form
    setNewReviewAuthor('');
    setNewReviewCity('');
    setNewReviewRating(5);
    setNewReviewComment('');
    setReviewSuccessMsg(true);
    setTimeout(() => {
      setReviewSuccessMsg(false);
      setIsStandaloneReviewModalOpen(false);
    }, 2000);
  };

  // Bulk / Wholesale Calculator States
  const [bulkProduct, setBulkProduct] = useState('p2'); // Default to Mustard Oil (Sarson)
  const [bulkQuantity, setBulkQuantity] = useState(200); // Default to 200 Litres / Kgs

  const selectedBulkProd = activeProducts.find(p => p.id === bulkProduct) || activeProducts[0];
  
  let bulkDiscountPercent = 0;
  if (selectedBulkProd) {
    if (selectedBulkProd.category === 'Pure Oil') {
      if (bulkQuantity >= 1000) bulkDiscountPercent = 22;
      else if (bulkQuantity >= 500) bulkDiscountPercent = 18;
      else if (bulkQuantity >= 100) bulkDiscountPercent = 12;
    } else {
      // feed or by-product (Khall/Wanda)
      if (bulkQuantity >= 5000) bulkDiscountPercent = 20;
      else if (bulkQuantity >= 1000) bulkDiscountPercent = 15;
      else if (bulkQuantity >= 500) bulkDiscountPercent = 10;
    }
  }

  const regularUnitPrice = selectedBulkProd ? selectedBulkProd.price : 0;
  const wholesaleUnitPrice = Math.round(regularUnitPrice * (1 - bulkDiscountPercent / 100));
  const bulkTotalRegular = regularUnitPrice * bulkQuantity;
  const bulkTotalWholesale = wholesaleUnitPrice * bulkQuantity;
  const bulkSavings = bulkTotalRegular - bulkTotalWholesale;

  const generateWhatsAppBulkLink = () => {
    if (!selectedBulkProd) return '#';
    const text = `Assalam-o-Alaikum Malik Oils! Mujhe wholesale/bulk khareedari ki inquiry karni hai:\n\n*Product:* ${selectedBulkProd.name}\n*Quantity:* ${bulkQuantity} ${selectedBulkProd.unit}\n*Regular Price:* Rs. ${regularUnitPrice} / ${selectedBulkProd.unit}\n*Wholesale Price Offered:* Rs. ${wholesaleUnitPrice} / ${selectedBulkProd.unit}\n*Total Bulk Quote:* Rs. ${bulkTotalWholesale.toLocaleString()}\n*Total Savings:* Rs. ${bulkSavings.toLocaleString()}\n\nMeherbani farma kar booking aur Samundri unit se cargo delivery ki mazeed details bheinjiye. Shukriya!`;
    return `https://wa.me/923001234567?text=${encodeURIComponent(text)}`;
  };

  // Cattle Feed Dairy Planner States
  const [dairyAnimalsCount, setDairyAnimalsCount] = useState(10);
  const [dairyAnimalType, setDairyAnimalType] = useState('buffalo'); // buffalo or cow
  const [dairyFeedType, setDairyFeedType] = useState('wanda'); // wanda or khall

  // Oil Purity Test Selector State
  const [activePurityTest, setActivePurityTest] = useState(0); // 0, 1, or 2

  // Interactive Health Purpose & Benefits Assistant State
  const [activeHealthGoal, setActiveHealthGoal] = useState<'hair' | 'cooking' | 'massage' | 'dairy'>('hair');

  // Shipping & Delivery Charge Estimator State
  const [deliveryCity, setDeliveryCity] = useState('Faisalabad');

  // OPTIONAL Feature #3: Wholesale & Dairy Farm Monthly Subscription Planner
  const [isSubscriptionPlannerOpen, setIsSubscriptionPlannerOpen] = useState(false);
  const [subBagsCount, setSubBagsCount] = useState(20);
  const [subFrequency, setSubFrequency] = useState<'monthly' | 'biweekly'>('monthly');

  // Filter Categories
  const categories = ['All', 'Pure Oil', 'By-Product', 'Animal Feed'];

  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.urduName && product.urduName.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickAdd = (product: Product) => {
    onAddToCart(product, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleModalAdd = (product: Product) => {
    onAddToCart(product, modalQuantity);
    setSelectedProduct(null);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  // Get matching icon for dynamic background styling
  const getProductImageClass = (imageKey: string) => {
    switch (imageKey) {
      case 'canola': return 'bg-amber-100 text-amber-800';
      case 'sarson': return 'bg-yellow-100 text-yellow-800';
      case 'til': return 'bg-orange-100 text-orange-800';
      case 'taramira': return 'bg-amber-100 text-amber-900';
      case 'khall': return 'bg-stone-200 text-stone-800';
      case 'wanda': return 'bg-green-100 text-green-800';
      default: return 'bg-gold-50 text-gold-500';
    }
  };

  return (
    <div className="w-full">
      {/* 4 Feature Highlights - Identical to Image */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4 p-3 hover:bg-gold-50/40 rounded-xl transition-all">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-950 shadow-sm">
                <Truck className="w-6 h-6 text-emerald-900" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xs tracking-widest text-emerald-950 uppercase">FAST DELIVERY</h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">Quick & Reliable Delivery at your doorstep</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 hover:bg-gold-50/40 rounded-xl transition-all">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-950 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-900" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xs tracking-widest text-emerald-950 uppercase">100% SECURE PAYMENT</h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">Your payments are safe with us</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 hover:bg-gold-50/40 rounded-xl transition-all">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-950 shadow-sm">
                <Sparkles className="w-6 h-6 text-emerald-900" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xs tracking-widest text-emerald-950 uppercase">PURE & NATURAL</h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">Extracted with care, packed with purity</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 hover:bg-gold-50/40 rounded-xl transition-all">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-950 shadow-sm">
                <Headphones className="w-6 h-6 text-emerald-900" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-xs tracking-widest text-emerald-950 uppercase">CUSTOMER SUPPORT</h3>
                <p className="text-xs text-gray-500 mt-1 font-sans">We are here to help you anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <section id="products-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
          <div>
            <span className="text-xs font-extrabold text-gold-600 tracking-widest uppercase font-sans">Our Products</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-emerald-950 mt-1">
              Pure & Natural Oils & Feeds
            </h2>
          </div>

          {/* Filtering and Search Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Category selection pill buttons */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-lg text-xs">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3.5 py-1.5 rounded-md font-bold tracking-wide transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-950 text-gold-500 shadow-sm'
                      : 'text-gray-600 hover:text-emerald-950 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? 'ALL' : cat.toUpperCase()}
                </motion.button>
              ))}
            </div>

            {/* In-catalog Search input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 text-xs bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dynamic products list */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto">
            <AlertTriangle className="w-12 h-12 text-gold-500 mx-auto mb-4 animate-bounce" />
            <h3 className="font-serif font-extrabold text-lg text-emerald-950">No Products Found</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
              We couldn't find any products matching "{searchQuery}". Please check your spelling or choose another category.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 bg-emerald-950 text-gold-500 text-xs font-bold tracking-wider rounded hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const hasLowStock = product.stock > 0 && product.stock <= 15;
              const isOutOfStock = product.stock === 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)" }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:border-gold-300 flex flex-col group relative"
                >
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 z-10 bg-emerald-950/90 text-gold-500 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
                    {product.category}
                  </span>

                  {/* Stock Indicator alerts */}
                  {isOutOfStock ? (
                    <span className="absolute top-4 right-4 z-10 bg-rose-600 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      OUT OF STOCK
                    </span>
                  ) : hasLowStock ? (
                    <span className="absolute top-4 right-4 z-10 bg-amber-500 text-emerald-950 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      ONLY {product.stock} LEFT
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 z-10 bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      {product.stock} IN STOCK
                    </span>
                  )}

                  {/* Product Oil Bottle / Feed representation (Matches image aesthetics) */}
                  <div 
                    onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                    className="h-56 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative overflow-hidden group-hover:bg-amber-50/10 transition-colors cursor-pointer"
                  >
                    <img
                      src={getProductImage(product.image)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Transparent overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                    {/* Quick view and Quick buy option overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleQuickAdd(product); }}
                        disabled={isOutOfStock}
                        className="px-3 py-1.5 bg-[#00c079] hover:bg-[#00a367] text-white rounded-full transition-all shadow-lg cursor-pointer flex items-center gap-1 text-[11px] font-black disabled:opacity-50"
                        title="Quick Buy 1 unit directly"
                      >
                        <Zap className="w-3.5 h-3.5 text-white fill-white" />
                        Quick Buy
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setModalQuantity(1); }}
                        className="p-2 bg-emerald-900 hover:bg-emerald-950 text-gold-400 hover:text-white rounded-full transition-all shadow-lg cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Information block */}
                  <div className="p-5 flex-1 flex flex-col justify-between font-sans">
                    <div 
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="cursor-pointer group/info"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-extrabold text-base text-emerald-950 group-hover:text-gold-600 group-hover/info:text-gold-600 transition-colors">
                          {product.name}
                        </h3>
                        {product.urduName && (
                          <span className="text-xs text-gray-400 font-sans">{product.urduName}</span>
                        )}
                      </div>
                      
                      {/* Dynamic ratings display */}
                      {(() => {
                        const prodReviews = reviews.filter(r => r.productId === product.id);
                        const avgRating = prodReviews.length > 0
                          ? (prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1)
                          : '5.0';
                        const reviewCount = prodReviews.length;
                        return (
                          <div className="flex items-center gap-1 mt-1.5 mb-2">
                            <div className="flex text-amber-500">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3 h-3 ${idx < Math.round(parseFloat(avgRating)) ? 'fill-current' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-emerald-950 font-sans ml-1">{avgRating}</span>
                            <span className="text-[10px] text-gray-400 font-sans">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                          </div>
                        );
                      })()}

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed group-hover/info:text-gray-700 transition-colors">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">From Price</span>
                          <span className="text-lg font-black text-emerald-950">
                            Rs. {product.price.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ {product.unit}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-950 font-bold bg-gold-50 border border-gold-500/20 px-2 py-0.5 rounded uppercase">
                          Cold Pressed
                        </span>
                      </div>

                      {/* Action Triggers: Quick Buy and Add to Cart */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={isOutOfStock}
                          className={`py-2.5 px-3 rounded-xl font-black text-[11px] tracking-wide transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 border cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : justAddedId === product.id
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-[#00c079] hover:bg-[#00a367] text-white border-[#00a367] hover:shadow-lg'
                          }`}
                          title="Add 1 unit directly to cart"
                        >
                          {justAddedId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 animate-bounce" />
                              ADDED!
                            </>
                          ) : isOutOfStock ? (
                            'OUT OF STOCK'
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-white fill-white shrink-0" />
                              QUICK BUY
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                          disabled={isOutOfStock}
                          className={`py-2.5 px-3 rounded-xl font-bold text-[11px] tracking-wide transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 border cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-emerald-900 hover:bg-emerald-950 text-amber-300 border-emerald-950 hover:shadow'
                          }`}
                          title="View options and add to cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                          DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Wholesale / Bulk Rate Calculator Section */}
      <section className="bg-gradient-to-br from-emerald-950/5 to-amber-500/5 py-12 px-4 sm:px-6 lg:px-8 border-t border-b border-gray-100 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-emerald-950 p-6 text-white text-center relative">
            <span className="text-[10px] bg-gold-500/20 text-gold-500 font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase border border-gold-500/20">
              Samundri Mill Cargo Unit
            </span>
            <h3 className="font-serif font-black text-xl md:text-2xl mt-2 text-white uppercase tracking-wider">
              Wholesale Thok Rate Calculator
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
              Get custom discounted rates for bulk orders of Mustard Oil, Canola Oil, or Dairy Livestock Cattle Feed.
            </p>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Input Form Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                1. Enter Bulk Requirements
              </h4>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Select Product (Product Chunein)</label>
                <select
                  value={bulkProduct}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setBulkProduct(pid);
                    // Automatically adjust default quantity based on category
                    const prod = products.find(p => p.id === pid);
                    if (prod) {
                      setBulkQuantity(prod.category === 'Pure Oil' ? 100 : 500);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.urduName || p.category}) - Rs. {p.price}/{p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                  Bulk Quantity ({selectedBulkProd?.unit || 'Units'})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={selectedBulkProd?.category === 'Pure Oil' ? 50 : 100}
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                  <span className="bg-emerald-50 text-emerald-900 border border-emerald-100 font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center min-w-[70px]">
                    {selectedBulkProd?.unit || 'Units'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {selectedBulkProd?.category === 'Pure Oil' 
                    ? '* Min 100 Litres bulk discount qualifies (12% off). 500L (18% off), 1000L+ (22% off).' 
                    : '* Min 500 Kg bulk discount qualifies (10% off). 1000 Kg (15% off), 5000 Kg+ (20% off).'}
                </p>
              </div>
            </div>

            {/* Price Output Column */}
            <div className="bg-gradient-to-br from-emerald-950/5 to-gold-500/5 p-6 rounded-2xl border border-gold-500/10 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider border-b border-emerald-950/10 pb-2">
                  2. Estimated Wholesale Quote
                </h4>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Regular Retail Rate:</span>
                    <span className="font-mono text-gray-700">Rs. {regularUnitPrice} / {selectedBulkProd?.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Wholesale Thok Rate:</span>
                    <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                      Rs. {wholesaleUnitPrice} / {selectedBulkProd?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Wholesale Discount Applied:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      {bulkDiscountPercent}% OFF
                    </span>
                  </div>

                  <div className="border-t border-dashed border-emerald-950/10 pt-3 mt-3 space-y-1">
                    <div className="flex justify-between text-gray-400 text-[10px]">
                      <span>Regular Price:</span>
                      <span className="line-through">Rs. {bulkTotalRegular.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-950 font-black text-sm">
                      <span>Wholesale Quote:</span>
                      <span>Rs. {bulkTotalWholesale.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 text-[11px] font-bold bg-emerald-100/50 p-2 rounded-lg border border-emerald-500/10">
                      <span>Total Savings (Bachat):</span>
                      <span>Rs. {bulkSavings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-950/10">
                <a
                  href={generateWhatsAppBulkLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-serif font-extrabold text-xs tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.244 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.63-1.03-5.114-2.905-6.99C16.486 1.87 14.016.84 11.378.84c-5.44 0-9.866 4.42-9.871 9.866-.001 1.75.474 3.456 1.375 4.977L1.815 21.91l6.232-1.636z" />
                  </svg>
                  SEND BULK INQUIRY (WHATSAPP)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Customer Trust Sections */}
      <section className="bg-[#FAF9F5] py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Interactive Cattle Feed Dairy Planner Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Calculator className="w-5 h-5 text-amber-950" />
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Dairy Farming Planner
                </span>
              </div>
              <h3 className="font-serif font-black text-xl text-emerald-950 uppercase tracking-wide">
                Cattle Feed Dairy Calculator
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Estimate how much milk yield and extra profit your dairy livestock can generate with Malik Khall & Wanda.
              </p>

              {/* Sliders and controls */}
              <div className="space-y-4.5 mt-6">
                {/* Animal count slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                    <span className="uppercase tracking-wider">Number of Animals (جانوروں کی تعداد)</span>
                    <span className="text-emerald-950 font-mono bg-emerald-50 px-2 py-0.5 rounded">{dairyAnimalsCount} Animals</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dairyAnimalsCount}
                    onChange={(e) => setDairyAnimalsCount(parseInt(e.target.value))}
                    className="w-full accent-gold-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>1 Animal</span>
                    <span>50 Animals</span>
                    <span>100 Animals</span>
                  </div>
                </div>

                {/* Grid selectors */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Animal Type Selector */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Animal Type</label>
                    <div className="grid grid-cols-2 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDairyAnimalType('buffalo')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${dairyAnimalType === 'buffalo' ? 'bg-emerald-950 text-white shadow-xs' : 'text-gray-500 hover:text-emerald-950'}`}
                      >
                        Buffalo (بھینس)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDairyAnimalType('cow')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${dairyAnimalType === 'cow' ? 'bg-emerald-950 text-white shadow-xs' : 'text-gray-500 hover:text-emerald-950'}`}
                      >
                        Cow (گائے)
                      </button>
                    </div>
                  </div>

                  {/* Feed Type Selector */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">Selected Feed</label>
                    <div className="grid grid-cols-2 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDairyFeedType('wanda')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${dairyFeedType === 'wanda' ? 'bg-gold-600 text-white shadow-xs' : 'text-gray-500 hover:text-gold-600'}`}
                      >
                        Wanda (30/Kg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDairyFeedType('khall')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${dairyFeedType === 'khall' ? 'bg-gold-600 text-white shadow-xs' : 'text-gray-500 hover:text-gold-600'}`}
                      >
                        Khall (35/Kg)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Display Receipt */}
            {(() => {
              const dailyFeedPerAnimal = dairyAnimalType === 'buffalo' ? 2.5 : 2.0;
              const totalDailyFeed = dairyAnimalsCount * dailyFeedPerAnimal;
              const totalMonthlyFeed = totalDailyFeed * 30;
              const feedPrice = dairyFeedType === 'wanda' ? 30 : 35;
              const totalMonthlyCost = totalMonthlyFeed * feedPrice;

              // yield increase
              let yieldIncrease = 1.2;
              if (dairyAnimalType === 'buffalo') {
                yieldIncrease = dairyFeedType === 'wanda' ? 1.5 : 1.2;
              } else {
                yieldIncrease = dairyFeedType === 'wanda' ? 1.3 : 1.1;
              }

              const totalDailyMilk = dairyAnimalsCount * yieldIncrease;
              const totalMonthlyMilk = totalDailyMilk * 30;
              const milkPrice = 210; // Rs per Litre local average
              const totalMonthlyRevenue = totalMonthlyMilk * milkPrice;
              const netProfit = totalMonthlyRevenue - totalMonthlyCost;

              return (
                <div className="mt-6 bg-gradient-to-br from-emerald-950/5 to-amber-500/5 border border-emerald-950/10 p-5 rounded-2xl space-y-3 font-sans">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-dashed border-emerald-950/10">
                    <span className="text-gray-500">Daily Required Feed:</span>
                    <span className="font-bold text-emerald-950 font-mono">{totalDailyFeed} Kgs / day</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Estimated Milk Increase:</span>
                    <span className="font-bold text-emerald-700 font-mono bg-emerald-100/40 px-2 py-0.5 rounded">
                      +{totalDailyMilk.toFixed(1)} Litres / day
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Monthly Feed Investment:</span>
                    <span className="font-mono text-gray-700">Rs. {totalMonthlyCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Extra Monthly Milk Revenue:</span>
                    <span className="font-mono text-emerald-800">Rs. {totalMonthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-dashed border-emerald-950/10 pt-3 flex justify-between items-center">
                    <span className="text-xs font-black text-emerald-950 uppercase">Estimated Monthly Profit Gain:</span>
                    <span className="text-sm font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-xl font-mono shadow-xs border border-emerald-500/20 animate-pulse">
                      Rs. {netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Interactive Home Purity Testing Guide Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-950 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-900" />
                </div>
                <span className="text-[10px] bg-gold-50 text-gold-600 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Quality Assurance
                </span>
              </div>
              <h3 className="font-serif font-black text-xl text-emerald-950 uppercase tracking-wide">
                Interactive Purity Test Guide
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                We believe in complete transparency. Learn how to verify 100% pure cold-pressed oil right at home.
              </p>

              {/* Tabs selector */}
              <div className="flex gap-1.5 p-1 bg-gray-50 border border-gray-200/50 rounded-xl mt-6 text-[10px] font-extrabold">
                {['Freezing Test', 'Paper Test', 'Heat Test'].map((testLabel, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePurityTest(idx)}
                    className={`flex-1 py-2 rounded-lg tracking-wider transition-all cursor-pointer ${
                      activePurityTest === idx
                        ? 'bg-emerald-950 text-gold-500 shadow-xs'
                        : 'text-gray-500 hover:text-emerald-950 hover:bg-gray-100'
                    }`}
                  >
                    {testLabel.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Active Tab Content */}
              <div className="mt-5 space-y-4 font-sans text-xs min-h-[140px]">
                {activePurityTest === 0 && (
                  <div className="space-y-3.5">
                    <p className="leading-relaxed text-gray-600">
                      <strong>The Refrigerator Freeze Test (فریزنگ ٹیسٹ):</strong> Mustard & canola oils have specific freezing points, making it easy to identify adulterated palm mixes.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-[11px] mt-1">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="font-bold text-emerald-950 block mb-1">✓ Malik Oils (100% Pure)</span>
                        <span className="text-gray-500">Stays liquid & golden with no heavy coagulation or solidified layers in standard chilling.</span>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <span className="font-bold text-rose-950 block mb-1">✗ Refined/Mixed Oils</span>
                        <span className="text-gray-500">Palm oil or hydrogenated oil mixes will solidify completely or form thick white fat sediments at the bottom.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePurityTest === 1 && (
                  <div className="space-y-3.5">
                    <p className="leading-relaxed text-gray-600">
                      <strong>The Blotting Paper Spot Test (کاغذ ٹیسٹ):</strong> Pure mechanical oils dry naturally without leaving greasy chemical coatings or heavy black stains.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-[11px] mt-1">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="font-bold text-emerald-950 block mb-1">✓ Malik Oils (100% Pure)</span>
                        <span className="text-gray-500">Leaves a clean, clear translucent golden grease-spot that remains flat and organic over 24 hours.</span>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <span className="font-bold text-rose-950 block mb-1">✗ Adulterated Oils</span>
                        <span className="text-gray-500">Leaving chemical or mineral oil additions results in stiff paper that smells intensely toxic and leaves yellow-brown residues.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePurityTest === 2 && (
                  <div className="space-y-3.5">
                    <p className="leading-relaxed text-gray-600">
                      <strong>The Pan Heat & Frothing Test (جھاگ کا ٹیسٹ):</strong> Wood and cold-pressed extraction preserves rich natural seed moisture and organic proteins.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-[11px] mt-1">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="font-bold text-emerald-950 block mb-1">✓ Malik Oils (100% Pure)</span>
                        <span className="text-gray-500">Froths and bubbles slightly when heated initially. Releases a rich, robust traditional seed aroma.</span>
                      </div>
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <span className="font-bold text-rose-950 block mb-1">✗ Chemical Solvent Oils</span>
                        <span className="text-gray-500">Produces flat heating with zero frothing but severe black smoke and artificial chemical odors that trigger coughing.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4 flex items-center gap-2.5 text-[11px] font-bold text-emerald-950">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Need a custom quality lab test report? Click to message our team on WhatsApp.</span>
            </div>
          </div>

        </div>
      </section>

      {/* NEW SECTION 1 & 2: Interactive Oil Purpose Guide & Quick Delivery Estimator */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Feature 1: Health Goal & Purpose Matcher */}
          <div className="lg:col-span-7 bg-[#FAF9F5] rounded-3xl p-6 md:p-8 border border-emerald-950/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-emerald-950 text-gold-500 rounded-lg">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Oil Selection Guide
                </span>
              </div>
              <h3 className="font-serif font-black text-xl text-emerald-950 uppercase tracking-wide">
                کونسا تیل کس مقصد کے لیے فائدہ مند ہے؟
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Select your primary goal to see which Malik Cold-Pressed Oil or Feed is best suited for your family & livestock.
              </p>

              {/* Goal tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                {[
                  { id: 'hair', label: 'Hair & Skin Care', urdu: 'بال اور جلد', icon: '💇' },
                  { id: 'cooking', label: 'Heart & Cooking', urdu: 'دل اور پکوان', icon: '🫀' },
                  { id: 'massage', label: 'Joints & Massage', urdu: 'مالش اور جوڑ', icon: '🦾' },
                  { id: 'dairy', label: 'Dairy Cattle Feed', urdu: 'جانوروں کی خوراک', icon: '🐄' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveHealthGoal(tab.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      activeHealthGoal === tab.id
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-md'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-950/40'
                    }`}
                  >
                    <span className="text-xl mb-1">{tab.icon}</span>
                    <div>
                      <span className="text-xs font-bold block">{tab.label}</span>
                      <span className={`text-[10px] ${activeHealthGoal === tab.id ? 'text-gold-400' : 'text-gray-400'}`}>
                        {tab.urdu}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Goal Info Card */}
              <div className="mt-5 p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
                {activeHealthGoal === 'hair' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">Recommended</span>
                        <h4 className="font-serif font-black text-base text-emerald-950 mt-1">Cold-Pressed Til (Sesame) & Mustard Oil</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-950">Rs. 850 - 1,200</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Rich in Vitamin E, Omega 6, and natural antioxidants. Cold extraction preserves natural root nourishment properties without damaging heat chemicals.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-900">
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Root Strengthening</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Anti-Dandruff</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Natural Moisturizer</span>
                    </div>
                  </div>
                )}

                {activeHealthGoal === 'cooking' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">Recommended</span>
                        <h4 className="font-serif font-black text-base text-emerald-950 mt-1">Organic Canola & Cold-Pressed Sarson</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-950">Rs. 850 / Litre</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      100% Zero Cholesterol with high Omega-3 fatty acids. Unrefined wood-pressed canola & sarson retain natural light golden aroma and clean digestibility.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-900">
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Zero Cholesterol</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Heart Healthy</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ High Smoke Point</span>
                    </div>
                  </div>
                )}

                {activeHealthGoal === 'massage' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">Recommended</span>
                        <h4 className="font-serif font-black text-base text-emerald-950 mt-1">Pure Taramira Oil (تارامیرا کا تیل)</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-950">Rs. 950 / Litre</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Known for its deep heating warmth and anti-inflammatory properties. Ideal for winter joint massages, muscle fatigue, and scalp hair follicle activation.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-900">
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Deep Muscle Warmth</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Joint Pain Relief</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Follicle Booster</span>
                    </div>
                  </div>
                )}

                {activeHealthGoal === 'dairy' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">Recommended</span>
                        <h4 className="font-serif font-black text-base text-emerald-950 mt-1">Mustard Cake (Sarson Khall) & Wanda</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-950">Rs. 1,400 - 1,750 / Bag</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Contains 8-10% unextracted pure mustard oil residue for maximum digestible fat. Boosts milk fat percentage and strengthens livestock appetite.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-emerald-900">
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Milk Fat Booster</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ High Natural Protein</span>
                      <span className="bg-emerald-50 px-2 py-1 rounded-lg">✓ Digestible Energy</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center text-xs font-bold text-emerald-950">
              <span>Have specific health queries? Consult with our experts.</span>
              <a
                href="https://wa.me/923001234567?text=Assalam-o-Alaikum! Mujhe oil selection aur health benefits ke hawale se poochhna hai."
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-950 text-gold-500 hover:bg-emerald-900 rounded-xl transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Experts
              </a>
            </div>
          </div>

          {/* Feature 2: Quick City Delivery Estimator */}
          <div className="lg:col-span-5 bg-[#FAF9F5] rounded-3xl p-6 md:p-8 border border-emerald-950/10 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-gold-500 text-emerald-950 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-gold-100 text-gold-900 font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Express Dispatch
                </span>
              </div>
              <h3 className="font-serif font-black text-xl text-emerald-950 uppercase tracking-wide">
                Delivery & Shipping Estimator
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Check delivery timing and cargo charges for your city or district across Pakistan.
              </p>

              {/* City selector */}
              <div className="mt-5">
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5">
                  Select Your City / District (شہر کا انتخاب کریں)
                </label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-950"
                >
                  <option value="Vehari">Vehari / Samundri (Nearest Mills Direct)</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Rawalpindi">Rawalpindi / Islamabad</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Other">Other Punjab City / District</option>
                </select>
              </div>

              {/* Delivery Details Card */}
              <div className="mt-5 bg-white p-5 rounded-2xl border border-gray-200 space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Estimated Transit Time:</span>
                  <span className="font-bold text-emerald-950 font-mono">
                    {deliveryCity === 'Vehari' || deliveryCity === 'Faisalabad' ? '24 Hours (Same/Next Day)' : '2 - 3 Working Days'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Shipping Partner:</span>
                  <span className="font-bold text-gray-700">TCS Courier / Samundri Direct Cargo</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Free Delivery Offer:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Free on Orders &gt; Rs. 3,500
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Standard Delivery Charge:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {deliveryCity === 'Vehari' ? 'Free Pickup / Rs. 100' : 'Rs. 200 - 250'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200">
              <a
                href={`https://wa.me/923001234567?text=${encodeURIComponent(`Assalam-o-Alaikum Malik Oils! Mujhe ${deliveryCity} ke liye delivery timing aur order confirmation chahiye.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 font-bold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                CHECK CITY DELIVERY ON WHATSAPP
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* CUSTOMER PRODUCT REVIEWS & STAR RATINGS SHOWCASE SECTION */}
      <section className="bg-white py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-200 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header & Overall Rating Summary */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  VERIFIED CUSTOMER FEEDBACK (کسٹمر ریویوز)
                </span>
              </div>
              <h2 className="font-serif font-black text-2xl md:text-3xl text-emerald-950 uppercase tracking-tight">
                Customer Reviews & Product Ratings
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Read authentic feedback from households, chefs, and dairy farmers across Pakistan using our cold-pressed oils & organic animal feeds.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-emerald-950 text-white p-4 rounded-2xl border border-gold-500/30 shadow-lg">
              <div className="text-center border-r border-emerald-900 pr-4">
                <span className="text-3xl font-black font-serif text-amber-400 block leading-none">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '5.0'}
                </span>
                <span className="text-[9px] text-emerald-300 uppercase font-bold mt-1 block">OUT OF 5.0</span>
              </div>
              <div>
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-300 font-medium mt-0.5 block">
                  Based on <strong>{reviews.length}</strong> verified reviews
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsStandaloneReviewModalOpen(true)}
                className="ml-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Product Filter Selector */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-gray-500 mr-2 shrink-0">Filter Product:</span>
            <button
              type="button"
              onClick={() => setReviewFilterProduct('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                reviewFilterProduct === 'All'
                  ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            {activeProducts.map((p) => {
              const count = reviews.filter(r => r.productId === p.id).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setReviewFilterProduct(p.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    reviewFilterProduct === p.id
                      ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Reviews Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews
              .filter(r => reviewFilterProduct === 'All' || r.productId === reviewFilterProduct)
              .map((rev) => {
                const targetProd = products.find(p => p.id === rev.productId);
                return (
                  <motion.div
                    key={rev.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FAF9F5] rounded-2xl p-5 border border-gray-200 flex flex-col justify-between hover:border-gold-400 transition-all shadow-xs"
                  >
                    <div>
                      {/* Top Row: User & Verification */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-950 text-amber-400 font-black text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                            {rev.author.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                              {rev.author}
                              <span className="text-[10px] text-gray-400 font-normal">({rev.city})</span>
                            </h4>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1 border border-emerald-200 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-emerald-600" /> Verified Buyer
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-gray-400">{rev.date}</span>
                      </div>

                      {/* Rating Stars & Target Product Badge */}
                      <div className="flex justify-between items-center my-2">
                        <div className="flex text-amber-500 gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        {targetProd && (
                          <span className="text-[10px] bg-white border border-gray-200 font-bold text-emerald-900 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                            {targetProd.name}
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-gray-700 leading-relaxed mt-2 font-sans italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/60 flex justify-between items-center text-[10px] text-gray-400">
                      <span>Malik Oil Expellers Verified Review</span>
                      <span className="text-amber-600 font-bold">100% Pure & Organic</span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </section>

      {/* STANDALONE WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {isStandaloneReviewModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 font-sans relative"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-base text-emerald-950 uppercase">
                      Submit Product Review
                    </h3>
                    <p className="text-[11px] text-gray-400">Share your rating and feedback for Malik Oil products</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStandaloneReviewModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-emerald-950 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => handleAddReview(e, standaloneReviewProdId)} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Select Product *</label>
                  <select
                    value={standaloneReviewProdId}
                    onChange={(e) => setStandaloneReviewProdId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.urduName || p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Your Name (نام) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chaudhary Usman"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">City / District (شہر) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samundri"
                      value={newReviewCity}
                      onChange={(e) => setNewReviewCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Your Star Rating *</label>
                  <div className="flex gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 justify-center">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setNewReviewRating(starVal)}
                        className="text-amber-500 hover:scale-125 transition-transform cursor-pointer p-1"
                      >
                        <Star className={`w-7 h-7 ${starVal <= newReviewRating ? 'fill-current' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Your Feedback Comment *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe product quality, purity, aroma, or delivery experience..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-amber-400 hover:text-white font-extrabold text-xs tracking-wider rounded-xl transition-all shadow-md cursor-pointer uppercase"
                >
                  SUBMIT REVIEW NOW
                </button>

                {reviewSuccessMsg && (
                  <p className="text-xs text-emerald-800 font-extrabold text-center bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    Shukriya! Your review has been successfully submitted and added to the storefront.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <section className="bg-[#FAF9F5] py-10 px-4 sm:px-6 lg:px-8 border-b border-gray-200 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar with Optional Badge & Toggle */}
          <div className="bg-emerald-950 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-gold-500 rounded-2xl border border-gold-500/30">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500 text-emerald-950 font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    OPTIONAL FEATURE / اختیاری سروس
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl md:text-2xl text-white mt-1">
                  Monthly Dairy Farm & Wholesale Subscription Plan
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                  Automate monthly feed & oil supplies for commercial dairy farms with extra 5% - 15% wholesale volume discounts.
                </p>
              </div>
            </div>

            {/* Collapsible Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSubscriptionPlannerOpen(!isSubscriptionPlannerOpen)}
              className="px-6 py-3 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-white font-bold text-xs tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-gold-400/40"
            >
              <span>{isSubscriptionPlannerOpen ? 'HIDE OPTIONAL PLANNER' : 'OPEN OPTIONAL PLANNER (اختیاری)'}</span>
              {isSubscriptionPlannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Section Body */}
          <AnimatePresence>
            {isSubscriptionPlannerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-6 bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Controls */}
                  <div className="lg:col-span-7 space-y-5">
                    <h4 className="font-serif font-extrabold text-lg text-emerald-950 border-b pb-2">
                      Configure Your Monthly Dairy / Wholesale Delivery
                    </h4>

                    {/* Delivery frequency */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Delivery Schedule Frequency (ڈیلیوری شیڈول)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSubFrequency('monthly')}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                            subFrequency === 'monthly'
                              ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-xs'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <span className="block font-black text-sm">Every 1st of Month</span>
                          <span className="text-[10px] text-gray-400">ماہانہ ڈیلیوری (1 تاریخ)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubFrequency('biweekly')}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                            subFrequency === 'biweekly'
                              ? 'bg-emerald-950 text-gold-500 border-emerald-950 shadow-xs'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          <span className="block font-black text-sm">Bi-Weekly (1st & 15th)</span>
                          <span className="text-[10px] text-gray-400">ہر 15 دن بعد ڈیلیوری</span>
                        </button>
                      </div>
                    </div>

                    {/* Quantity Bags slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-2">
                        <span>Monthly Cattle Feed Bags (Wanda / Khall Bags):</span>
                        <span className="font-mono bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded font-black text-sm">
                          {subBagsCount} Bags / month
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={subBagsCount}
                        onChange={(e) => setSubBagsCount(parseInt(e.target.value))}
                        className="w-full accent-gold-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>5 Bags (Small Farm)</span>
                        <span>50 Bags (Medium Farm)</span>
                        <span>100 Bags (Large Dairy)</span>
                      </div>
                    </div>

                    {/* Tier Badges */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2">
                      <div className={`p-2.5 rounded-xl border ${subBagsCount >= 10 && subBagsCount < 25 ? 'bg-amber-50 border-gold-500 font-bold text-amber-900' : 'bg-gray-50 text-gray-400'}`}>
                        <span className="block text-xs font-bold">5% OFF Tier</span>
                        <span>10 - 24 Bags</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${subBagsCount >= 25 && subBagsCount < 50 ? 'bg-amber-50 border-gold-500 font-bold text-amber-900' : 'bg-gray-50 text-gray-400'}`}>
                        <span className="block text-xs font-bold">10% OFF Tier</span>
                        <span>25 - 49 Bags</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${subBagsCount >= 50 ? 'bg-amber-50 border-gold-500 font-bold text-amber-900' : 'bg-gray-50 text-gray-400'}`}>
                        <span className="block text-xs font-bold">15% OFF Tier</span>
                        <span>50+ Bags</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Subscription Quote Card */}
                  <div className="lg:col-span-5 bg-[#FAF9F5] p-6 rounded-2xl border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Subscription Estimate</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">ACTIVE QUOTE</span>
                      </div>

                      {(() => {
                        const bagUnitPrice = 1750;
                        const regularCost = subBagsCount * bagUnitPrice;
                        let discountPercent = 0;
                        if (subBagsCount >= 50) discountPercent = 0.15;
                        else if (subBagsCount >= 25) discountPercent = 0.10;
                        else if (subBagsCount >= 10) discountPercent = 0.05;

                        const discountAmount = regularCost * discountPercent;
                        const finalCost = regularCost - discountAmount;

                        return (
                          <div className="space-y-3 mt-4 text-xs font-sans">
                            <div className="flex justify-between text-gray-600">
                              <span>Regular Monthly Price:</span>
                              <span className="font-mono">Rs. {regularCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-bold">
                              <span>Volume Subscription Savings ({(discountPercent * 100)}%):</span>
                              <span className="font-mono">- Rs. {discountAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Scheduled Freight & Cargo:</span>
                              <span className="font-bold text-emerald-800">FREE Priority Delivery</span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                              <span className="font-black text-emerald-950 uppercase text-xs">Estimated Monthly Cost:</span>
                              <span className="font-black text-base text-emerald-950 bg-emerald-100 px-3 py-1 rounded-xl font-mono">
                                Rs. {finalCost.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-6">
                      <a
                        href={`https://wa.me/923001234567?text=${encodeURIComponent(`Assalam-o-Alaikum Malik Oils! Main ${subBagsCount} Bags per month ka dairy farm subscription plan book karwana chahta hoon (${subFrequency === 'monthly' ? 'Every 1st' : '1st & 15th'}). Meherbani farma kar commercial details bheinjiye.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <MessageSquare className="w-4 h-4" />
                        BOOK MONTHLY SUBSCRIPTION ON WHATSAPP
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* How to Order flow chart - Identical structure from user image */}
      <section className="bg-emerald-950 text-white py-12 border-t border-b border-emerald-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold text-gold-500 tracking-[0.2em] uppercase">Step by Step</span>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-white mt-1 mb-8 uppercase tracking-wide">
            How to Order
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500 bg-emerald-900/30 mb-3 text-lg font-bold">
                1
              </div>
              <h4 className="text-xs font-bold text-gold-500 tracking-wider uppercase">Choose Products</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">Select your favorite products</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-gold-500/30">
              <span className="text-2xl">→</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500 bg-emerald-900/30 mb-3 text-lg font-bold">
                2
              </div>
              <h4 className="text-xs font-bold text-gold-500 tracking-wider uppercase">Add To Cart</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">Add to cart and proceed to checkout</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-gold-500/30">
              <span className="text-2xl">→</span>
            </div>

            <div className="flex flex-col items-center p-2 col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500 bg-emerald-900/30 mb-3 text-lg font-bold">
                3
              </div>
              <h4 className="text-xs font-bold text-gold-500 tracking-wider uppercase">Fill Details</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">Enter your delivery and city details</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto text-center mt-6 border-t border-emerald-900 pt-6">
            <div className="hidden md:block col-span-1"></div>
            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500 bg-emerald-900/30 mb-3 text-lg font-bold">
                4
              </div>
              <h4 className="text-xs font-bold text-gold-500 tracking-wider uppercase">Place Order</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">Confirm your order and billing mode</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-gold-500/30">
              <span className="text-2xl">→</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="w-12 h-12 rounded-full border border-gold-500 flex items-center justify-center text-gold-500 bg-emerald-900/30 mb-3 text-lg font-bold">
                5
              </div>
              <h4 className="text-xs font-bold text-gold-500 tracking-wider uppercase">Get Your Order</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[120px]">We deliver at your doorstep safely</p>
            </div>
            <div className="hidden md:block col-span-1"></div>
          </div>
        </div>
      </section>

      {/* WhatsApp Help Floating Badge - Match Image */}
      <div className="bg-emerald-900 text-white py-8 border-b border-emerald-950 font-sans">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4 flex-col sm:flex-row">
            <div className="p-3 bg-emerald-800 rounded-full text-green-400">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.244 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.414 9.863-9.84.002-2.63-1.023-5.101-2.885-6.967C16.586 1.982 14.111.96 11.488.96c-5.441 0-9.866 4.415-9.869 9.843-.001 1.76.47 3.472 1.365 4.981L1.944 21.8l6.194-1.626z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-base text-white">Need Help? Chat with us</h3>
              <p className="text-xs text-gray-300 mt-0.5">Contact us directly on WhatsApp for custom inquiries or tank deliveries</p>
            </div>
          </div>
          <a
            href="https://wa.me/923007618236?text=Hi%20Malik%20Oil%20Expellers,%20I%20want%20to%20place%20an%20order."
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-emerald-950 font-extrabold text-xs tracking-wider rounded-lg shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            CHAT NOW
          </a>
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase">
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-emerald-950 mt-2">
                      {selectedProduct.name}
                    </h2>
                    {selectedProduct.urduName && (
                      <span className="text-xs font-bold text-gold-600 mt-1 block">نام: {selectedProduct.urduName}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-emerald-950 p-1.5 hover:bg-gray-100 rounded-full transition-colors font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Visual Left */}
                  <div className="rounded-3xl overflow-hidden border border-gray-100 aspect-square relative group">
                    <img
                      src={getProductImage(selectedProduct.image)}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                  </div>

                  {/* Info Right */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">Description</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {selectedProduct.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">Health & Cooking Usage</h4>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          <li className="flex items-center gap-1.5">
                            <span className="text-gold-500">✔</span> 100% natural expeller-pressed
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-gold-500">✔</span> Zero preservatives, additives or chemical refining
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-gold-500">✔</span> Preserves vitamins, antioxidants, and original healthy nutrients
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">Available Stock</h4>
                        <span className={`text-xs font-bold ${selectedProduct.stock > 15 ? 'text-green-600' : 'text-amber-500'}`}>
                          {selectedProduct.stock} items currently in stock at Samundri unit
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-black text-emerald-950">
                          Rs. {selectedProduct.price.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ {selectedProduct.unit}</span>
                        </span>

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                            className="px-3 py-1.5 font-extrabold text-sm hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3.5 text-xs font-bold text-emerald-950">{modalQuantity}</span>
                          <button
                            onClick={() => setModalQuantity(Math.min(selectedProduct.stock, modalQuantity + 1))}
                            className="px-3 py-1.5 font-extrabold text-sm hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleModalAdd(selectedProduct)}
                        disabled={selectedProduct.stock === 0}
                        className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white font-serif font-extrabold text-xs tracking-widest rounded-lg border border-gold-500/20 shadow transition-all cursor-pointer"
                      >
                        {selectedProduct.stock === 0 ? 'OUT OF STOCK' : `ADD TO CART (Rs. ${(selectedProduct.price * modalQuantity).toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Reviews Section */}
                <div className="border-t border-gray-100 mt-8 pt-8 font-sans">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-gold-600" />
                    <h3 className="font-serif font-extrabold text-lg text-emerald-950 uppercase tracking-wider">
                      Customer Reviews ({reviews.filter(r => r.productId === selectedProduct.id).length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left: Reviews List */}
                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                      {reviews.filter(r => r.productId === selectedProduct.id).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Is product ke liye abhi tak koi reviews nahi hain. Pehla review aap likhein!</p>
                      ) : (
                        reviews.filter(r => r.productId === selectedProduct.id).map((r) => (
                          <div key={r.id} className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl space-y-1.5 shadow-xs">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-emerald-950">{r.author} <span className="text-[10px] text-gray-400 font-normal">({r.city})</span></span>
                              <span className="text-[9px] text-gray-400">{r.date}</span>
                            </div>
                            
                            {/* Stars */}
                            <div className="flex gap-0.5 text-amber-500">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3 h-3 ${idx < r.rating ? 'fill-current' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed font-sans">{r.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Right: Write Review Form */}
                    <form onSubmit={handleAddReview} className="bg-emerald-950/5 border border-emerald-950/10 p-4 rounded-2xl space-y-3.5">
                      <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider border-b border-emerald-950/10 pb-1.5">
                        Apna Review Likhein (Write Review)
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Aap ka Naam *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Asif Raza"
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Aap ka Sheher *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Okara"
                            value={newReviewCity}
                            onChange={(e) => setNewReviewCity(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                          />
                        </div>
                      </div>

                      {/* Rating stars selector */}
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Rating *</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setNewReviewRating(starVal)}
                              className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${starVal <= newReviewRating ? 'fill-current' : 'text-gray-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Aap ka Tajurba / Review *</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="e.g. Tel bilkul khalis aur behtareen quality ka hai!"
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-gold-500 hover:text-white text-[10px] font-extrabold tracking-widest rounded-lg transition-colors cursor-pointer"
                      >
                        SUBMIT REVIEW
                      </button>

                      {reviewSuccessMsg && (
                        <p className="text-[10px] text-emerald-800 font-bold text-center animate-bounce">
                          Shukriya! Aap ka review kamyabi se shamil ho gaya hai.
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
