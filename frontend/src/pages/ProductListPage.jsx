import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getCategories } from '../services/api';

const certifications = ['อย.', 'มผช.', 'OTOP 5 ดาว', 'OTOP 4 ดาว', 'ฮาลาล', 'Organic Thailand'];
const sortOptions = [
  { value: 'name', label: 'ชื่อ ก-ฮ' },
  { value: 'price_asc', label: 'ราคาต่ำ - สูง' },
  { value: 'price_desc', label: 'ราคาสูง - ต่ำ' },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    getProducts(params)
      .then(res => {
        let items = res.data.products || [];
        // Client-side sort
        if (sortBy === 'price_asc') items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (sortBy === 'price_desc') items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        setProducts(items);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const activeFilterCount = [selectedCategory, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ผลิตภัณฑ์ทั้งหมด</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'กำลังโหลด...' : `พบ ${products.length} ผลิตภัณฑ์`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400">
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-outline flex items-center gap-1 text-sm py-2">
            <FunnelIcon className="w-4 h-4" />
            ตัวกรอง {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-40 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'} lg:block w-64 flex-shrink-0`}>
          <div className={`${showFilters ? 'absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto' : ''} lg:relative lg:w-auto lg:shadow-none`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-lg">ตัวกรอง</h3>
                <button onClick={() => setShowFilters(false)}><XMarkIcon className="w-6 h-6" /></button>
              </div>
            )}

            <div className="card p-5 space-y-6 lg:block">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">ตัวกรอง</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">ล้างทั้งหมด</button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">หมวดหมู่</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-600">ทั้งหมด</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.category} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="category" checked={selectedCategory === cat.category}
                        onChange={() => setSelectedCategory(cat.category)}
                        className="text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-600">{cat.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">({cat.productCount})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">ช่วงราคา (บาท)</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="ต่ำสุด" value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                  <span className="text-gray-400 self-center">-</span>
                  <input type="number" placeholder="สูงสุด" value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">📭</span>
              <h3 className="text-lg font-medium text-gray-700">ไม่พบผลิตภัณฑ์ที่ตรงกับเงื่อนไข</h3>
              <p className="text-gray-500 text-sm mt-1">ลองเปลี่ยนตัวกรองหรือล้างเงื่อนไข</p>
              <button onClick={clearFilters} className="btn-primary mt-4">ล้างตัวกรอง</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {products.map((p, i) => (
                <ProductCard key={p.product || i} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
