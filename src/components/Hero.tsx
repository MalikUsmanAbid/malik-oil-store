import React from 'react';
import { Droplets, ShieldCheck, Award, Heart, Phone, ShoppingBag, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { StoreSettings } from '../types';

interface HeroProps {
  onOrderNowClick: () => void;
  storeSettings?: StoreSettings;
}

export default function Hero({ onOrderNowClick, storeSettings }: HeroProps) {
  const estYear = storeSettings?.estYear || '1970';
  const heroTitle = storeSettings?.heroTitle || 'MALIK OIL EXPELLERS';
  const heroSubtitle = storeSettings?.heroSubtitle || 'Pure Oils, Trusted for Generations. Traditional wood-pressed natural oils and organic livestock feed.';
  const phone = storeSettings?.phone || '0300-1234567';
  const heroImage = storeSettings?.heroImageUrl || '/src/assets/images/malik_branded_hero_1784633050272.jpg';

  // Representation of the 4 primary oils to render side-by-side
  const heroOils = [
    { name: 'Canola Oil', label: 'CANOLA OIL', color: 'from-yellow-400 to-amber-500', tag: 'HEART HEALTHY' },
    { name: 'Sarson Oil', label: 'SARSON OIL', color: 'from-amber-500 to-yellow-600', tag: '100% TRADITIONAL' },
    { name: 'Til Oil', label: 'TIL OIL', color: 'from-amber-600 to-orange-700', tag: 'ANTIOXIDANT RICH' },
    { name: 'Taramira Oil', label: 'TARAMIRA OIL', color: 'from-yellow-600 to-amber-800', tag: 'HAIR & SKIN THERAPY' },
  ];

  return (
    <section className="relative bg-emerald-950 text-white overflow-hidden py-16 md:py-20 lg:py-24 border-b-4 border-gold-500">
      {/* Premium Background Image with Spotlight Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Malik Oils Banner Background"
          className="w-full h-full object-cover opacity-25 filter blur-[2px] scale-105 select-none"
          referrerPolicy="no-referrer"
        />
        {/* Dark radial and directional gradients for premium ambient focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/95 to-emerald-950/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-transparent to-emerald-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Content with stagger slide-up */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left"
          >
            <span className="italic font-serif text-gold-500 text-lg md:text-xl font-medium tracking-wide">
              Since {estYear}
            </span>
            
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-wider text-white uppercase">
                {heroTitle}
              </h1>
            </div>

            <p className="text-gold-500 font-sans text-base md:text-lg font-light tracking-wide max-w-xl mx-auto lg:mx-0">
              {heroSubtitle}
            </p>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center">
              <div className="flex flex-col items-center space-y-1.5 bg-emerald-900/45 p-3.5 rounded-xl border border-gold-500/10 hover:border-gold-500/40 hover:bg-emerald-900/60 transition-all duration-300">
                <Leaf className="w-5 h-5 text-gold-500" />
                <span className="text-[10px] font-bold tracking-wider text-gray-100">100% PURE & NATURAL</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5 bg-emerald-900/45 p-3.5 rounded-xl border border-gold-500/10 hover:border-gold-500/40 hover:bg-emerald-900/60 transition-all duration-300">
                <Droplets className="w-5 h-5 text-gold-500" />
                <span className="text-[10px] font-bold tracking-wider text-gray-100">COLD PRESSED GOODNESS</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5 bg-emerald-900/45 p-3.5 rounded-xl border border-gold-500/10 hover:border-gold-500/40 hover:bg-emerald-900/60 transition-all duration-300">
                <Award className="w-5 h-5 text-gold-500" />
                <span className="text-[10px] font-bold tracking-wider text-gray-100">PREMIUM QUALITY</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5 bg-emerald-900/45 p-3.5 rounded-xl border border-gold-500/10 hover:border-gold-500/40 hover:bg-emerald-900/60 transition-all duration-300">
                <Heart className="w-5 h-5 text-gold-500" />
                <span className="text-[10px] font-bold tracking-wider text-gray-100">TRUSTED GENERATIONS</span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button
                onClick={onOrderNowClick}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gold-600 hover:bg-gold-500 active:bg-gold-700 text-white font-bold text-sm tracking-widest rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                ORDER NOW
              </button>
              <a
                href="tel:03007618236"
                className="flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white hover:border-gold-500 hover:text-gold-500 text-white font-bold text-sm tracking-widest rounded-lg transition-all duration-200 cursor-pointer hover:bg-white/5"
              >
                <Phone className="w-4 h-4" />
                CALL NOW
              </a>
            </div>
          </motion.div>

          {/* Right Showcase Panel with fade slide in */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative flex flex-col items-center"
          >
            {/* Trust badge stamp from original image */}
            <div className="absolute -top-5 -right-3 md:-right-5 z-20 bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 font-serif font-extrabold w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-double border-emerald-950 flex flex-col items-center justify-center text-center shadow-2xl transform rotate-12 hover:rotate-6 transition-all duration-300">
              <span className="text-[9px] font-sans font-bold tracking-widest uppercase">Since 1970</span>
              <span className="text-lg md:text-2xl font-black leading-none text-emerald-950">50+</span>
              <span className="text-[7px] font-sans font-bold tracking-wider uppercase leading-none">Years of</span>
              <span className="text-[8px] font-sans font-bold tracking-widest uppercase leading-none text-emerald-950">Trust</span>
            </div>

            {/* Premium Photo Showcase Frame */}
            <div className="relative w-full max-w-md bg-emerald-900/40 p-2.5 rounded-3xl border-2 border-gold-500/30 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[4/3] group">
              <img
                src={heroImage}
                alt="Malik Pure Cold-Pressed Oils Showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              {/* Subtle Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent pointer-events-none rounded-2xl"></div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 backdrop-blur-md px-4 py-3 rounded-xl border border-gold-500/20 flex justify-between items-center shadow-lg">
                <span className="text-[10px] font-bold tracking-widest text-gold-500 uppercase">Premium Selection</span>
                <span className="text-[9px] text-gray-300 font-sans">Canola • Sarson • Til • Taramira</span>
              </div>
            </div>

            {/* Small trust features indicator below image */}
            <div className="flex gap-4 mt-4 text-[10px] text-gold-200 font-semibold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">✨ 100% Organic</span>
              <span className="text-gold-500/40">•</span>
              <span className="flex items-center gap-1.5">🧪 Chemical Free</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
