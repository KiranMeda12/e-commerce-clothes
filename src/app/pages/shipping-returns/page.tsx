import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Clock } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-2 pb-6 border-b border-[#ECE7DF]">
        <span className="text-[10px] uppercase tracking-luxury text-[#957856] font-semibold">
          Client Services
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 tracking-tight">
          Shipping & Complimentary Returns
        </h1>
        <p className="text-xs text-neutral-500 font-light">
          White-glove delivery, insured transit, and seamless returns concierge.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-neutral-900 font-normal">1. Domestic & Global Delivery</h2>
          <p>
            Every Atelier Élite creation is inspected by our master quality controller, enveloped in acid-free tissue paper, and placed within a signature moisture-sealed presentation box before dispatch.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li><strong>Complimentary White-Glove Shipping:</strong> Orders valued above ₹2,999 qualify automatically for complimentary insured priority courier dispatch.</li>
            <li><strong>Standard Priority Delivery:</strong> Flat rate of ₹199 for orders under ₹2,999.</li>
            <li><strong>Transit Timelines:</strong> Metro regions receive delivery within 24 to 48 hours; all other domestic locations within 3 to 4 business days.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#ECE7DF]">
          <h2 className="font-serif text-xl text-neutral-900 font-normal">2. 7-Day Complimentary Returns & Exchanges</h2>
          <p>
            Should a silhouette not satisfy your exact specifications, we offer a 7-day complimentary home pickup exchange and return policy.
          </p>
          <p>
            To initiate an exchange or return:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-neutral-600">
            <li>Visit your <Link href="/account/orders" className="underline font-semibold text-black">Client Account Orders</Link> dashboard.</li>
            <li>Select the delivered order and click <em>Request Return / Exchange</em>.</li>
            <li>Select your size exchange preference or return reason. Our courier partner will arrive at your address with pre-printed return labels.</li>
          </ol>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#ECE7DF]">
          <h2 className="font-serif text-xl text-neutral-900 font-normal">3. Return Requirements</h2>
          <p>
            Garments must be returned in their pristine original state, unworn, unwashed, with all natural horn buttons, security tags, and branded garment bags intact.
          </p>
        </section>
      </div>
    </div>
  );
}
