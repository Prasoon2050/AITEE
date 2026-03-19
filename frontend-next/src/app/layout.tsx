import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "TeeStore - AI Powered Fashion",
  description: "Wear Unique AI Art or Create & Earn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ScrollToTop />
        <UserProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              <main className="pt-20">
                {children}
              </main>
            </CartProvider>
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}
