import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'ATELIER ÉLITE | Haute Couture & Minimalist Luxury Fashion',
  description:
    'Discover refined menswear, womenswear, and artisanal accessories. Architectural tailoring, pure Mongolian cashmere, and liquid silk charmeuse.',
  keywords: ['luxury fashion', 'cashmere overcoat', 'silk dress', 'linen shirt', 'designer clothing', 'atelier'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="grow">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
