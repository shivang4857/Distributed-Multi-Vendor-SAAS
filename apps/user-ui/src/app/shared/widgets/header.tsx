import React from 'react';
import Link from 'next/link';
import HeaderBottom from './header-bottom';
import { Roboto } from 'next/font/google';
import { Search, User2, Heart, ShoppingCart } from 'lucide-react';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700'] });

const Header = () => {
  return (
    <header className={`w-full bg-white shadow-sm border-b ${roboto.className}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors" aria-label="Go to homepage">
            Eshop
          </Link>
        </div>
        {/* Search */}
        <div className="flex-1 mx-8">
          <form className="flex">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors flex items-center justify-center" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
        {/* Profile, Wishlist, Cart */}
        <div className="flex items-center space-x-6">
          {/* Profile */}
          <Link href="/auth/login" className="flex items-center space-x-2 hover:text-blue-700 transition-colors" aria-label="Login or profile">
            <User2 className="w-6 h-6" />
            <span className="text-sm font-medium">Hello, Sign In</span>
          </Link>
          {/* Wishlist */}
          <Link href="/wishlist" className="relative hover:text-blue-700 transition-colors" aria-label="Wishlist">
            <Heart className="w-6 h-6" />
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5">0</span>
          </Link>
          {/* Cart */}
          <Link href="/cart" className="relative hover:text-blue-700 transition-colors" aria-label="Cart">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5">0</span>
          </Link>
        </div>
      </div>
      <HeaderBottom />
    </header>
  );
};

export default Header;
