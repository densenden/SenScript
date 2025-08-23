'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Live Demo', href: '/demo' },
      { name: 'Card System', href: '/more-information#cheatcards-vs-flashcards' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Features', href: '/#features' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'More Information', href: '/more-information' },
      { name: 'Use Cases', href: '/use-cases' },
      { name: 'Roadmap', href: '/roadmap' },
      { name: 'Changelog', href: '/changelog' },
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Sen Dev', href: 'https://dev.sen.studio' },
      { name: 'Studio Sen', href: 'https://sen.studio' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: 'https://sen.studio/legal/privacy.html' },
      { name: 'Terms of Service', href: 'https://sen.studio/legal/terms.html' },
      { name: 'Imprint', href: 'https://sen.studio/legal/imprint.html' },
      { name: 'GDPR', href: 'https://sen.studio/gdpr' },
    ]
  }
];

export default function Footer() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check theme on mount and listen for changes
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="glass p-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Image
                  src={isDark ? "/logo-black.svg" : "/logo-white.svg"}
                  alt="SenScript"
                  width={24}
                  height={24}
                />
                <span className="font-semibold text-lg">SenScript</span>
              </Link>
              <p className="text-sm opacity-80">
                Smart meeting companion
              </p>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-sm opacity-80 hover:opacity-100 hover:text-orange-500 transition-colors"
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="text-sm opacity-80">
                © 2025 Studio Sen. All rights reserved.
              </div>

              {/* Legal Links */}
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <Link 
                  href="https://sen.studio/legal/privacy.html"
                  className="hover:opacity-100 hover:text-orange-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy
                </Link>
                <span>•</span>
                <Link 
                  href="https://sen.studio/legal/terms.html"
                  className="hover:opacity-100 hover:text-orange-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms
                </Link>
                <span>•</span>
                <Link 
                  href="https://sen.studio/gdpr"
                  className="hover:opacity-100 hover:text-orange-500 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GDPR
                </Link>
                <span>•</span>
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}