import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const suggestions = [
  'อาหารเพื่อสุขภาพ',
  'ของฝากสกลนคร',
  'ผลิตภัณฑ์อินทรีย์',
  'ขนมราคาไม่เกิน 50 บาท',
  'สินค้า OTOP 5 ดาว',
  'อาหารจากแมลง',
  'น้ำพริก',
  'ข้าวอินทรีย์',
];

export default function SearchBar({ large = false, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState('semantic');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
    }
  };

  const handleSuggestion = (text) => {
    setQuery(text);
    navigate(`/search?q=${encodeURIComponent(text)}&mode=semantic`);
  };

  return (
    <div className={large ? 'max-w-2xl mx-auto' : ''}>
      <form onSubmit={handleSearch}>
        <div className={`flex items-center bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent focus-within:border-primary-400 ${large ? 'h-14' : 'h-12'}`}>
          {/* Mode Selector */}
          <select value={mode} onChange={(e) => setMode(e.target.value)}
            className={`h-full border-r border-gray-200 bg-gray-50 text-gray-700 font-medium cursor-pointer focus:outline-none ${large ? 'px-4 text-sm' : 'px-3 text-xs'}`}>
            <option value="semantic">เชิงความหมาย</option>
            <option value="basic">พื้นฐาน</option>
          </select>

          {/* Input */}
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'semantic' ? 'ค้นหาด้วยภาษาธรรมชาติ เช่น "อาหารเพื่อสุขภาพ"...' : 'พิมพ์คำค้นหา...'}
            className={`flex-1 h-full px-4 focus:outline-none text-gray-800 ${large ? 'text-lg' : 'text-sm'}`} />

          {/* Search Button */}
          <button type="submit"
            className={`h-full bg-primary-800 text-white hover:bg-primary-700 transition-colors flex items-center gap-2 ${large ? 'px-6' : 'px-4'}`}>
            <MagnifyingGlassIcon className={large ? 'w-6 h-6' : 'w-5 h-5'} />
            <span className={`font-medium ${large ? '' : 'hidden sm:inline'}`}>ค้นหา</span>
          </button>
        </div>
      </form>

      {/* Suggestions */}
      {large && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-500">ลองค้นหา:</span>
          {suggestions.map(s => (
            <button key={s} onClick={() => handleSuggestion(s)}
              className="text-sm bg-white/80 hover:bg-white text-gray-700 px-3 py-1 rounded-full border border-gray-200 hover:border-primary-400 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
