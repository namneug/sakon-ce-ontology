import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, CubeIcon, TagIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProducts, getEnterprises, getAnalyticsOverview } from '../services/api';

function AnimatedCounter({ end, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const target = typeof end === 'string' ? parseInt(end.replace(/,/g, ''), 10) : end;
    if (!target || started.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const categoryCards = [
  { id: 'ProcessedMeat', label: 'แปรรูปเนื้อสัตว์', icon: '🍖', bg: 'from-emerald-100 to-green-200 hover:from-emerald-200 hover:to-green-300', delay: 0 },
  { id: 'Beverage', label: 'เครื่องดื่ม', icon: '🥤', bg: 'from-teal-100 to-emerald-200 hover:from-teal-200 hover:to-emerald-300', delay: 1 },
  { id: 'Snack', label: 'ขนม/ของว่าง', icon: '🍪', bg: 'from-green-100 to-teal-200 hover:from-green-200 hover:to-teal-300', delay: 2 },
  { id: 'FermentedFood', label: 'อาหารหมักดอง', icon: '🫙', bg: 'from-lime-100 to-green-200 hover:from-lime-200 hover:to-green-300', delay: 3 },
  { id: 'Seasoning', label: 'เครื่องปรุงรส', icon: '🌶️', bg: 'from-emerald-100 to-lime-200 hover:from-emerald-200 hover:to-lime-300', delay: 4 },
  { id: 'RiceProduct', label: 'ผลิตภัณฑ์จากข้าว', icon: '🌾', bg: 'from-green-100 to-emerald-200 hover:from-green-200 hover:to-emerald-300', delay: 5 },
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
      <section className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/dmsngm0pd/image/upload/hero-bg_opzmnw')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}>
        {/* Dark green overlay */}
        <div className="absolute inset-0 bg-primary-900/60"></div>
        {/* Shimmer light sweep */}
        <div className="hero-shimmer"></div>
        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-28 md:pt-24 md:pb-36 text-center">
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
        <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <CubeIcon className="w-10 h-10" />, value: stats.product_count || 0, label: 'ผลิตภัณฑ์', desc: `จาก ${stats.enterprise_count || 0} วิสาหกิจชุมชน`, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { icon: <BuildingStorefrontIcon className="w-10 h-10" />, value: stats.enterprise_count || 0, label: 'วิสาหกิจชุมชน', desc: 'ในจังหวัดสกลนคร', gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
              { icon: <TagIcon className="w-10 h-10" />, value: stats.category_count || 0, label: 'หมวดหมู่', desc: 'ประเภทผลิตภัณฑ์อาหาร', gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
              { icon: <ChartBarIcon className="w-10 h-10" />, value: stats.triple_count || 0, label: 'RDF Triples', desc: 'ข้อมูลในฐานความรู้', gradient: 'from-purple-500 to-pink-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="stat-card bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-default">
                <div className={`w-16 h-16 ${s.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-3 ${s.iconColor}`}>
                  {s.icon}
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-1">
                  <AnimatedCounter end={s.value} />
                </div>
                <div className={`text-sm font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>{s.label}</div>
                <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
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
              className={`rounded-2xl p-5 text-center bg-gradient-to-br ${cat.bg} border border-green-200/50 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300`}>
              <span className="text-5xl block mb-3 category-icon" style={{ animationDelay: `${cat.delay * 0.3}s` }}>{cat.icon}</span>
              <span className="text-sm font-semibold text-primary-800">{cat.label}</span>
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
