'use client';
import React, { useEffect, useState } from 'react';
import { headerBottomNav } from '../../configs/constant';
import Link from 'next/link';
import { User2, ShoppingCart } from 'lucide-react';
import useUser from '../../hooks/useUser';

const HeaderBottom = () => {
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();
  const displayName = user?.name || user?.email?.split('@')[0];
  const greeting = isLoading ? 'Loading...' : displayName ? `Hi, ${displayName}` : 'Hello, Sign In';
  const profileHref = displayName ? '/profile' : '/login';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`w-full bg-white border-t border-b border-gray-200 shadow-sm z-40 transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 right-0 drop-shadow-lg' : ''
      }`}
      style={{ minHeight: 48 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Left: Departments + Nav */}
        <div className="flex items-center">
          <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-4 font-medium shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            All Departments
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <ul className="flex space-x-6">
            {headerBottomNav.map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="text-gray-700 hover:text-blue-600 font-medium transition text-base">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Profile + Cart (shown when sticky) */}
        { isSticky && (
          <div className="flex items-center space-x-6">
            <Link href={profileHref} className="flex items-center space-x-2 hover:text-blue-700 transition-colors" aria-label="Login or profile">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border border-gray-200">
                <User2 className="w-5 h-5 text-gray-700" />
              </span>
              <span className="text-sm font-medium text-gray-700">{greeting}</span>
            </Link>
            <Link href="/cart" className="relative hover:text-blue-700 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5">0</span>
            </Link>
          </div>
        ) }
      </div>
    </nav>
  );
};

export default HeaderBottom;
