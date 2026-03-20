"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Leaf,
  Users,
  Palette,
  Zap,
  ArrowRight,
  Heart,
  Globe,
  Award,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stats = [
  { label: "Happy Customers", value: "50,000+" },
  { label: "AI Designs Created", value: "200,000+" },
  { label: "Creator Payouts", value: "$1.2M+" },
  { label: "Countries Served", value: "30+" },
];

const values = [
  {
    icon: Sparkles,
    title: "AI Innovation",
    desc: "We harness cutting-edge generative AI to turn your ideas into wearable art in seconds.",
    color: "from-indigo-500 to-purple-500",
    bg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    icon: Users,
    title: "Creator First",
    desc: "Our platform empowers creators with fair royalties, full ownership, and real-time analytics.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Leaf,
    title: "Sustainable Fashion",
    desc: "Print-on-demand means zero waste. We use eco-friendly inks and ethically sourced cotton.",
    color: "from-green-500 to-lime-500",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Every tee is crafted from 100% premium combed cotton with vibrant, long-lasting prints.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: Palette,
    title: "Unlimited Creativity",
    desc: "From photorealistic art to abstract patterns, our AI supports any style you can imagine.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "Join thousands of creators and shoppers from around the world building the future of fashion.",
    color: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
];

const timeline = [
  {
    year: "2024",
    title: "The Idea",
    desc: "TeeStore was born from a simple question: what if anyone could design and sell premium t-shirts using AI?",
  },
  {
    year: "2024",
    title: "Beta Launch",
    desc: "We launched our beta with 50 early creators and shipped our first 1,000 AI-designed tees.",
  },
  {
    year: "2025",
    title: "Going Global",
    desc: "Expanded to 30+ countries, welcomed 50,000 customers, and paid out over $1M to our creators.",
  },
  {
    year: "Future",
    title: "What's Next",
    desc: "AR try-ons, collaborative design tools, and new product categories are on the horizon.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50/40 to-purple-50/30 pt-12 pb-24">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-200/15 to-sky-200/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-100 text-primary text-sm font-semibold mb-6">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-dark leading-tight mb-6">
              Fashion Meets{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Artificial Intelligence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              We're on a mission to democratize fashion design. TeeStore
              combines the power of generative AI with premium quality apparel,
              empowering anyone to become a designer and earn from their
              creativity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow"
              >
                <p className="text-2xl md:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark mb-6 leading-tight">
                Empowering creators,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                  one tee at a time
                </span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We believe great design shouldn't require years of training or
                expensive software. With TeeStore, anyone with an imagination
                can create stunning, one-of-a-kind t-shirts using our AI design
                tools, and earn real money when their designs sell.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our print-on-demand model means zero inventory waste. Each
                shirt is printed only when ordered, using eco-friendly inks on
                ethically sourced premium cotton. We're building a fashion
                future that's creative, inclusive, and sustainable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white aspect-square flex flex-col justify-end">
                    <Zap className="w-8 h-8 mb-3 opacity-80" />
                    <h4 className="font-bold text-lg">AI Powered</h4>
                    <p className="text-indigo-100 text-sm">
                      Generate designs in seconds
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-3xl p-6 flex flex-col justify-end">
                    <Heart className="w-8 h-8 mb-3 text-rose-500" />
                    <h4 className="font-bold text-lg text-dark">Made with Love</h4>
                    <p className="text-gray-500 text-sm">
                      Premium quality guaranteed
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-emerald-50 rounded-3xl p-6 flex flex-col justify-end">
                    <Leaf className="w-8 h-8 mb-3 text-emerald-600" />
                    <h4 className="font-bold text-lg text-dark">Eco Friendly</h4>
                    <p className="text-gray-500 text-sm">
                      Zero waste, sustainable inks
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white aspect-square flex flex-col justify-end">
                    <Award className="w-8 h-8 mb-3 opacity-80" />
                    <h4 className="font-bold text-lg">Top Rated</h4>
                    <p className="text-amber-100 text-sm">
                      Loved by 50k+ customers
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 text-lg">
              Every decision we make is guided by these principles.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                variants={fadeUp}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div
                  className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <value.icon className={`w-7 h-7 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-4">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark mb-4">
              How We Got Here
            </h2>
            <p className="text-gray-600 text-lg">
              From idea to a global community of creators and fashion lovers.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-emerald-200 md:-translate-x-px" />

            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                  i % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse md:text-right"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 mt-2 ring-4 ring-indigo-100 z-10" />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 ${
                    i % 2 === 0
                      ? "md:w-1/2 md:pr-12"
                      : "md:w-1/2 md:pl-12"
                  }`}
                >
                  <span className="inline-block py-0.5 px-2.5 rounded-full bg-indigo-100 text-primary text-xs font-bold mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-2xl" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative z-10 max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Ready to join the revolution?
              </h2>
              <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
                Whether you're here to shop one-of-a-kind tees or create your
                own designs and earn, we'd love to have you in our community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
                >
                  Start Creating
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA strip */}
      <section className="py-16 bg-dark text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
            Have questions?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            We'd love to hear from you. Reach out at{" "}
            <a
              href="mailto:hello@teestore.ai"
              className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              hello@teestore.ai
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
