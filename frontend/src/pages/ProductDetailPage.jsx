import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';
import { BuildingStorefrontIcon, ShieldCheckIcon, BeakerIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProductById, getSimilarProducts, API_BASE_URL } from '../services/api';

const tabs = [
  { id: 'ingredients', label: 'ส่วนประกอบ', icon: <BeakerIcon className="w-4 h-4" /> },
  { id: 'process', label: 'กระบวนการผลิต', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
  { id: 'certifications', label: 'การรับรอง', icon: <ShieldCheckIcon className="w-4 h-4" /> },
];

const categoryIcons = {
  'แปรรูปเนื้อสัตว์': '🍖', 'เครื่องดื่ม': '🥤', 'ขนม/ของว่าง': '🍪',
  'เครื่องปรุงรส': '🌶️', 'อาหารหมักดอง': '🫙', 'ผลิตภัณฑ์จากข้าว': '🌾',
  'ผลิตภัณฑ์สด': '🥬', 'เบเกอรี่': '🍞', 'ผลิตภัณฑ์จากผลไม้': '🍇',
  'อาหารแมลง': '🦗', 'เครื่องดื่มแอลกอฮอล์': '🍷',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductById(id)
      .then(res => {
        setProduct(res.data.product || res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('ไม่พบผลิตภัณฑ์นี้');
        setLoading(false);
      });

    getSimilarProducts(id)
      .then(res => setSimilar(res.data.recommendations || []))
      .catch(() => {});
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <span className="text-6xl block mb-4">😕</span>
      <h2 className="text-xl font-bold text-gray-700">{error}</h2>
      <Link to="/products" className="btn-primary mt-4 inline-block">กลับไปหน้ารายการ</Link>
    </div>
  );

  const p = product;
  const icon = categoryIcons[p.categoryName] || '📦';
  const price = parseFloat(p.price) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-800">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary-800">ผลิตภัณฑ์</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card overflow-hidden">
          {p.imageUrl ? (
            <div className="h-80 md:h-96 bg-white flex items-center justify-center">
              <img
                src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE_URL}${p.imageUrl}`}
                alt={p.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-80 md:h-96 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-8xl">{icon}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {p.categoryName && <span className="badge-primary mb-3">{p.categoryName}</span>}
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{p.name}</h1>
          <p className="text-3xl font-bold text-secondary-600 mt-3">
            ฿{price.toLocaleString('th-TH')}
          </p>

          {p.description && (
            <p className="text-gray-600 mt-4 leading-relaxed">{p.description}</p>
          )}

          {/* Enterprise Info */}
          {p.enterpriseName && (
            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-3">
                <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="text-sm text-gray-500">ผู้ผลิต</p>
                  <p className="font-semibold text-primary-800">{p.enterpriseName}</p>
                  {p.enterpriseDesc && <p className="text-xs text-gray-500 mt-0.5">{p.enterpriseDesc}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Shelf Life */}
          {p.shelfLife && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>อายุการเก็บรักษา:</strong> {p.shelfLife} วัน
            </div>
          )}
          {p.weight && (
            <div className="mt-1 text-sm text-gray-600">
              <strong>น้ำหนัก:</strong> {p.weight}
            </div>
          )}

          {/* Channels */}
          {p.channels && p.channels.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">ช่องทางจำหน่าย</p>
              <div className="flex flex-wrap gap-2">
                {p.channels.map((ch, i) => (
                  <span key={i} className="badge-accent">{ch.channelName}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10">
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-800 text-primary-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="card p-6 mt-4">
          {activeTab === 'ingredients' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">ส่วนประกอบ / วัตถุดิบ</h3>
              {p.ingredients && p.ingredients.length > 0 ? (
                <ul className="space-y-2">
                  {p.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary-600 mt-1">&#8226;</span>
                      <div>
                        <span className="font-medium text-gray-700">{ing.ingredientName}</span>
                        {ing.ingredientDesc && <p className="text-sm text-gray-500">{ing.ingredientDesc}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูลส่วนประกอบ</p>
              )}
            </div>
          )}

          {activeTab === 'process' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">กระบวนการผลิต</h3>
              {p.production_process && p.production_process.length > 0 ? (
                <div className="space-y-3">
                  {p.production_process.map((proc, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700">{proc.processName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{proc.processDesc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูลกระบวนการผลิต</p>
              )}
            </div>
          )}

          {activeTab === 'certifications' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">การรับรองมาตรฐาน</h3>
              {p.certifications && p.certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {p.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-green-800">{cert.certName}</span>
                        {cert.certDesc && <p className="text-xs text-green-600 mt-0.5">{cert.certDesc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">ไม่มีข้อมูลการรับรอง</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {p.reviews && p.reviews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">รีวิวจากผู้ซื้อ</h3>
          <div className="space-y-3">
            {p.reviews.map((rev, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <StarIcon key={si} className={`w-4 h-4 ${si < parseFloat(rev.rating) ? 'text-accent-500' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{rev.rating}/5</span>
                </div>
                <p className="text-sm text-gray-700">{rev.comment || rev.reviewComment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4">ผลิตภัณฑ์ที่คล้ายกัน</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.slice(0, 4).map((s, i) => (
              <ProductCard key={s.relatedProduct || i} product={{
                product: s.relatedProduct,
                name: s.relatedName,
                price: s.relatedPrice,
                categoryName: s.categoryName,
              }} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
