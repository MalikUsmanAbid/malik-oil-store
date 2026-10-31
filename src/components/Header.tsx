import React from 'react';
import { ShoppingCart, User, Phone, MapPin, Facebook, Instagram, Shield, Search, CheckCircle, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FullBrandLogo } from './BrandLogo';
import { StoreSettings } from '../types';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  isAdmin: boolean;
  onAdminToggle: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTrackOrderClick: () => void;
  storeSettings?: StoreSettings;
}

export default function Header({
  cartCount,
  onCartClick,
  isAdmin,
  onAdminToggle,
  activeTab,
  setActiveTab,
  onTrackOrderClick,
  storeSettings,
}: HeaderProps) {
  const prevCartCount = React.useRef(cartCount);
  const [isBouncing, setIsBouncing] = React.useState(false);

  React.useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 900);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const phone = storeSettings?.phone || '0300-7618236';
  const whatsapp = storeSettings?.whatsapp || '923007618236';
  const address = storeSettings?.address || 'Tandila Road, Samundri';
  const estYear = storeSettings?.estYear || '1970';
  const announcementText = storeSettings?.announcementText || '🚚 Free Express Shipping across Pakistan on orders above Rs. 3,500!';
  const showAnnouncement = storeSettings?.showAnnouncement ?? true;
  const customNoticeText = storeSettings?.customNoticeText;
  const showCustomNotice = storeSettings?.showCustomNotice ?? true;

  return (
    <header className="w-full z-40 bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Dynamic Announcement Bar if enabled */}
      {showAnnouncement && announcementText && (
        <div className="bg-gradient-to-r from-gold-600 via-amber-500 to-gold-600 text-emerald-950 font-bold text-xs py-1.5 px-4 text-center tracking-wide shadow-inner flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* Top Contact Bar */}
      <div className="bg-emerald-950 text-white text-xs py-2 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2 border-b border-emerald-900">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-gray-200">{address}</span>
          </div>
          <span className="hidden md:inline text-gray-500">|</span>
          <span className="text-gold-500 font-medium tracking-wide">Since {estYear} - Trusted for Generations</span>
        </div>
        <div className="flex items-center gap-5">
          <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-gold-100 transition-colors">
            <Phone className="w-3.5 h-3.5 text-gold-500" />
            <span className="font-semibold tracking-wider text-gray-100">{phone}</span>
          </a>
          <span className="text-gray-500">|</span>
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/share/1QftQSKCk6/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-gold-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-green-400 transition-colors" aria-label="WhatsApp">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.244 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.414 9.863-9.84.002-2.63-1.023-5.101-2.885-6.967C16.586 1.982 14.111.96 11.488.96c-5.441 0-9.866 4.415-9.869 9.843-.001 1.76.47 3.472 1.365 4.981L1.944 21.8l6.194-1.626z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Special Promotional Notice Banner if enabled */}
      {showCustomNotice && customNoticeText && (
        <div className="bg-emerald-900 text-gold-300 text-xs font-bold py-1.5 px-4 text-center tracking-wide border-b border-emerald-800">
          <span>{customNoticeText}</span>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Malik Brand Logo - Matching the Emblem style in image */}
        <a href="/" aria-label="Malik Oil Expellers home" className="flex items-center">
          <FullBrandLogo
            logoUrl={storeSettings?.logoUrl}
            storeName={storeSettings?.storeName}
            tagline={storeSettings?.tagline}
            estYear={storeSettings?.estYear}
          />
        </a>

        {/* Desktop Menu - Matches style of image (Simple capital letters) */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wide text-emerald-950">
<a href="/" className="hover:text-gold-600 py-2">HOME</a>
<a href="/about" className="hover:text-gold-600 py-2">ABOUT</a>
<a href="/products" className="hover:text-gold-600 py-2">PRODUCTS</a>
<a href="/#products-section" className="hover:text-gold-600 py-2">SHOP</a>
<a href="/track" className="hover:text-gold-600 py-2">TRACK ORDER</a>
<a href="/contact" className="hover:text-gold-600 py-2">CONTACT</a>
</nav>

        {/* Secondary Icons Block */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <a href="/#products-section" className="hidden sm:block text-xs underline">Search products</a>

          {/* Cart Icon with custom counter */}
          <motion.button
            onClick={onCartClick}
            animate={isBouncing ? { scale: [1, 1.35, 0.9, 1.25, 1], rotate: [0, -12, 12, -6, 0] } : { scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative p-2 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer"
            aria-label="Open cart"
          >
            <ShoppingCart className={`w-5.5 h-5.5 transition-colors ${isBouncing ? 'text-gold-600' : ''}`} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: isBouncing ? [1, 1.4, 1] : 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-gold-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {/* Store Admin Dashboard switch */}
          <button
            onClick={onAdminToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm transition-all border duration-200 cursor-pointer ${
              isAdmin
                ? 'bg-gold-500 text-white border-gold-600 hover:bg-gold-600'
                : 'bg-emerald-950 text-gold-500 border-gold-500/30 hover:bg-emerald-900 hover:border-gold-500'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Storefront View' : 'Store Admin'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav bar helper */}
      <nav aria-label="Mobile navigation" className="lg:hidden flex justify-around bg-emerald-950 text-white text-xs py-3"><a href="/">HOME</a><a href="/products">PRODUCTS</a><a href="/faq">FAQs</a><a href="/track">TRACK</a><a href="/contact">CONTACT</a></nav>
    </header>
  );
}
