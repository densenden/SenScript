'use client';

import Link from 'next/link';
import { Github, Twitter, ExternalLink } from 'lucide-react';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/images/logos/logo-black.svg" 
                alt="SenScript Logo" 
                className="w-8 h-8 dark:hidden"
              />
              <img 
                src="/images/logos/logo-white.svg" 
                alt="SenScript Logo" 
                className="w-8 h-8 hidden dark:block"
              />
              <span className="text-xl font-normal text-gray-900 dark:text-white">
                SenScript
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-sm">
              Turn any conversation into instant study materials with AI-powered CheatCard generation.
            </p>
            <div className="flex space-x-4">
              <Link 
                href={FOOTER_LINKS.social.github}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link 
                href={`https://twitter.com/${FOOTER_LINKS.social.twitter.replace('@', '')}`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/demo" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Live Demo
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  About CheatCards
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 dark:text-gray-300">CheatCard Interview Mode</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-300">13 Language Support</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-300">Real-time Processing</span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-300">Universal Audio Capture</span>
              </li>
            </ul>
          </div>

          {/* Studio Sen */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Studio Sen</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={FOOTER_LINKS.company.linktree}
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center space-x-1"
                >
                  <span>Studio Sen</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link 
                  href={FOOTER_LINKS.company.development}
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center space-x-1"
                >
                  <span>Development Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} Studio Sen. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link 
                href={FOOTER_LINKS.legal.privacy}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href={FOOTER_LINKS.legal.terms}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href={FOOTER_LINKS.legal.imprint}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Imprint
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;