import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ClockIcon, CodeBracketIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { searchProducts, semanticSearch } from '../services/api';

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const initialMode = searchParams.get('mode') || 'semantic';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [showSparql, setShowSparql] = useState(false);
  const [query, setQuery] = useState(q);

  const doSearch = (searchQuery, searchMode) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const fn = searchMode === 'semantic' ? semanticSearch : searchProducts;
    fn(searchQuery)
      .then(res => {
        const data = res.data;
        setResponseData(data);
        setResults(data.products || data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setResponseData(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (q) {
      setQuery(q);
      doSearch(q, mode);
    }
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query, mode);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    if (query.trim()) doSearch(query, newMode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ผลการค้นหา</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent focus-within:border-primary-400 h-12">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์คำค้นหา..."
            className="flex-1 h-full px-4 focus:outline-none text-gray-800" />
          <button type="submit" className="h-full bg-primary-800 text-white hover:bg-primary-700 px-6 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="hidden sm:inline">ค้นหา</span>
          </button>
        </div>
      </form>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button onClick={() => toggleMode('basic')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'basic' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            ค้นหาพื้นฐาน
          </button>
          <button onClick={() => toggleMode('semantic')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'semantic' ? 'bg-primary-800 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            ค้นหาเชิงความหมาย
          </button>
        </div>
      </div>

      {/* Result Info */}
      {responseData && !loading && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-700">
              <strong className="text-primary-800">{responseData.count || results.length}</strong> ผลลัพธ์
              {q && <span> สำหรับ &quot;<span className="font-medium">{q}</span>&quot;</span>}
            </span>

            {responseData.search_type && (
              <span className="badge-primary">
                {responseData.search_type === 'semantic' ? 'เชิงความหมาย' :
                 responseData.search_type === 'basic' ? 'พื้นฐาน' :
                 responseData.search_type === 'fallback_text' ? 'ค้นหาข้อความ' : responseData.search_type}
              </span>
            )}

            {responseData.intent_description && (
              <span className="badge-accent">{responseData.intent_description}</span>
            )}

            {responseData.response_time_ms && (
              <span className="text-gray-500 flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {responseData.response_time_ms.toFixed(1)} ms
              </span>
            )}

            <button onClick={() => setShowSparql(!showSparql)}
              className="text-gray-500 hover:text-primary-800 flex items-center gap-1 ml-auto">
              <CodeBracketIcon className="w-4 h-4" />
              {showSparql ? 'ซ่อน SPARQL' : 'แสดง SPARQL'}
            </button>
          </div>

          {showSparql && responseData.sparql_query && (
            <pre className="mt-3 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto">
              {responseData.sparql_query}
            </pre>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="กำลังค้นหา..." />
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🔍</span>
          <h3 className="text-lg font-medium text-gray-700">ไม่พบผลลัพธ์</h3>
          <p className="text-gray-500 text-sm mt-1">
            ลองเปลี่ยนคำค้นหาหรือใช้โหมดค้นหาเชิงความหมาย
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['อาหารเพื่อสุขภาพ', 'ของฝาก', 'ข้าวอินทรีย์', 'ขนม'].map(s => (
              <button key={s} onClick={() => { setQuery(s); doSearch(s, 'semantic'); }}
                className="text-sm bg-white text-gray-600 px-3 py-1 rounded-full border hover:border-primary-400">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p, i) => (
            <ProductCard key={p.product || p.productName || i}
              product={{
                product: p.product || '',
                name: p.name || p.productName || '',
                price: p.price || '',
                categoryName: p.categoryName || '',
                enterpriseName: p.enterpriseName || '',
              }}
              index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
