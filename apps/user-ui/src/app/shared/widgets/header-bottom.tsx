'use client';
import React, { useEffect, useState } from 'react';
import { headerBottomNav } from '../../configs/constant';

const HeaderBottom = () => {
  const [isSticky, setIsSticky] = useState(false);

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
        isSticky ? 'fixed top-0 left-0 animate-fade-in-down drop-shadow-lg' : ''
      }`}
      style={{ minHeight: 48 }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-12">
        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-4 font-medium shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          All Departments
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <ul className="flex space-x-6">
          {headerBottomNav.map((item) => (
            <li key={item.name}>
              <a href={item.href} className="text-gray-700 hover:text-blue-600 font-medium transition text-base">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default HeaderBottom;

