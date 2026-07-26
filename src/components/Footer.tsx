import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Award } from 'lucide-react';
import { FullBrandLogo } from './BrandLogo';
import { StoreSettings } from '../types';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onTrackOrderClick: () => void;
  storeSettings?: StoreSettings;
}

export default function Footer({ onNavClick, onTrackOrderClick, storeSettings }: FooterProps) {
  const address = storeSettings?.address || 'Vehari Road, Samundri, Faisalabad, Pakistan';
  const phone = storeSettings?.phone || '0300-1234567';
  const whatsapp = storeSettings?.whatsapp || '923001234567';
  const email = storeSettings?.email || 'info@malikoil.pk';
  const estYear = storeSettings?.estYear || '1970';

  return (
    <footer id="contact-section" className="bg-[#03150D] text-gray-300 font-sans border-t-2 border-gold-500">
      {/* Upper footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Malik Branding & Socials */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <FullBrandLogo
                lightTheme={false}
                logoUrl={storeSettings?.logoUrl}
                storeName={storeSettings?.storeName}
                tagline={storeSettings?.tagline}
                estYear={storeSettings?.estYear}
              />
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Since {estYear}, we are committed to providing 100% pure and natural cold-pressed culinary oils, organic seed byproducts, and premium livestock feeds of the highest standards.
            </p>

            {/* Social handles matching image circles */}
            <div className="flex items-center gap-3.5">
              <a href="https://www.facebook.com/profile.php?id=100086438732038" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-gray-300 hover:bg-gold-500 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-gray-300 hover:bg-green-500 hover:text-white transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.244 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.414 9.863-9.84.002-2.63-1.023-5.101-2.885-6.967C16.586 1.982 14.111.96 11.488.96c-5.441 0-9.866 4.415-9.869 9.843-.001 1.76.47 3.472 1.365 4.981L1.944 21.8l6.194-1.626z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-gray-300 hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 font-sans">
            <h4 className="font-serif font-black text-xs text-white uppercase tracking-widest border-b border-emerald-950 pb-2">
              QUICK NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs font-bold text-gray-400">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-gold-500 transition-colors uppercase cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('about')} className="hover:text-gold-500 transition-colors uppercase cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <a
                  href="#products-section"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick('home');
                    setTimeout(() => {
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-gold-500 transition-colors uppercase"
                >
                  Our Products
                </a>
              </li>
              <li>
                <button onClick={onTrackOrderClick} className="hover:text-gold-500 transition-colors uppercase cursor-pointer">
                  Order Tracking
                </button>
              </li>
              <li>
                <a
                  href="#contact-section"
                  className="hover:text-gold-500 transition-colors uppercase"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif font-black text-xs text-white uppercase tracking-widest border-b border-emerald-950 pb-2">
              CUSTOMER SERVICES
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li><a href="#" className="hover:text-gold-500 transition-colors">My Account</a></li>
              <li><span className="text-gray-500">Cart & Checkout</span></li>
              <li><span className="text-gray-500">Shipping Policy</span></li>
              <li><span className="text-gray-500">Return & Refund Policy</span></li>
              <li><span className="text-gray-500">Terms & Conditions</span></li>
            </ul>
          </div>

          {/* Column 4: Contact Us & Seals */}
          <div className="space-y-5">
            <h4 className="font-serif font-black text-xs text-white uppercase tracking-widest border-b border-emerald-950 pb-2">
              GET IN TOUCH
            </h4>
            
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  {address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`tel:${phone}`} className="font-semibold text-gray-200 hover:text-gold-500">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-gold-500">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-gray-400">Mon - Sat: 9:00 AM - 8:00 PM</span>
              </li>
            </ul>

            {/* Quality Seals */}
            <div className="pt-2 border-t border-emerald-950/50 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-950/40 border border-gold-500/10 rounded text-gold-500 hover:border-gold-500/40 transition-all flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span className="text-[9px] font-bold tracking-widest uppercase">Premium Quality 100% Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright strip */}
      <div className="bg-[#020d08] py-5 border-t border-emerald-950/80 text-[10px] text-center text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Malik Oil Expellers. All Rights Reserved.</span>
          <span>Designed with ❤ for Quality & Purity.</span>
        </div>
      </div>
    </footer>
  );
}
