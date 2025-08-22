'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // Check if user has a saved preference, otherwise use system
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(dark ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    applyTheme(newIsDark);
  };

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-6">
      <div className="navbar-glass px-6" style={{ height: '80px' }}>
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src={isDark ? "/logo-black.svg" : "/logo-white.svg"}
                alt="SenScript"
                width={40}
                height={40}
              />
            </div>
            <div>
              <div className="font-semibold text-xl">SenScript</div>
              <div className="text-xs opacity-70 -mt-1">Smart meeting companion</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`hover:text-orange-500 transition-colors ${
                pathname === '/' ? 'text-orange-500 font-medium' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/demo" 
              className={`hover:text-orange-500 transition-colors ${
                pathname === '/demo' ? 'text-orange-500 font-medium' : ''
              }`}
            >
              Demo
            </Link>
            <Link 
              href="/pricing" 
              className={`hover:text-orange-500 transition-colors ${
                pathname === '/pricing' ? 'text-orange-500 font-medium' : ''
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className={`hover:text-orange-500 transition-colors ${
                pathname === '/about' ? 'text-orange-500 font-medium' : ''
              }`}
            >
              About
            </Link>
          </div>

          {/* CTA Button & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                isDark ? 'hover:bg-black/10' : 'hover:bg-white/10'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {isDark ? 'wb_sunny' : 'nightlight_round'}
              </span>
            </button>
            {isSignedIn ? (
              <div className="w-10 h-10">
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                      userButtonBox: "w-10 h-10",
                      userButtonTrigger: "w-10 h-10"
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="btn h-10 px-6">
                  Start Free
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`hover:text-orange-500 transition-colors ${
                  pathname === '/' ? 'text-orange-500 font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/demo" 
                className={`hover:text-orange-500 transition-colors ${
                  pathname === '/demo' ? 'text-orange-500 font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
              <Link 
                href="/pricing" 
                className={`hover:text-orange-500 transition-colors ${
                  pathname === '/pricing' ? 'text-orange-500 font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className={`hover:text-orange-500 transition-colors ${
                  pathname === '/about' ? 'text-orange-500 font-medium' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-center space-x-2 p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-black/10' : 'hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined icon-md">
                    {isDark ? 'wb_sunny' : 'nightlight_round'}
                  </span>
                  <span>{isDark ? 'Light' : 'Dark'} mode</span>
                </button>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="btn text-center">
                      Start Free
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}