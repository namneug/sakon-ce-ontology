import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/solid';

const categoryIcons = {
  'แปรรูปเนื้อสัตว์': '🍖',
  'เครื่องดื่ม': '🥤',
  'ขนม/ของว่าง': '🍪',
  'เครื่องปรุงรส': '🌶️',
  'อาหารหมักดอง': '🫙',
  'ผลิตภัณฑ์จากข้าว': '🌾',
  'ผลิตภัณฑ์สด': '🥬',
  'เบเกอรี่': '🍞',
  'ผลิตภัณฑ์จากผลไม้': '🍇',
  'อาหารแมลง': '🦗',
  'เครื่องดื่มแอลกอฮอล์': '🍷',
};

const placeholderColors = [
  'from-primary-100 to-primary-200',
  'from-secondary-100 to-secondary-200',
  'from-accent-100 to-accent-200',
  'from-emerald-100 to-emerald-200',
  'from-amber-100 to-amber-200',
  'from-rose-100 to-rose-200',
];

export default function ProductCard({ product, index = 0 }) {
  const id = product.product || product.id || '';
  const name = product.name || product.productName || '';
  const price = parseFloat(product.price) || 0;
  const category = product.categoryName || '';
  const enterprise = product.enterpriseName || '';
  const icon = categoryIcons[category] || '📦';
  const colorClass = placeholderColors[index % placeholderColors.length];

  return (
    <Link to={`/products/${id}`} className="card overflow-hidden group">
      {/* Placeholder Image */}
      <div className={`h-48 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
        <span className="text-6xl group-hover:scale-110 transition-transform">{icon}</span>
        {category && (
          <span className="absolute top-3 left-3 badge-primary text-xs">{category}</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-primary-800 transition-colors">
          {name}
        </h3>

        {enterprise && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{enterprise}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-secondary-600">
            ฿{price.toLocaleString('th-TH')}
          </span>
          <span className="text-xs text-primary-800 bg-primary-50 px-2 py-1 rounded-full font-medium">
            ดูรายละเอียด
          </span>
        </div>
      </div>
    </Link>
  );
}
