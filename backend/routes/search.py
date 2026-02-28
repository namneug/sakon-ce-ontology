# API Routes สำหรับค้นหา (พื้นฐานและ Semantic)
from flask import Blueprint, request, jsonify
from sparql.fuseki_client import fuseki_client
from sparql.queries import SEARCH_PRODUCTS_BY_TEXT, SEARCH_BY_CERTIFICATION
from services.semantic_search import SemanticSearch

search_bp = Blueprint('search', __name__)
semantic_search = SemanticSearch()


@search_bp.route('/api/search', methods=['GET'])
def search_products():
    """ค้นหาผลิตภัณฑ์ด้วยคำค้น (พื้นฐาน)"""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'กรุณาระบุคำค้นหา (parameter: q)'}), 400

    result = fuseki_client.query(
        SEARCH_PRODUCTS_BY_TEXT.format(search_term=query)
    )

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"ผลการค้นหา '{query}': พบ {result['count']} รายการ",
        'query': query,
        'search_type': 'basic',
        'count': result['count'],
        'products': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@search_bp.route('/api/search/certification', methods=['GET'])
def search_by_certification():
    """ค้นหาผลิตภัณฑ์ตามการรับรองมาตรฐาน"""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'กรุณาระบุคำค้นหา (parameter: q)'}), 400

    result = fuseki_client.query(
        SEARCH_BY_CERTIFICATION.format(search_term=query)
    )

    if not result['success']:
        return jsonify({'error': result['error']}), 500

    return jsonify({
        'message': f"ผลการค้นหาตามมาตรฐาน '{query}': พบ {result['count']} รายการ",
        'query': query,
        'search_type': 'certification',
        'count': result['count'],
        'products': result['results'],
        'response_time_ms': result['response_time_ms']
    })


@search_bp.route('/api/search/semantic', methods=['GET'])
def semantic_search_products():
    """ค้นหาเชิงความหมาย - แปลง natural language ภาษาไทย → SPARQL"""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'error': 'กรุณาระบุคำค้นหา (parameter: q)'}), 400

    # แปลงคำค้นเป็น SPARQL query ด้วย semantic search
    search_result = semantic_search.search(query)

    return jsonify(search_result)
