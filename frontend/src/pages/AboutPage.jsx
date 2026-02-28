import React from 'react';

const techStack = [
  {
    layer: 'Ontology Layer',
    color: 'bg-blue-100 text-blue-800',
    items: ['OWL (Web Ontology Language)', 'RDF/Turtle', 'SPARQL Queries'],
  },
  {
    layer: 'Data Layer',
    color: 'bg-green-100 text-green-800',
    items: ['Apache Jena Fuseki', 'Triple Store (TDB2)', 'SPARQL Endpoint'],
  },
  {
    layer: 'Backend Layer',
    color: 'bg-orange-100 text-orange-800',
    items: ['Python 3.9 + Flask', 'SPARQLWrapper', 'Semantic Search Engine'],
  },
  {
    layer: 'Frontend Layer',
    color: 'bg-purple-100 text-purple-800',
    items: ['React 18', 'Tailwind CSS', 'Recharts', 'React Router'],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">เกี่ยวกับระบบ</h1>

      {/* Project Info */}
      <div className="card p-8 mb-8">
        <h2 className="text-xl font-bold text-primary-800 mb-4">
          ระบบฐานข้อมูลออนโทโลยีผลิตภัณฑ์อาหารวิสาหกิจชุมชน จังหวัดสกลนคร
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          ระบบนี้พัฒนาขึ้นเพื่อจัดเก็บและสืบค้นข้อมูลผลิตภัณฑ์อาหารจากวิสาหกิจชุมชนในจังหวัดสกลนคร
          โดยใช้เทคโนโลยี Semantic Web และ Ontology เป็นพื้นฐานในการจัดการข้อมูล
          ทำให้สามารถค้นหาข้อมูลเชิงความหมาย (Semantic Search) ได้อย่างมีประสิทธิภาพ
        </p>
        <p className="text-gray-600 leading-relaxed">
          ระบบรองรับการค้นหาด้วยภาษาธรรมชาติภาษาไทย เช่น "อาหารเพื่อสุขภาพ" "ของฝากสกลนคร"
          "ผลิตภัณฑ์อินทรีย์" โดยจะแปลงคำค้นหาเป็น SPARQL Query อัตโนมัติ
          เพื่อสืบค้นจากฐานข้อมูล Triple Store
        </p>
      </div>

      {/* Architecture */}
      <div className="card p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">สถาปัตยกรรมระบบ</h2>

        <div className="space-y-4">
          {techStack.map((layer, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-3 items-start">
              <div className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${layer.color}`}>
                {layer.layer}
              </div>
              <div className="flex flex-wrap gap-2">
                {layer.items.map((item, j) => (
                  <span key={j} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-4 text-center">แผนภาพสถาปัตยกรรม</h3>
          <div className="max-w-lg mx-auto space-y-3">
            <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 text-center">
              <div className="font-bold text-purple-800">Frontend (React)</div>
              <div className="text-xs text-purple-600">UI Components, Search, Analytics Dashboard</div>
            </div>
            <div className="text-center text-gray-400 text-2xl">&darr; REST API &darr;</div>
            <div className="bg-orange-100 border-2 border-orange-300 rounded-xl p-4 text-center">
              <div className="font-bold text-orange-800">Backend (Flask)</div>
              <div className="text-xs text-orange-600">Semantic Search, SPARQLWrapper, API Routes</div>
            </div>
            <div className="text-center text-gray-400 text-2xl">&darr; SPARQL &darr;</div>
            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 text-center">
              <div className="font-bold text-green-800">Triple Store (Fuseki)</div>
              <div className="text-xs text-green-600">SPARQL Endpoint, TDB2 Storage</div>
            </div>
            <div className="text-center text-gray-400 text-2xl">&darr; RDF &darr;</div>
            <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 text-center">
              <div className="font-bold text-blue-800">Ontology (OWL/RDF)</div>
              <div className="text-xs text-blue-600">sakon_ce_ontology.owl + sample_data.ttl</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="card p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลในระบบ</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'วิสาหกิจชุมชน', value: 24 },
            { label: 'ผลิตภัณฑ์อาหาร', value: 26 },
            { label: 'หมวดหมู่', value: 11 },
            { label: 'วัตถุดิบ', value: 65 },
            { label: 'การรับรอง', value: 9 },
            { label: 'ช่องทางจำหน่าย', value: 16 },
            { label: 'อำเภอ', value: 12 },
            { label: 'ตำบล', value: 23 },
            { label: 'RDF Triples', value: '1,674' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-800">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
