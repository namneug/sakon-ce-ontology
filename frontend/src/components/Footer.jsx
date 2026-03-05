import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { label: 'แปรรูปเนื้อสัตว์', id: 'ProcessedMeat' },
  { label: 'เครื่องดื่ม', id: 'Beverage' },
  { label: 'ขนม/ของว่าง', id: 'Snack' },
  { label: 'เครื่องปรุงรส', id: 'Seasoning' },
  { label: 'อาหารหมักดอง', id: 'FermentedFood' },
  { label: 'ผลิตภัณฑ์จากข้าว', id: 'RiceProduct' },
];

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>🌾</span> วิสาหกิจชุมชนสกลนคร
            </h3>
            <p className="text-primary-200 text-sm leading-relaxed">
              ระบบฐานข้อมูลออนโทโลยีผลิตภัณฑ์อาหารวิสาหกิจชุมชน
              จังหวัดสกลนคร
            </p>
            <p className="text-primary-200 text-sm leading-relaxed mt-2">
              <strong className="text-white">ผู้พัฒนา:</strong> อ.ปิยะ ปลื้ม
            </p>
            <p className="text-primary-200 text-sm leading-relaxed">
              สาขาวิชานวัตกรรมและคอมพิวเตอร์ศึกษา มหาวิทยาลัยราชภัฏสกลนคร
            </p>
            <p className="text-primary-200 text-sm leading-relaxed mt-2">
              <strong className="text-white">งานวิจัย:</strong> การพัฒนาระบบพาณิชย์อิเล็กทรอนิกส์เชิงความหมาย
              สำหรับผลิตภัณฑ์อาหารวิสาหกิจชุมชน จังหวัดสกลนคร
              โดยใช้ออนโทโลยี
            </p>
            <div className="mt-3">
              <Link to="/report-issue" className="text-accent-300 hover:text-white text-sm transition-colors underline">
                แจ้งปัญหาการใช้งาน
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-3">หมวดหมู่ผลิตภัณฑ์</h3>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.id}`}
                    className="text-primary-200 hover:text-white text-sm transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech */}
          <div>
            <h3 className="text-lg font-bold mb-3">เทคโนโลยี</h3>
            <ul className="text-primary-200 text-sm space-y-1">
              <li>OWL/RDF Ontology</li>
              <li>Apache Jena Fuseki (SPARQL)</li>
              <li>Python Flask API</li>
              <li>React + Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-6 text-center text-primary-300 text-sm">
          <p>พัฒนาด้วยเทคโนโลยี Semantic Web &amp; Ontology</p>
          <p className="mt-1">ข้อมูลจากวิสาหกิจชุมชน จังหวัดสกลนคร</p>
        </div>
      </div>
    </footer>
  );
}
