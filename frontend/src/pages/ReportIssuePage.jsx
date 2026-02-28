import React, { useState } from 'react';

const issueTypes = [
  'ข้อมูลผลิตภัณฑ์ไม่ถูกต้อง',
  'ระบบแสดงผลผิดพลาด',
  'ไม่สามารถค้นหาข้อมูลได้',
  'ข้อเสนอแนะการปรับปรุง',
  'อื่นๆ',
];

export default function ReportIssuePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: issueTypes[0],
    detail: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[แจ้งปัญหา] ${form.type}`);
    const body = encodeURIComponent(
      `ชื่อผู้แจ้ง: ${form.name}\nอีเมลติดต่อกลับ: ${form.email}\nประเภทปัญหา: ${form.type}\n\nรายละเอียด:\n${form.detail}`
    );
    window.location.href = `mailto:namneung@snru.ac.th?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">แจ้งปัญหาการใช้งาน</h1>
      <p className="text-gray-500 text-sm mb-6">
        กรุณากรอกข้อมูลด้านล่าง ระบบจะเปิดอีเมลให้ท่านส่งถึงผู้ดูแลระบบโดยอัตโนมัติ
      </p>

      {/* ข้อมูลผู้รับ */}
      <div className="bg-primary-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>ผู้รับ:</strong> อ.ปิยะนันท์ ปลื้มโชค
        </p>
        <p className="text-sm text-gray-500">
          สาขานวัตกรรมและคอมพิวเตอร์ศึกษา มหาวิทยาลัยราชภัฏสกลนคร
        </p>
        <p className="text-sm text-gray-500">
          อีเมล: namneung@snru.ac.th
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้แจ้ง</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="ระบุชื่อ-นามสกุล"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลติดต่อกลับ</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทปัญหา</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {issueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
          <textarea
            name="detail"
            required
            rows={5}
            value={form.detail}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y"
            placeholder="อธิบายปัญหาหรือข้อเสนอแนะที่ต้องการแจ้ง..."
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 text-center"
        >
          ส่งแจ้งปัญหาทางอีเมล
        </button>
      </form>
    </div>
  );
}
