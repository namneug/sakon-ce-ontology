import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, MapPinIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import { getEnterprises } from '../services/api';

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getEnterprises()
      .then(res => {
        setEnterprises(res.data.enterprises || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter
    ? enterprises.filter(e => (e.districtName || '').includes(filter))
    : enterprises;

  const districts = [...new Set(enterprises.map(e => e.districtName).filter(Boolean))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">วิสาหกิจชุมชน</h1>
          <p className="text-sm text-gray-500 mt-1">รวม {enterprises.length} วิสาหกิจชุมชนในจังหวัดสกลนคร</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">ทุกอำเภอ</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🏘️</span>
          <h3 className="text-lg font-medium text-gray-700">ไม่พบวิสาหกิจชุมชน</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e, i) => (
            <Link key={e.enterprise || i} to={`/enterprises/${e.enterprise}`}
              className="card p-5 hover:shadow-xl transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                  <BuildingStorefrontIcon className="w-7 h-7 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-800 transition-colors">
                    {e.name}
                  </h3>
                  {(e.locationName || e.districtName) && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {e.locationName || e.districtName}
                    </p>
                  )}
                  {e.productCount && (
                    <span className="inline-block mt-2 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                      {e.productCount} ผลิตภัณฑ์
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
