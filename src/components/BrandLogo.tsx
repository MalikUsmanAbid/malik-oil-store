import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  logoUrl?: string;
}

export function BrandLogoEmblem({ className = '', size = 48, logoUrl }: BrandLogoProps) {
  const finalLogo = logoUrl || '/src/assets/images/malik_real_logo_1784634645165.jpg';
  return (
    <div 
      className={`relative overflow-hidden rounded-full border-2 border-amber-500/30 bg-white shadow-sm flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={finalLogo}
        alt="Brand Emblem"
        referrerPolicy="no-referrer"
        className="w-[90%] h-[90%] object-contain"
      />
    </div>
  );
}

export function FullBrandLogo({
  showSubtext = true,
  lightTheme = true,
  logoUrl,
  storeName = 'MALIK OIL',
  tagline = 'PURE COLD PRESSED',
  estYear = '1970',
}: {
  showSubtext?: boolean;
  lightTheme?: boolean;
  logoUrl?: string;
  storeName?: string;
  tagline?: string;
  estYear?: string;
}) {
  const finalLogo = logoUrl || '/src/assets/images/malik_real_logo_1784634645165.jpg';

  return (
    <div className="flex items-center gap-3">
      {/* Brand logo image with clean shadow */}
      <div className={`relative p-1 rounded-xl shadow-md border ${
        lightTheme 
          ? 'bg-white border-amber-500/20' 
          : 'bg-white border-white/15'
      }`}>
        <img
          src={finalLogo}
          alt="Brand Logo"
          referrerPolicy="no-referrer"
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h1 className={`${lightTheme ? 'text-emerald-950' : 'text-white'} font-serif font-black text-lg sm:text-xl leading-none tracking-wider`}>
            {storeName.toUpperCase()}
          </h1>
          <span className="text-[9px] bg-amber-500 text-emerald-950 px-1 py-0.5 rounded-sm font-sans font-extrabold tracking-wide uppercase leading-none">
            Asli
          </span>
        </div>
        <span className="text-[9px] text-gold-600 font-serif tracking-[0.2em] font-black uppercase leading-tight mt-1">
          {tagline.toUpperCase()}
        </span>
        {showSubtext && (
          <span className="text-[8px] text-gray-400 font-bold tracking-[0.12em] leading-none mt-1 uppercase">
            Oil Expellers • Since {estYear}
          </span>
        )}
      </div>
    </div>
  );
}


