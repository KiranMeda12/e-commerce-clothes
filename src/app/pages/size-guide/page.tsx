import React from 'react';
import { Ruler } from 'lucide-react';

export default function SizeGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-2 pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Tailoring Dimensions
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Size & Measurement Guide
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          Precision dimensions cut to modern international tailoring standards.
        </p>
      </div>

      <div className="space-y-10 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        {/* Women's Table */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-neutral-900">Women's Ready-to-Wear (Inches)</h2>
          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-900 border-b">
                <tr>
                  <th className="p-3 font-semibold">Atelier Size</th>
                  <th className="p-3 font-semibold">Bust</th>
                  <th className="p-3 font-semibold">Waist</th>
                  <th className="p-3 font-semibold">Hips</th>
                  <th className="p-3 font-semibold">Equivalent UK/EU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr><td className="p-3 font-semibold">XS</td><td className="p-3">32 - 34"</td><td className="p-3">25 - 27"</td><td className="p-3">35 - 37"</td><td className="p-3">UK 6 / EU 34</td></tr>
                <tr><td className="p-3 font-semibold">S</td><td className="p-3">34 - 36"</td><td className="p-3">27 - 29"</td><td className="p-3">37 - 39"</td><td className="p-3">UK 8 / EU 36</td></tr>
                <tr><td className="p-3 font-semibold">M</td><td className="p-3">36 - 38"</td><td className="p-3">29 - 31"</td><td className="p-3">39 - 41"</td><td className="p-3">UK 10 / EU 38</td></tr>
                <tr><td className="p-3 font-semibold">L</td><td className="p-3">38 - 40"</td><td className="p-3">31 - 33"</td><td className="p-3">41 - 43"</td><td className="p-3">UK 12 / EU 40</td></tr>
                <tr><td className="p-3 font-semibold">XL</td><td className="p-3">40 - 42"</td><td className="p-3">33 - 35"</td><td className="p-3">43 - 45"</td><td className="p-3">UK 14 / EU 42</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Men's Table */}
        <div className="space-y-4 pt-4 border-t border-[#ECE7DF]">
          <h2 className="font-serif text-xl text-neutral-900">Men's Tailoring & Shirts (Inches)</h2>
          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-neutral-900 border-b">
                <tr>
                  <th className="p-3 font-semibold">Atelier Size</th>
                  <th className="p-3 font-semibold">Chest</th>
                  <th className="p-3 font-semibold">Waist</th>
                  <th className="p-3 font-semibold">Collar (in)</th>
                  <th className="p-3 font-semibold">Suit Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr><td className="p-3 font-semibold">S</td><td className="p-3">36 - 38"</td><td className="p-3">30 - 32"</td><td className="p-3">15"</td><td className="p-3">36R / 38R</td></tr>
                <tr><td className="p-3 font-semibold">M</td><td className="p-3">39 - 41"</td><td className="p-3">32 - 34"</td><td className="p-3">15.5"</td><td className="p-3">40R</td></tr>
                <tr><td className="p-3 font-semibold">L</td><td className="p-3">42 - 44"</td><td className="p-3">34 - 36"</td><td className="p-3">16.5"</td><td className="p-3">42R / 44R</td></tr>
                <tr><td className="p-3 font-semibold">XL</td><td className="p-3">45 - 47"</td><td className="p-3">36 - 38"</td><td className="p-3">17.5"</td><td className="p-3">46R</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
