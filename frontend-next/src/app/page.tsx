"use client";

import React from 'react';
import Hero from '@/components/Hero';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const Home = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const { fetchProducts } = await import('@/lib/api');
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Section Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-heading font-bold text-dark">Featured Collection</h2>
            <Link href="/products" className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {/* Placeholder for Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse"></div>
              ))
            ) : (
              products.slice(0, 4).map((product: any) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-dark mb-4">Create, List, Earn</h2>
            <p className="text-gray-600 text-lg">
              Join the creator economy. Use our advanced AI tools to design unique t-shirts and earn royalties on every sale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Generate with AI",
                desc: "Describe your vision and let our AI generate stunning, high-resolution artwork in seconds.",
                icon: "✨"
              },
              {
                step: "02",
                title: "List for Sale",
                desc: "Publish your design to our marketplace. We handle printing, shipping, and customer service.",
                icon: "🚀"
              },
              {
                step: "03",
                title: "Earn Rewards",
                desc: "Get paid every time someone buys a t-shirt with your design. Track your earnings in real-time.",
                icon: "💰"
              }
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-4xl opacity-50 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-5xl font-bold text-gray-100 mb-4 block">{item.step}</span>
                <h3 className="text-xl font-bold text-dark mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Ready to launch your brand?</h2>
              <p className="text-indigo-100 text-lg mb-8">
                No inventory, no upfront costs. Just your creativity and our platform. Start designing today.
              </p>
              <Link href="/create" className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                Start Creating Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-dark text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Join the Movement</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive drops, early access to sales, and style tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
