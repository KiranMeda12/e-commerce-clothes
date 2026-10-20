import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-xs sm:text-sm text-neutral-700 leading-relaxed font-light">
      <div className="border-b border-[#ECE7DF] pb-6">
        <h1 className="font-serif text-3xl text-neutral-900">Privacy & Client Data Governance</h1>
        <p className="text-xs text-neutral-400 mt-1">Last revised: October 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">1. Principles of Data Stewardship</h2>
        <p>
          Atelier Élite values your privacy as highly as our craftsmanship. We gather only the minimal information strictly required to manufacture, process, and fulfill your orders with white-glove security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">2. Information Gathered</h2>
        <p>
          When you place an order or register for an account, we record your legal name, contact phone, dispatch address, and email for dispatch notifications. Sensitive payment details (credit card numbers, UPI credentials) are processed directly by certified RBI-compliant payment gateways such as Razorpay and are never stored on our application servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-black font-normal">3. Non-Disclosure & Security</h2>
        <p>
          We do not sell, license, or barter client data to third-party advertising networks. Data access is restricted strictly to authorized store personnel solely for order fulfillment and logistics tracking.
        </p>
      </section>
    </div>
  );
}
