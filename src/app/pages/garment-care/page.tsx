import React from 'react';
import { Sparkles, Shield, RefreshCw } from 'lucide-react';

export default function GarmentCarePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-2 pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Garment Longevity
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Preservation & Care Guide
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Simple guidelines to ensure your natural fibers retain their luster, texture, and structure for decades.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        <div className="space-y-3">
          <h2 className="font-serif text-xl text-black font-normal">1. Mongolian Cashmere & Fine Merinos</h2>
          <p>
            Cashmere fibers benefit immensely from gentle care. We advise resting your knitwear for 24 hours between wearings. When required, hand wash in lukewarm water with a pH-neutral wool cleanser. Lay flat on a clean dry towel away from direct heat sources. Never hang damp knitwear.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#ECE7DF]">
          <h2 className="font-serif text-xl text-black font-normal">2. Mulberry Silk Charmeuse</h2>
          <p>
            Silk is an organic protein filament requiring mild treatment. We recommend professional green dry cleaning or gentle cold-water hand washing. Steam on low silk setting from the reverse side to preserve its luminous finish.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#ECE7DF]">
          <h2 className="font-serif text-xl text-black font-normal">3. European Washed Flax Linen</h2>
          <p>
            Linen softens and gains character with every wash. Machine wash cold on a delicate cycle and air dry naturally. Embrace its natural, unhurried wrinkling as a hallmark of authentic flax craftsmanship.
          </p>
        </div>
      </div>
    </div>
  );
}
