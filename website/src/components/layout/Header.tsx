'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Demo', href: '/demo' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <img 
              src="/images/logos/logo-black.svg" 
              alt="SenScript Logo" 
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200 dark:hidden"
            />
            <img 
              src="/images/logos/logo-white.svg" 
              alt="SenScript Logo" 
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200 hidden dark:block"
            />
            <span className="text-xl font-normal text-gray-900 dark:text-white">
              SenScript
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/demo"
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Try Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/demo"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-6 py-3 rounded-xl font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Try Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;