# API Routes สำหรับวิสาหกิจชุมชน
from flask import Blueprint, jsonify
from sparql.fuseki_client import fuseki_client
from sparql.queries import (
    GET_ALL_ENTERPRISES, GET_ENTERPRISE_BY_ID, GET_ENTERPRISE_PRODUCTS
)

enterprises_bp = Blueprint('enterprises', __name__)


@enterprises_bp.route('/api/enterprises', methods=['GET'])
def get_enterprises():
    """ดึงรายการวิสาหกิจชุมชนทั้งหมด"""
    result = fuseki_client.query(GET_ALL_ENTERPRISES)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"พบวิสาหกิจชุมชน {result['count']} แห่ง",
        'count': result['count'],
        'enterprises': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@enterprises_bp.route('/api/enterprises/<enterprise_id>', methods=['GET'])
def get_enterprise(enterprise_id):
    """ดึงรายละเอียดวิสาหกิจชุมชนตาม ID"""
    # ข้อมูลพื้นฐาน
    basic = fuseki_client.query(
        GET_ENTERPRISE_BY_ID.format(enterprise_id=enterprise_id)
    )
    if not basic['success'] or basic['count'] == 0:
        return jsonify({'error': f'ไม่พบวิสาหกิจชุมชน: {enterprise_id}'}), 404

    enterprise = basic['results'][0]

    # ดึงรายการผลิตภัณฑ์
    products = fuseki_client.query(
        GET_ENTERPRISE_PRODUCTS.format(enterprise_id=enterprise_id)
    )
    enterprise['products'] = products.get('results', [])

    return jsonify({
        'message': f"ข้อมูลวิสาหกิจ: {enterprise.get('name', enterprise_id)}",
        'enterprise': enterprise,
        'response_time_ms': basic['response_time_ms']
    })
