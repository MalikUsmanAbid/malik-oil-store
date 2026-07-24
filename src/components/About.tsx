import React from 'react';
import { ShieldCheck, History, Wheat, Settings, Leaf, MapPin } from 'lucide-react';

export default function About() {
  return (
    <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 font-sans">
      {/* Brand history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-black text-gold-600 tracking-widest uppercase">Since 1970</span>
          <h2 className="text-3xl font-serif font-black text-emerald-950">
            Trusted Over Fifty Years
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Founded in 1970, Malik Oil Expellers began as a humble local milling setup in Samundri with a clear mission: to extract cooking oils in their absolute raw, pristine form. Over five decades of generation-to-generation leadership, we have stayed true to our roots, refusing chemical bleaching, refining, or mixing.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Today, our modern expellers at Okara Road handle premium canola, sarson, til, and rocket seeds, delivering top-quality cold-pressed oils. Our high-nutrition oil cake (Khall) and premium compound feed (Wanda) support thousands of dairy farms across the region.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-2.5 items-start">
              <History className="w-5 h-5 text-emerald-950 shrink-0" />
              <div>
                <h4 className="font-serif font-black text-[11px] text-emerald-950 uppercase">ESTABLISHED 1970</h4>
                <p className="text-[9px] text-gray-500 mt-0.5">Continuous operations in Samundri for 50+ years.</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-2.5 items-start">
              <Leaf className="w-5 h-5 text-emerald-950 shrink-0" />
              <div>
                <h4 className="font-serif font-black text-[11px] text-emerald-950 uppercase">100% COLD PRESSED</h4>
                <p className="text-[9px] text-gray-500 mt-0.5">Strictly mechanical extraction with zero chemical additives.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right mockup visual */}
        <div className="lg:col-span-6 text-white p-8 rounded-3xl border border-gold-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between h-96 group">
          {/* Real-world background image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/seed_milling_factory_1784627556195.jpg"
              alt="Malik Oil Expeller Mill"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark green gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/85 to-emerald-900/40"></div>
          </div>
          
          <div className="relative z-10 space-y-4">
            <span className="text-xs text-gold-500 font-extrabold tracking-widest uppercase">The Expeller Process</span>
            <h3 className="font-serif font-bold text-xl">Mechanical Seed Pressing</h3>
            <p className="text-[11px] text-gray-200 leading-relaxed">
              Our advanced seed expellers use heavy-duty rotating screws to crush seeds through physical pressure. This generates minimal heat, keeping the healthy fats, vitamins, and delicious aromas of Canola and Sarson perfectly intact.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-[10px] font-bold border-t border-white/15 pt-4">
            <div className="p-2 bg-emerald-950/70 border border-emerald-800/50 rounded-lg">
              <Wheat className="w-5 h-5 text-gold-500 mx-auto mb-1.5" />
              <span>Seed Cleaning</span>
            </div>
            <div className="p-2 bg-emerald-950/70 border border-emerald-800/50 rounded-lg">
              <Settings className="w-5 h-5 text-gold-500 mx-auto mb-1.5" />
              <span>Screw Pressing</span>
            </div>
            <div className="p-2 bg-emerald-950/70 border border-emerald-800/50 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-gold-500 mx-auto mb-1.5" />
              <span>Natural Settling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse location details */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center max-w-3xl mx-auto space-y-5">
        <MapPin className="w-10 h-10 text-gold-500 mx-auto animate-bounce" />
        <h3 className="font-serif font-black text-xl text-emerald-950 uppercase tracking-wide">VISIT OUR SAMUNDRI UNIT</h3>
        <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
          Our main processing factory and warehouse is located right on Okara Road, Samundri. We welcome bulk clients, tankers, and dairy farming cooperators for custom extraction runs. Feel free to visit or call our helpline to organize a dispatch order.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="https://share.google/s8gQeKMpgupcyX4JE"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-emerald-950 bg-gold-50 border border-gold-500/10 hover:border-gold-500 hover:bg-gold-500/10 transition-all px-5 py-2 rounded-full uppercase tracking-widest cursor-pointer"
          >
            Okara Road, Samundri, Punjab, Pakistan
          </a>
          <a
            href="https://share.google/s8gQeKMpgupcyX4JE"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 transition-colors px-5 py-2 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Open Google Maps</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
