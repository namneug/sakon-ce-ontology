# บริการแนะนำผลิตภัณฑ์ (Recommendation)
from sparql.fuseki_client import fuseki_client
from sparql.queries import SEMANTIC_SIMILAR_PRODUCTS, SEMANTIC_SHARED_INGREDIENTS


class RecommendationService:
    """คลาสสำหรับแนะนำผลิตภัณฑ์"""

    def get_similar_products(self, product_id):
        """แนะนำผลิตภัณฑ์ที่อยู่ในหมวดหมู่เดียวกัน"""
        result = fuseki_client.query(
            SEMANTIC_SIMILAR_PRODUCTS.format(product_id=product_id)
        )

        if not result['success']:
            return {'error': result['error']}

        return {
            'message': f"ผลิตภัณฑ์ที่คล้ายกับ {product_id}: {result['count']} รายการ",
            'product_id': product_id,
            'recommendations': result['results'],
            'count': result['count'],
            'response_time_ms': result['response_time_ms']
        }

    def get_shared_ingredient_products(self):
        """ดึงผลิตภัณฑ์ที่มีวัตถุดิบร่วมกัน"""
        result = fuseki_client.query(SEMANTIC_SHARED_INGREDIENTS)

        if not result['success']:
            return {'error': result['error']}

        return {
            'message': f"คู่ผลิตภัณฑ์ที่มีวัตถุดิบร่วมกัน: {result['count']} คู่",
            'pairs': result['results'],
            'count': result['count'],
            'response_time_ms': result['response_time_ms']
        }


recommendation_service = RecommendationService()
