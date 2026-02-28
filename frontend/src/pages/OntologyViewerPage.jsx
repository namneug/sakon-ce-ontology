import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const ontologyTree = [
  {
    name: 'owl:Thing',
    children: [
      {
        name: 'FoodProduct',
        label: 'ผลิตภัณฑ์อาหาร',
        instances: 26,
        children: [
          { name: 'ProcessedMeat', label: 'แปรรูปเนื้อสัตว์', instances: 5 },
          { name: 'Beverage', label: 'เครื่องดื่ม', instances: 2 },
          { name: 'AlcoholicBeverage', label: 'เครื่องดื่มแอลกอฮอล์', instances: 1 },
          { name: 'Snack', label: 'ขนม/ของว่าง', instances: 4 },
          { name: 'RiceProduct', label: 'ผลิตภัณฑ์จากข้าว', instances: 3 },
          { name: 'FermentedFood', label: 'อาหารหมักดอง', instances: 3 },
          { name: 'Seasoning', label: 'เครื่องปรุงรส', instances: 4 },
          { name: 'FreshProduce', label: 'ผลิตผลิตสด', instances: 1 },
          { name: 'Bakery', label: 'เบเกอรี่', instances: 1 },
          { name: 'FruitProduct', label: 'ผลิตภัณฑ์จากผลไม้', instances: 1 },
          { name: 'InsectFood', label: 'อาหารแมลง', instances: 1 },
        ],
      },
      { name: 'CommunityEnterprise', label: 'วิสาหกิจชุมชน', instances: 24 },
      { name: 'ProductCategory', label: 'หมวดหมู่ผลิตภัณฑ์', instances: 11 },
      { name: 'Ingredient', label: 'วัตถุดิบ', instances: 65 },
      { name: 'Certification', label: 'การรับรอง', instances: 9 },
      { name: 'DistributionChannel', label: 'ช่องทางจำหน่าย', instances: 16 },
      { name: 'TargetCustomer', label: 'กลุ่มลูกค้า', instances: 16 },
      {
        name: 'Location',
        label: 'สถานที่',
        children: [
          { name: 'Province', label: 'จังหวัด', instances: 1 },
          { name: 'District', label: 'อำเภอ', instances: 12 },
          { name: 'SubDistrict', label: 'ตำบล', instances: 23 },
        ],
      },
      { name: 'PackagingType', label: 'ประเภทบรรจุภัณฑ์', instances: 8 },
      { name: 'ProductionMethod', label: 'วิธีการผลิต', instances: 4 },
      { name: 'ProductionProcess', label: 'กระบวนการผลิต', instances: 26 },
      { name: 'Review', label: 'รีวิว', instances: 15 },
      { name: 'NutritionInfo', label: 'ข้อมูลโภชนาการ', instances: 4 },
      { name: 'Award', label: 'รางวัล', instances: 3 },
    ],
  },
];

const objectProperties = [
  { name: 'belongsToCategory', domain: 'FoodProduct', range: 'ProductCategory', label: 'จัดอยู่ในหมวดหมู่' },
  { name: 'producedBy', domain: 'FoodProduct', range: 'CommunityEnterprise', label: 'ผลิตโดย' },
  { name: 'hasProduct', domain: 'CommunityEnterprise', range: 'FoodProduct', label: 'มีผลิตภัณฑ์ (inverse of producedBy)' },
  { name: 'hasIngredient', domain: 'FoodProduct', range: 'Ingredient', label: 'มีส่วนประกอบ' },
  { name: 'hasCertification', domain: 'FoodProduct', range: 'Certification', label: 'ได้รับรอง' },
  { name: 'soldVia', domain: 'FoodProduct', range: 'DistributionChannel', label: 'จำหน่ายผ่าน' },
  { name: 'targetsCustomer', domain: 'FoodProduct', range: 'TargetCustomer', label: 'กลุ่มเป้าหมาย' },
  { name: 'locatedIn', domain: 'CommunityEnterprise', range: 'Location', label: 'ตั้งอยู่ใน' },
  { name: 'hasReview', domain: 'FoodProduct', range: 'Review', label: 'มีรีวิว' },
  { name: 'hasProductionProcess', domain: 'FoodProduct', range: 'ProductionProcess', label: 'มีกระบวนการผลิต' },
];

const datatypeProperties = [
  { name: 'hasName', domain: 'owl:Thing', range: 'xsd:string', label: 'ชื่อ' },
  { name: 'hasPrice', domain: 'FoodProduct', range: 'xsd:decimal', label: 'ราคา' },
  { name: 'hasDescription', domain: 'owl:Thing', range: 'xsd:string', label: 'คำอธิบาย' },
  { name: 'hasWeight', domain: 'FoodProduct', range: 'xsd:string', label: 'น้ำหนัก' },
  { name: 'hasShelfLifeDays', domain: 'FoodProduct', range: 'xsd:integer', label: 'อายุการเก็บรักษา (วัน)' },
  { name: 'hasRating', domain: 'Review', range: 'xsd:decimal', label: 'คะแนน' },
  { name: 'hasPhoneNumber', domain: 'ContactInfo', range: 'xsd:string', label: 'เบอร์โทร' },
];

const sampleTriples = [
  { s: 'sce:KhaoHang', p: 'rdf:type', o: 'sce:FoodProduct' },
  { s: 'sce:KhaoHang', p: 'sce:hasName', o: '"ข้าวฮาง"@th' },
  { s: 'sce:KhaoHang', p: 'sce:hasPrice', o: '"100.0"^^xsd:decimal' },
  { s: 'sce:KhaoHang', p: 'sce:belongsToCategory', o: 'sce:RiceProduct' },
  { s: 'sce:KhaoHang', p: 'sce:producedBy', o: 'sce:CE_12' },
  { s: 'sce:KhaoHang', p: 'sce:hasCertification', o: 'sce:OTOP_5Star' },
  { s: 'sce:CE_12', p: 'rdf:type', o: 'sce:CommunityEnterprise' },
  { s: 'sce:CE_12', p: 'sce:hasName', o: '"ข้าวฮางทิพย์"@th' },
  { s: 'sce:CE_12', p: 'sce:locatedIn', o: 'sce:NaKham' },
];

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-primary-50 ${depth === 0 ? 'font-bold' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}>
        {hasChildren ? (
          expanded ? <ChevronDownIcon className="w-4 h-4 text-gray-400" /> : <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        ) : <span className="w-4" />}
        <span className="text-blue-700 font-mono text-sm">{node.name}</span>
        {node.label && <span className="text-gray-500 text-xs ml-1">({node.label})</span>}
        {node.instances !== undefined && (
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-1.5 rounded">{node.instances}</span>
        )}
      </div>
      {expanded && hasChildren && node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function OntologyViewerPage() {
  const [activeSection, setActiveSection] = useState('classes');

  const sections = [
    { id: 'classes', label: 'Class Hierarchy' },
    { id: 'object', label: 'Object Properties' },
    { id: 'datatype', label: 'Datatype Properties' },
    { id: 'triples', label: 'ตัวอย่าง RDF Triples' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">โครงสร้าง Ontology</h1>
      <p className="text-gray-500 text-sm mb-6">แสดงโครงสร้างออนโทโลยีของระบบฐานข้อมูลผลิตภัณฑ์อาหารวิสาหกิจชุมชน</p>

      {/* What is Ontology */}
      <div className="card p-6 mb-8 bg-primary-50 border border-primary-200">
        <h3 className="font-bold text-primary-800 mb-2">Ontology คืออะไร?</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Ontology เป็นแบบจำลองความรู้ที่กำหนดโครงสร้างของข้อมูลในรูปแบบ Classes (คลาส), Properties (คุณสมบัติ)
          และ Instances (ตัวอย่างข้อมูล) ระบบนี้ใช้ภาษา OWL (Web Ontology Language) ในการกำหนดโครงสร้าง
          และจัดเก็บข้อมูลในรูปแบบ RDF Triples (Subject-Predicate-Object) โดยสามารถสืบค้นข้อมูลด้วยภาษา SPARQL
          ทำให้รองรับการค้นหาเชิงความหมาย (Semantic Search) ได้
        </p>
        <div className="mt-3 text-sm text-gray-600">
          <strong>Namespace:</strong> <code className="bg-white px-2 py-0.5 rounded text-xs">http://sakon-ce.example.org/ontology#</code>
          <span className="ml-3"><strong>Prefix:</strong> <code className="bg-white px-2 py-0.5 rounded text-xs">sce:</code></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? 'border-primary-800 text-primary-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card p-6">
        {activeSection === 'classes' && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Class Hierarchy (ลำดับชั้นคลาส)</h3>
            <div className="border rounded-lg p-3 bg-gray-50">
              {ontologyTree.map((node, i) => (
                <TreeNode key={i} node={node} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">ตัวเลขด้านขวาแสดงจำนวน instances ของแต่ละ class</p>
          </div>
        )}

        {activeSection === 'object' && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Object Properties (คุณสมบัติเชิงวัตถุ)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Property</th>
                    <th className="text-left p-3 font-medium">Domain</th>
                    <th className="text-left p-3 font-medium">Range</th>
                    <th className="text-left p-3 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody>
                  {objectProperties.map((prop, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-blue-700 text-xs">{prop.name}</td>
                      <td className="p-3 font-mono text-xs">{prop.domain}</td>
                      <td className="p-3 font-mono text-xs">{prop.range}</td>
                      <td className="p-3 text-gray-600">{prop.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'datatype' && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Datatype Properties (คุณสมบัติข้อมูล)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Property</th>
                    <th className="text-left p-3 font-medium">Domain</th>
                    <th className="text-left p-3 font-medium">Range</th>
                    <th className="text-left p-3 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody>
                  {datatypeProperties.map((prop, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-blue-700 text-xs">{prop.name}</td>
                      <td className="p-3 font-mono text-xs">{prop.domain}</td>
                      <td className="p-3 font-mono text-xs">{prop.range}</td>
                      <td className="p-3 text-gray-600">{prop.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'triples' && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">ตัวอย่าง RDF Triples</h3>
            <p className="text-sm text-gray-500 mb-4">ข้อมูลถูกจัดเก็บเป็น Triple (Subject - Predicate - Object)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Subject</th>
                    <th className="text-left p-3 font-medium">Predicate</th>
                    <th className="text-left p-3 font-medium">Object</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleTriples.map((t, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-blue-700 text-xs">{t.s}</td>
                      <td className="p-3 font-mono text-purple-700 text-xs">{t.p}</td>
                      <td className="p-3 font-mono text-green-700 text-xs">{t.o}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">SPARQL Query ตัวอย่าง:</p>
              <pre className="text-green-400 text-xs overflow-x-auto">{`SELECT ?product ?name ?price ?category
WHERE {
  ?product a sce:FoodProduct ;
           sce:hasName ?name ;
           sce:hasPrice ?price ;
           sce:belongsToCategory ?cat .
  ?cat sce:hasName ?category .
}
ORDER BY ?price
LIMIT 10`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
