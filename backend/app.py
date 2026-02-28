# แอปหลัก Flask Backend API
# ระบบฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร
import json
import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from routes.products import products_bp
from routes.enterprises import enterprises_bp
from routes.search import search_bp
from routes.categories import categories_bp
from routes.analytics import analytics_bp
from routes.upload import upload_bp
from routes.admin import admin_bp
from sparql.fuseki_client import fuseki_client
from services.recommendation import recommendation_service

app = Flask(__name__)
CORS(app)


# === ลงทะเบียน Blueprints ===
app.register_blueprint(products_bp)
app.register_blueprint(enterprises_bp)
app.register_blueprint(search_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(admin_bp)


# === Routes หลัก ===

@app.route('/')
def index():
    """หน้าแรก - แสดงข้อมูล API"""
    return jsonify({
        'name': 'ระบบฐานข้อมูลออนโทโลยีผลิตภัณฑ์อาหารวิสาหกิจชุมชน จ.สกลนคร',
        'version': '1.0.0',
        'description': 'Ontology-based E-commerce API สำหรับผลิตภัณฑ์อาหารวิสาหกิจชุมชน จังหวัดสกลนคร',
        'endpoints': {
            'ผลิตภัณฑ์': {
                'GET /api/products': 'ดึงรายการผลิตภัณฑ์ทั้งหมด',
                'GET /api/products?category=<id>': 'กรองตามหมวดหมู่',
                'GET /api/products?min_price=<n>&max_price=<n>': 'กรองตามช่วงราคา',
                'GET /api/products/<id>': 'รายละเอียดผลิตภัณฑ์',
            },
            'วิสาหกิจชุมชน': {
                'GET /api/enterprises': 'ดึงรายการวิสาหกิจทั้งหมด',
                'GET /api/enterprises/<id>': 'รายละเอียดวิสาหกิจ',
            },
            'หมวดหมู่': {
                'GET /api/categories': 'ดึงรายการหมวดหมู่',
                'GET /api/categories/<id>/products': 'ผลิตภัณฑ์ในหมวดหมู่',
            },
            'ค้นหา': {
                'GET /api/search?q=<คำค้น>': 'ค้นหาพื้นฐาน',
                'GET /api/search/semantic?q=<คำค้น>': 'ค้นหาเชิงความหมาย',
                'GET /api/search/certification?q=<คำค้น>': 'ค้นหาตามมาตรฐาน',
            },
            'วิเคราะห์ข้อมูล': {
                'GET /api/analytics/overview': 'ภาพรวมระบบ',
                'GET /api/analytics/price-by-category': 'ราคาตามหมวดหมู่',
                'GET /api/analytics/channels': 'ช่องทางจำหน่าย',
                'GET /api/analytics/certifications': 'การรับรองมาตรฐาน',
                'GET /api/analytics/enterprise-products': 'ผลิตภัณฑ์ต่อวิสาหกิจ',
                'GET /api/analytics/customers': 'กลุ่มลูกค้า',
                'GET /api/analytics/top-rated': 'คะแนนรีวิวสูงสุด',
                'GET /api/analytics/shared-ingredients': 'วัตถุดิบร่วมกัน',
            },
            'แนะนำ': {
                'GET /api/recommendations/<product_id>/similar': 'ผลิตภัณฑ์คล้ายกัน',
            },
            'ระบบ': {
                'GET /api/health': 'ตรวจสอบสถานะระบบ',
            }
        }
    })


@app.route('/api/health')
def health_check():
    """ตรวจสอบสถานะระบบและการเชื่อมต่อ Fuseki"""
    fuseki_status = fuseki_client.check_connection()
    return jsonify({
        'status': 'ok' if fuseki_status['connected'] else 'error',
        'fuseki': fuseki_status
    })


@app.route('/api/recommendations/<product_id>/similar')
def get_similar(product_id):
    """แนะนำผลิตภัณฑ์คล้ายกัน"""
    result = recommendation_service.get_similar_products(product_id)
    if 'error' in result:
        return jsonify({'error': result['error']}), 500
    return jsonify(result)


# === Survey ===

SURVEY_FILE = os.path.join(os.path.dirname(__file__), '..', 'evaluation', 'results', 'survey_responses.json')

@app.route('/api/survey', methods=['POST'])
def submit_survey():
    """รับข้อมูลแบบสอบถาม"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    data['submitted_at'] = datetime.now().isoformat()

    # อ่านข้อมูลเก่า (ถ้ามี) แล้วเพิ่มข้อมูลใหม่
    os.makedirs(os.path.dirname(SURVEY_FILE), exist_ok=True)
    responses = []
    if os.path.exists(SURVEY_FILE):
        with open(SURVEY_FILE, 'r', encoding='utf-8') as f:
            responses = json.load(f)

    responses.append(data)

    with open(SURVEY_FILE, 'w', encoding='utf-8') as f:
        json.dump(responses, f, ensure_ascii=False, indent=2)

    return jsonify({
        'message': 'บันทึกแบบสอบถามเรียบร้อย',
        'total_responses': len(responses)
    })


@app.route('/api/survey/results', methods=['GET'])
def get_survey_results():
    """ดูผลสรุปแบบสอบถาม"""
    if not os.path.exists(SURVEY_FILE):
        return jsonify({'message': 'ยังไม่มีข้อมูลแบบสอบถาม', 'total': 0, 'results': []})

    with open(SURVEY_FILE, 'r', encoding='utf-8') as f:
        responses = json.load(f)

    return jsonify({
        'message': f'มีผู้ตอบแบบสอบถาม {len(responses)} คน',
        'total': len(responses),
        'results': responses
    })


# === Error Handlers ===

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'ไม่พบหน้าที่ต้องการ'}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'เกิดข้อผิดพลาดภายในระบบ'}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("ระบบ API ผลิตภัณฑ์อาหารวิสาหกิจชุมชน จ.สกลนคร")
    print(f"เริ่มต้นที่ http://{FLASK_HOST}:{FLASK_PORT}")
    print("=" * 50)
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
