# API Routes สำหรับวิเคราะห์ข้อมูล
from flask import Blueprint, jsonify
from sparql.fuseki_client import fuseki_client
from sparql.queries import (
    ANALYTICS_PRICE_BY_CATEGORY, ANALYTICS_CHANNELS,
    ANALYTICS_CERTIFICATIONS, ANALYTICS_ENTERPRISE_PRODUCTS,
    ANALYTICS_CUSTOMER_SEGMENTS, ANALYTICS_TOP_RATED,
    SEMANTIC_SHARED_INGREDIENTS
)

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/api/analytics/overview', methods=['GET'])
def get_overview():
    """ภาพรวมระบบ: จำนวน triples, ผลิตภัณฑ์, วิสาหกิจ"""
    triple_count = fuseki_client.count_triples()

    product_count = fuseki_client.query(
        "SELECT (COUNT(?p) AS ?count) WHERE { ?p a sce:FoodProduct }"
    )
    enterprise_count = fuseki_client.query(
        "SELECT (COUNT(?e) AS ?count) WHERE { ?e a sce:CommunityEnterprise }"
    )
    category_count = fuseki_client.query(
        "SELECT (COUNT(?c) AS ?count) WHERE { ?c a sce:ProductCategory }"
    )

    return jsonify({
        'message': 'ภาพรวมระบบฐานข้อมูลออนโทโลยี',
        'overview': {
            'triple_count': triple_count,
            'product_count': int(product_count['results'][0]['count']) if product_count['success'] else 0,
            'enterprise_count': int(enterprise_count['results'][0]['count']) if enterprise_count['success'] else 0,
            'category_count': int(category_count['results'][0]['count']) if category_count['success'] else 0,
        }
    })


@analytics_bp.route('/api/analytics/price-by-category', methods=['GET'])
def price_by_category():
    """วิเคราะห์ราคาตามหมวดหมู่"""
    result = fuseki_client.query(ANALYTICS_PRICE_BY_CATEGORY)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'วิเคราะห์ราคาตามหมวดหมู่',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/channels', methods=['GET'])
def channel_analysis():
    """วิเคราะห์ช่องทางจำหน่าย"""
    result = fuseki_client.query(ANALYTICS_CHANNELS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'วิเคราะห์ช่องทางจำหน่าย',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/certifications', methods=['GET'])
def certification_analysis():
    """วิเคราะห์การรับรองมาตรฐาน"""
    result = fuseki_client.query(ANALYTICS_CERTIFICATIONS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'วิเคราะห์การรับรองมาตรฐาน',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/enterprise-products', methods=['GET'])
def enterprise_product_analysis():
    """วิเคราะห์จำนวนผลิตภัณฑ์ต่อวิสาหกิจ"""
    result = fuseki_client.query(ANALYTICS_ENTERPRISE_PRODUCTS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'วิเคราะห์จำนวนผลิตภัณฑ์ต่อวิสาหกิจ',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/customers', methods=['GET'])
def customer_analysis():
    """วิเคราะห์กลุ่มลูกค้าเป้าหมาย"""
    result = fuseki_client.query(ANALYTICS_CUSTOMER_SEGMENTS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'วิเคราะห์กลุ่มลูกค้าเป้าหมาย',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/top-rated', methods=['GET'])
def top_rated_products():
    """ผลิตภัณฑ์ที่ได้คะแนนรีวิวสูงสุด"""
    result = fuseki_client.query(ANALYTICS_TOP_RATED)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'ผลิตภัณฑ์ที่ได้คะแนนรีวิวสูงสุด',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@analytics_bp.route('/api/analytics/shared-ingredients', methods=['GET'])
def shared_ingredients():
    """ผลิตภัณฑ์ที่มีวัตถุดิบร่วมกัน"""
    result = fuseki_client.query(SEMANTIC_SHARED_INGREDIENTS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': 'ผลิตภัณฑ์ที่มีวัตถุดิบร่วมกัน (>= 2 ชนิด)',
        'data': result['results'],
        'response_time_ms': result['response_time_ms']
    })
