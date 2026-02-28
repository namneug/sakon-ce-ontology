# API Routes สำหรับผลิตภัณฑ์อาหาร
from flask import Blueprint, request, jsonify
from sparql.fuseki_client import fuseki_client
from sparql.queries import (
    GET_ALL_PRODUCTS, GET_PRODUCT_BY_ID, GET_PRODUCT_INGREDIENTS,
    GET_PRODUCT_CERTIFICATIONS, GET_PRODUCT_CHANNELS, GET_PRODUCT_CUSTOMERS,
    GET_PRODUCT_REVIEWS, GET_PRODUCT_PROCESS, GET_PRODUCTS_BY_CATEGORY,
    GET_PRODUCTS_BY_PRICE_RANGE
)

products_bp = Blueprint('products', __name__)


@products_bp.route('/api/products', methods=['GET'])
def get_products():
    """ดึงรายการผลิตภัณฑ์ทั้งหมด"""
    # รองรับ query parameters
    category = request.args.get('category')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')

    if category:
        result = fuseki_client.query(
            GET_PRODUCTS_BY_CATEGORY.format(category_id=category)
        )
    elif min_price and max_price:
        result = fuseki_client.query(
            GET_PRODUCTS_BY_PRICE_RANGE.format(
                min_price=min_price, max_price=max_price
            )
        )
    else:
        result = fuseki_client.query(GET_ALL_PRODUCTS)

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"พบผลิตภัณฑ์ {result['count']} รายการ",
        'count': result['count'],
        'products': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@products_bp.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """ดึงรายละเอียดผลิตภัณฑ์ตาม ID"""
    # ข้อมูลพื้นฐาน
    basic = fuseki_client.query(
        GET_PRODUCT_BY_ID.format(product_id=product_id)
    )
    if not basic['success'] or basic['count'] == 0:
        return jsonify({'error': f'ไม่พบผลิตภัณฑ์: {product_id}'}), 404

    product = basic['results'][0]

    # ดึงข้อมูลเพิ่มเติม
    ingredients = fuseki_client.query(
        GET_PRODUCT_INGREDIENTS.format(product_id=product_id)
    )
    certifications = fuseki_client.query(
        GET_PRODUCT_CERTIFICATIONS.format(product_id=product_id)
    )
    channels = fuseki_client.query(
        GET_PRODUCT_CHANNELS.format(product_id=product_id)
    )
    customers = fuseki_client.query(
        GET_PRODUCT_CUSTOMERS.format(product_id=product_id)
    )
    reviews = fuseki_client.query(
        GET_PRODUCT_REVIEWS.format(product_id=product_id)
    )
    process = fuseki_client.query(
        GET_PRODUCT_PROCESS.format(product_id=product_id)
    )

    product['ingredients'] = ingredients.get('results', [])
    product['certifications'] = certifications.get('results', [])
    product['channels'] = channels.get('results', [])
    product['target_customers'] = customers.get('results', [])
    product['reviews'] = reviews.get('results', [])
    product['production_process'] = process.get('results', [])

    return jsonify({
        'message': f"ข้อมูลผลิตภัณฑ์: {product.get('name', product_id)}",
        'product': product,
        'response_time_ms': basic['response_time_ms']
    })
