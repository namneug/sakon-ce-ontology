# API Routes สำหรับหมวดหมู่ผลิตภัณฑ์
from flask import Blueprint, jsonify
from sparql.fuseki_client import fuseki_client
from sparql.queries import GET_ALL_CATEGORIES, GET_PRODUCTS_BY_CATEGORY

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """ดึงรายการหมวดหมู่ทั้งหมดพร้อมจำนวนผลิตภัณฑ์"""
    result = fuseki_client.query(GET_ALL_CATEGORIES)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"พบหมวดหมู่ {result['count']} หมวด",
        'count': result['count'],
        'categories': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@categories_bp.route('/api/categories/<category_id>/products', methods=['GET'])
def get_category_products(category_id):
    """ดึงผลิตภัณฑ์ในหมวดหมู่ที่ระบุ"""
    result = fuseki_client.query(
        GET_PRODUCTS_BY_CATEGORY.format(category_id=category_id)
    )

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"ผลิตภัณฑ์ในหมวดหมู่ {category_id}: {result['count']} รายการ",
        'category_id': category_id,
        'count': result['count'],
        'products': result['results'],
        'response_time_ms': result['response_time_ms']
    })
