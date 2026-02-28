import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BuildingStorefrontIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getEnterpriseById } from '../services/api';

export default function EnterpriseDetailPage() {
  const { id } = useParams();
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getEnterpriseById(id)
      .then(res => {
        setEnterprise(res.data.enterprise || res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('ไม่พบข้อมูลวิสาหกิจชุมชนนี้');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <span className="text-6xl block mb-4">😕</span>
      <h2 className="text-xl font-bold text-gray-700">{error}</h2>
      <Link to="/enterprises" className="btn-primary mt-4 inline-block">กลับไปหน้ารายการ</Link>
    </div>
  );

  const e = enterprise;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-800">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <Link to="/enterprises" className="hover:text-primary-800">วิสาหกิจชุมชน</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{e.name}</span>
      </nav>

      {/* Header Card */}
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <BuildingStorefrontIcon className="w-10 h-10 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{e.name}</h1>
            {e.description && (
              <p className="text-gray-600 mt-2 leading-relaxed">{e.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {(e.locationName || e.districtName) && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 text-primary-600" />
                  {e.locationName}{e.districtName && `, ${e.districtName}`}
                </div>
              )}
              {e.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4 text-primary-600" />
                  {e.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      {e.products && e.products.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ผลิตภัณฑ์ ({e.products.length} รายการ)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {e.products.map((p, i) => (
              <ProductCard key={p.product || i} product={{
                product: p.product,
                name: p.productName,
                price: p.price,
                categoryName: p.categoryName,
              }} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
