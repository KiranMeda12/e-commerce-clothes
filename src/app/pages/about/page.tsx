import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-2 pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Maison Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Form, Texture, & Permanence
        </h1>
        <p className="text-xs text-neutral-500 font-light max-w-md mx-auto">
          An architectural study in slow luxury clothing, created to endure far beyond seasonal turnover.
        </p>
      </div>

      <div className="relative aspect-16/9 bg-[#F5F1EB] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"
          alt="Atelier Élite Philosophy"
          fill
          sizes="800px"
          className="object-cover"
        />
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        <p>
          Atelier Élite was founded with a singular conviction: that modern luxury is defined by deliberate restraint rather than excessive ornament. We believe garments should possess tactile gravity, drape with effortless fluidity, and survive decades in a personal wardrobe.
        </p>
        <p>
          Every fiber in our seasonal capsules is traced directly to master mills. Our double-faced cashmere is spun from select Mongolian goat herds; our linens are steeped and rinsed in northern European waters; and our suitings are woven from virgin merino wools in century-old Italian mills.
        </p>
        <p>
          We deliberately eschew trend cycles. Instead, each design is drafted with architectural proportion—allowing you to assemble an enduring uniform of timeless ease.
        </p>
      </div>
    </div>
  );
}
