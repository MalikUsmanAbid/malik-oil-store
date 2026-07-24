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
  const phone = storeSettings?.phone || '0300-1234567';
  const whatsapp = storeSettings?.whatsapp || '923001234567';
  const address = storeSettings?.address || 'Vehari Road, Samundri';
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
            <a href="https://www.facebook.com/profile.php?id=100086438732038" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-gold-500 transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-green-400 transition-colors" aria-label="WhatsApp">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.244 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.414 9.863-9.84.002-2.63-1.023-5.101-2.885-6.967C16.586 1.982 14.111.96 11.488.96c-5.441 0-9.866 4.415-9.869 9.843-.001 1.76.47 3.472 1.365 4.981L1.944 21.8l6.194-1.626z" />
              </svg>
            </a>
            <a href="#" className="text-gray-300 hover:text-gold-500 transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
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
        <div className="cursor-pointer flex items-center" onClick={() => setActiveTab('home')}>
          <FullBrandLogo
            logoUrl={storeSettings?.logoUrl}
            storeName={storeSettings?.storeName}
            tagline={storeSettings?.tagline}
            estYear={storeSettings?.estYear}
          />
        </div>

        {/* Desktop Menu - Matches style of image (Simple capital letters) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-widest text-emerald-950">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer hover:text-gold-600 transition-colors py-1 relative ${
              activeTab === 'home' ? 'text-gold-600 border-b-2 border-gold-500' : ''
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`cursor-pointer hover:text-gold-600 transition-colors py-1 relative ${
              activeTab === 'about' ? 'text-gold-600 border-b-2 border-gold-500' : ''
            }`}
          >
            ABOUT US
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="cursor-pointer hover:text-gold-600 transition-colors py-1"
          >
            PRODUCTS
          </button>
          <button
            onClick={() => {
              setActiveTab('home');
              setTimeout(() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="cursor-pointer hover:text-gold-600 transition-colors py-1"
          >
            SHOP
          </button>
          <button
            onClick={onTrackOrderClick}
            className={`cursor-pointer hover:text-gold-600 transition-colors py-1 relative ${
              activeTab === 'track' ? 'text-gold-600 border-b-2 border-gold-500' : ''
            }`}
          >
            ORDER TRACKING
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('contact-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer hover:text-gold-600 transition-colors py-1"
          >
            CONTACT US
          </button>
        </nav>

        {/* Secondary Icons Block */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search Pure Oils..."
              onClick={() => {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:w-48 transition-all"
            />
          </div>

          {/* Cart Icon with custom counter */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-emerald-950 hover:text-gold-600 transition-colors cursor-pointer"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-gold-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {/* Shopify Admin Dashboard switch */}
          <button
            onClick={onAdminToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm transition-all border duration-200 cursor-pointer ${
              isAdmin
                ? 'bg-gold-500 text-white border-gold-600 hover:bg-gold-600'
                : 'bg-emerald-950 text-gold-500 border-gold-500/30 hover:bg-emerald-900 hover:border-gold-500'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Storefront View' : 'Shopify Admin'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav bar helper */}
      <div className="lg:hidden flex justify-around bg-emerald-950 text-white text-[10px] font-bold tracking-wider py-2.5 border-t border-emerald-900">
        <button onClick={() => setActiveTab('home')} className={`px-2 ${activeTab === 'home' ? 'text-gold-500' : 'text-gray-300'}`}>HOME</button>
        <button onClick={() => setActiveTab('about')} className={`px-2 ${activeTab === 'about' ? 'text-gold-500' : 'text-gray-300'}`}>ABOUT</button>
        <button onClick={() => {
          setActiveTab('home');
          setTimeout(() => {
            document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }} className="px-2 text-gray-300">PRODUCTS</button>
        <button onClick={onTrackOrderClick} className={`px-2 ${activeTab === 'track' ? 'text-gold-500' : 'text-gray-300'}`}>TRACK</button>
      </div>
    </header>
  );
}
