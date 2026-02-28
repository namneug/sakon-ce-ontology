import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, CubeIcon, TagIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getEnterprises, getAnalyticsOverview } from '../services/api';

const categoryCards = [
  { id: 'ProcessedMeat', label: 'แปรรูปเนื้อสัตว์', icon: '🍖', color: 'from-rose-100 to-rose-200' },
  { id: 'Beverage', label: 'เครื่องดื่ม', icon: '🥤', color: 'from-sky-100 to-sky-200' },
  { id: 'Snack', label: 'ขนม/ของว่าง', icon: '🍪', color: 'from-amber-100 to-amber-200' },
  { id: 'FermentedFood', label: 'อาหารหมักดอง', icon: '🫙', color: 'from-purple-100 to-purple-200' },
  { id: 'Seasoning', label: 'เครื่องปรุงรส', icon: '🌶️', color: 'from-red-100 to-red-200' },
  { id: 'RiceProduct', label: 'ผลิตภัณฑ์จากข้าว', icon: '🌾', color: 'from-emerald-100 to-emerald-200' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts().catch(() => ({ data: { products: [] } })),
      getEnterprises().catch(() => ({ data: { enterprises: [] } })),
      getAnalyticsOverview().catch(() => ({ data: { overview: {} } })),
    ]).then(([prodRes, entRes, statsRes]) => {
      setProducts(prodRes.data.products || []);
      setEnterprises(entRes.data.enterprises || []);
      setStats(statsRes.data.overview || {});
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            ตลาดออนไลน์วิสาหกิจชุมชน
          </h1>
          <h2 className="text-xl md:text-2xl text-primary-200 mb-2">จังหวัดสกลนคร</h2>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            ค้นหาผลิตภัณฑ์อาหารจากวิสาหกิจชุมชนด้วยเทคโนโลยี Semantic Web
            รองรับการค้นหาเชิงความหมายภาษาไทย
          </p>
          <SearchBar large />
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <CubeIcon className="w-8 h-8" />, value: stats.product_count || 0, label: 'ผลิตภัณฑ์' },
              { icon: <BuildingStorefrontIcon className="w-8 h-8" />, value: stats.enterprise_count || 0, label: 'วิสาหกิจชุมชน' },
              { icon: <TagIcon className="w-8 h-8" />, value: stats.category_count || 0, label: 'หมวดหมู่' },
              { icon: <ChartBarIcon className="w-8 h-8" />, value: stats.triple_count?.toLocaleString() || 0, label: 'RDF Triples' },
            ].map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <div className="text-primary-600 flex justify-center mb-2">{s.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-800">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">หมวดหมู่ผลิตภัณฑ์</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCards.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`}
              className={`card p-4 text-center bg-gradient-to-br ${cat.color} hover:scale-105 transition-transform`}>
              <span className="text-4xl block mb-2">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">ผลิตภัณฑ์แนะนำ</h2>
          <Link to="/products" className="text-primary-800 hover:text-primary-600 font-medium text-sm">
            ดูทั้งหมด &rarr;
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.product || i} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Enterprises */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">วิสาหกิจชุมชนเด่น</h2>
          <Link to="/enterprises" className="text-primary-800 hover:text-primary-600 font-medium text-sm">
            ดูทั้งหมด &rarr;
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enterprises.slice(0, 6).map((e, i) => (
              <Link key={e.enterprise || i} to={`/enterprises/${e.enterprise}`}
                className="card p-5 hover:border-primary-400 border-2 border-transparent transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{e.name}</h3>
                    {e.locationName && <p className="text-sm text-gray-500">{e.locationName}</p>}
                    {e.productCount && (
                      <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {e.productCount} ผลิตภัณฑ์
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
