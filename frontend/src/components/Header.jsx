import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'หน้าแรก' },
    { to: '/products', label: 'ผลิตภัณฑ์' },
    { to: '/enterprises', label: 'วิสาหกิจชุมชน' },
    { to: '/analytics', label: 'สถิติ' },
    { to: '/ontology', label: 'Ontology' },
    { to: '/about', label: 'เกี่ยวกับ' },
  ];

  return (
    <header className="bg-primary-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌾</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">วิสาหกิจชุมชนสกลนคร</h1>
              <p className="text-xs text-primary-200 leading-tight hidden sm:block">Ontology-based E-commerce</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาผลิตภัณฑ์..."
                className="w-48 lg:w-64 pl-3 pr-10 py-1.5 rounded-lg text-sm text-gray-800 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-400" />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-800">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-primary-700">
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-primary-700">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาผลิตภัณฑ์..."
                  className="w-full pl-3 pr-10 py-2 rounded-lg text-sm text-gray-800 bg-white/90 focus:outline-none" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
