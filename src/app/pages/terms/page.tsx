import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
      <div className="border-b border-[#ECE7DF] pb-6">
        <h1 className="font-serif text-3xl text-neutral-900">Terms of Service & Order Governance</h1>
        <p className="text-xs text-neutral-400 mt-1">Effective October 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">1. Ordering & Acceptance</h2>
        <p>
          Every order placed through Atelier Élite constitutes an offer to purchase our garments. Orders are confirmed and binding once payment verification is executed by our banking gateway or Cash on Delivery terms are accepted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">2. Pricing & Currency</h2>
        <p>
          All prices displayed are listed in Indian Rupees (INR) and are inclusive of standard applicable GST. We reserve the right to correct pricing errors before fulfillment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">3. Intellectual Property</h2>
        <p>
          The Atelier Élite trademarks, silhouettes, bespoke photography, and text content represent proprietary intellectual property. Unauthorized commercial reproduction is strictly prohibited.
        </p>
      </section>
    </div>
  );
}
