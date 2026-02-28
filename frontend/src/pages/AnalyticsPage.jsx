import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnalyticsOverview, getPriceByCategory, getChannels, getCertifications, getTopRated } from '../services/api';

const COLORS = ['#065F46', '#EA580C', '#D97706', '#059669', '#7C3AED', '#DC2626', '#0284C7', '#DB2777', '#65A30D', '#0891B2', '#4F46E5'];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [certData, setCertData] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyticsOverview().catch(() => ({ data: {} })),
      getPriceByCategory().catch(() => ({ data: { data: [] } })),
      getChannels().catch(() => ({ data: { data: [] } })),
      getCertifications().catch(() => ({ data: { data: [] } })),
      getTopRated().catch(() => ({ data: { data: [] } })),
    ]).then(([ov, pr, ch, ce, tr]) => {
      setOverview(ov.data.overview || {});
      setPriceData((pr.data.data || []).map(d => ({
        name: d.categoryName,
        avgPrice: parseFloat(d.avgPrice) || 0,
        minPrice: parseFloat(d.minPrice) || 0,
        maxPrice: parseFloat(d.maxPrice) || 0,
        count: parseInt(d.count) || 0,
      })));
      setChannelData((ch.data.data || []).map(d => ({
        name: d.channelName,
        value: parseInt(d.productCount) || 0,
      })));
      setCertData((ce.data.data || []).map(d => ({
        name: d.certName || d.certification,
        value: parseInt(d.productCount || d.count) || 0,
      })));
      setTopRated(tr.data.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner text="กำลังโหลดข้อมูลสถิติ..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">สถิติภาพรวมระบบ</h1>
      <p className="text-gray-500 text-sm mb-8">แดชบอร์ดข้อมูลผลิตภัณฑ์อาหารวิสาหกิจชุมชน จ.สกลนคร</p>

      {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ผลิตภัณฑ์', value: overview.product_count, color: 'bg-primary-100 text-primary-800' },
            { label: 'วิสาหกิจชุมชน', value: overview.enterprise_count, color: 'bg-secondary-100 text-secondary-800' },
            { label: 'หมวดหมู่', value: overview.category_count, color: 'bg-accent-100 text-accent-800' },
            { label: 'RDF Triples', value: overview.triple_count?.toLocaleString(), color: 'bg-purple-100 text-purple-800' },
          ].map((s, i) => (
            <div key={i} className={`card p-5 text-center ${s.color}`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm mt-1 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price by Category */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">ราคาเฉลี่ยตามหมวดหมู่ (บาท)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v.toFixed(0)} บาท`]} />
              <Bar dataKey="avgPrice" fill="#065F46" radius={[0, 4, 4, 0]} name="ราคาเฉลี่ย" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Channel */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">ช่องทางจำหน่าย</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={channelData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8"
                dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {channelData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Certifications */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">การรับรองมาตรฐาน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={certData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#EA580C" radius={[4, 4, 0, 0]} name="จำนวนผลิตภัณฑ์" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Rated */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 mb-4">ผลิตภัณฑ์คะแนนรีวิวสูงสุด</h3>
          <div className="space-y-3">
            {topRated.slice(0, 8).map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-lg font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{p.productName}</p>
                  <p className="text-xs text-gray-500">{p.reviewCount} รีวิว</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-accent-500">★</span>
                    <span className="font-bold text-gray-800">{parseFloat(p.avgRating).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">฿{parseFloat(p.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
