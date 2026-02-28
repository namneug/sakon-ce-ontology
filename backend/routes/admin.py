# Routes สำหรับ Admin Panel - จัดการผลิตภัณฑ์และวิสาหกิจชุมชน
import uuid
import functools
from flask import Blueprint, request, jsonify
from config import ADMIN_USERNAME, ADMIN_PASSWORD, SCE_NAMESPACE
from sparql.fuseki_client import fuseki_client
from sparql.queries import (
    GET_ALL_PRODUCTS, GET_ALL_ENTERPRISES,
    build_insert_product, DELETE_PRODUCT, DELETE_PRODUCT_REVERSE,
    build_insert_enterprise, DELETE_ENTERPRISE,
)

admin_bp = Blueprint('admin', __name__)

# In-memory token store
_admin_tokens = set()


def require_admin(f):
    """Decorator ตรวจสอบ Bearer token"""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'ต้องเข้าสู่ระบบก่อน'}), 401
        token = auth.split(' ', 1)[1]
        if token not in _admin_tokens:
            return jsonify({'error': 'Token ไม่ถูกต้องหรือหมดอายุ'}), 401
        return f(*args, **kwargs)
    return decorated


# === Authentication ===

@admin_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    """เข้าสู่ระบบ Admin"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    username = data.get('username', '')
    password = data.get('password', '')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        token = uuid.uuid4().hex
        _admin_tokens.add(token)
        return jsonify({'message': 'เข้าสู่ระบบสำเร็จ', 'token': token})
    else:
        return jsonify({'error': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'}), 401


@admin_bp.route('/api/admin/logout', methods=['POST'])
@require_admin
def admin_logout():
    """ออกจากระบบ Admin"""
    token = request.headers.get('Authorization', '').split(' ', 1)[1]
    _admin_tokens.discard(token)
    return jsonify({'message': 'ออกจากระบบสำเร็จ'})


# === Product CRUD ===

@admin_bp.route('/api/admin/products', methods=['GET'])
@require_admin
def list_products():
    """ดึงรายการผลิตภัณฑ์ทั้งหมด"""
    result = fuseki_client.query(GET_ALL_PRODUCTS)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Query failed')}), 500
    return jsonify({'products': result['results'], 'count': result['count']})


@admin_bp.route('/api/admin/products', methods=['POST'])
@require_admin
def create_product():
    """เพิ่มผลิตภัณฑ์ใหม่"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    product_id = data.get('id', f"Product_{uuid.uuid4().hex[:8]}")
    name = data.get('name', '')
    price = data.get('price', 0)

    if not name or not price:
        return jsonify({'error': 'กรุณาระบุชื่อและราคา'}), 400

    query = build_insert_product(
        product_id=product_id,
        name=name,
        price=price,
        description=data.get('description', ''),
        weight=data.get('weight', ''),
        shelf_life=data.get('shelfLife', ''),
        category_id=data.get('categoryId', ''),
        enterprise_id=data.get('enterpriseId', ''),
        image_url=data.get('imageUrl', ''),
    )
    result = fuseki_client.update(query)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Insert failed')}), 500

    return jsonify({'message': 'เพิ่มผลิตภัณฑ์สำเร็จ', 'productId': product_id}), 201


@admin_bp.route('/api/admin/products/<product_id>', methods=['PUT'])
@require_admin
def update_product(product_id):
    """แก้ไขผลิตภัณฑ์ (DELETE old + INSERT new)"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    # ลบ triples เดิม
    del_query = DELETE_PRODUCT.format(product_id=product_id)
    del_rev = DELETE_PRODUCT_REVERSE.format(product_id=product_id)
    fuseki_client.update(del_query)
    fuseki_client.update(del_rev)

    # Insert ใหม่
    query = build_insert_product(
        product_id=product_id,
        name=data.get('name', ''),
        price=data.get('price', 0),
        description=data.get('description', ''),
        weight=data.get('weight', ''),
        shelf_life=data.get('shelfLife', ''),
        category_id=data.get('categoryId', ''),
        enterprise_id=data.get('enterpriseId', ''),
        image_url=data.get('imageUrl', ''),
    )
    result = fuseki_client.update(query)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Update failed')}), 500

    return jsonify({'message': 'แก้ไขผลิตภัณฑ์สำเร็จ'})


@admin_bp.route('/api/admin/products/<product_id>', methods=['DELETE'])
@require_admin
def delete_product(product_id):
    """ลบผลิตภัณฑ์"""
    del_query = DELETE_PRODUCT.format(product_id=product_id)
    del_rev = DELETE_PRODUCT_REVERSE.format(product_id=product_id)
    r1 = fuseki_client.update(del_query)
    r2 = fuseki_client.update(del_rev)
    if not r1['success'] or not r2['success']:
        return jsonify({'error': 'ลบไม่สำเร็จ'}), 500
    return jsonify({'message': 'ลบผลิตภัณฑ์สำเร็จ'})


# === Enterprise CRUD ===

@admin_bp.route('/api/admin/enterprises', methods=['GET'])
@require_admin
def list_enterprises():
    """ดึงรายการวิสาหกิจทั้งหมด"""
    result = fuseki_client.query(GET_ALL_ENTERPRISES)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Query failed')}), 500
    return jsonify({'enterprises': result['results'], 'count': result['count']})


@admin_bp.route('/api/admin/enterprises', methods=['POST'])
@require_admin
def create_enterprise():
    """เพิ่มวิสาหกิจใหม่"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    enterprise_id = data.get('id', f"Enterprise_{uuid.uuid4().hex[:8]}")
    name = data.get('name', '')

    if not name:
        return jsonify({'error': 'กรุณาระบุชื่อวิสาหกิจ'}), 400

    query = build_insert_enterprise(
        enterprise_id=enterprise_id,
        name=name,
        description=data.get('description', ''),
    )
    result = fuseki_client.update(query)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Insert failed')}), 500

    return jsonify({'message': 'เพิ่มวิสาหกิจสำเร็จ', 'enterpriseId': enterprise_id}), 201


@admin_bp.route('/api/admin/enterprises/<enterprise_id>', methods=['PUT'])
@require_admin
def update_enterprise(enterprise_id):
    """แก้ไขวิสาหกิจ"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'ไม่มีข้อมูล'}), 400

    # ลบเก่า
    del_query = DELETE_ENTERPRISE.format(enterprise_id=enterprise_id)
    fuseki_client.update(del_query)

    # Insert ใหม่
    query = build_insert_enterprise(
        enterprise_id=enterprise_id,
        name=data.get('name', ''),
        description=data.get('description', ''),
    )
    result = fuseki_client.update(query)
    if not result['success']:
        return jsonify({'error': result.get('error', 'Update failed')}), 500

    return jsonify({'message': 'แก้ไขวิสาหกิจสำเร็จ'})


@admin_bp.route('/api/admin/enterprises/<enterprise_id>', methods=['DELETE'])
@require_admin
def delete_enterprise(enterprise_id):
    """ลบวิสาหกิจ"""
    del_query = DELETE_ENTERPRISE.format(enterprise_id=enterprise_id)
    result = fuseki_client.update(del_query)
    if not result['success']:
        return jsonify({'error': 'ลบไม่สำเร็จ'}), 500
    return jsonify({'message': 'ลบวิสาหกิจสำเร็จ'})
