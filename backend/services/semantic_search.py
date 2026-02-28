# บริการค้นหาเชิงความหมาย (Semantic Search)
# แปลง natural language ภาษาไทย → SPARQL query
from sparql.fuseki_client import fuseki_client
from sparql.queries import (
    SEMANTIC_HEALTH_PRODUCTS, SEMANTIC_GIFT_PRODUCTS,
    SEMANTIC_ORGANIC_PRODUCTS, SEMANTIC_PREMIUM_PRODUCTS,
    SEMANTIC_ONLINE_PRODUCTS, SEMANTIC_SIMILAR_PRODUCTS,
    SEMANTIC_PRODUCTS_BY_DISTRICT, SEARCH_PRODUCTS_BY_TEXT
)


class SemanticSearch:
    """คลาสสำหรับค้นหาเชิงความหมาย"""

    def __init__(self):
        # กำหนดรูปแบบคำค้นที่รองรับ พร้อม SPARQL query
        self.patterns = [
            {
                'keywords': ['สุขภาพ', 'เพื่อสุขภาพ', 'ดีต่อสุขภาพ', 'healthy'],
                'intent': 'health_products',
                'description': 'ผลิตภัณฑ์สำหรับผู้รักสุขภาพ',
                'query': SEMANTIC_HEALTH_PRODUCTS
            },
            {
                'keywords': ['ของฝาก', 'ฝากคน', 'ซื้อฝาก', 'souvenir', 'gift'],
                'intent': 'gift_products',
                'description': 'ผลิตภัณฑ์เหมาะเป็นของฝาก',
                'query': SEMANTIC_GIFT_PRODUCTS
            },
            {
                'keywords': ['อินทรีย์', 'ออร์แกนิก', 'organic', 'ปลอดสาร', 'ไม่ใช้สารเคมี'],
                'intent': 'organic_products',
                'description': 'ผลิตภัณฑ์อินทรีย์/ออร์แกนิก',
                'query': SEMANTIC_ORGANIC_PRODUCTS
            },
            {
                'keywords': ['คุณภาพสูง', 'มาตรฐานสูง', 'premium', 'OTOP 5', 'OTOP 4',
                             'ดีที่สุด', 'ระดับสูง', 'อย.'],
                'intent': 'premium_products',
                'description': 'ผลิตภัณฑ์มาตรฐานสูง (อย. + OTOP 4-5 ดาว)',
                'query': SEMANTIC_PREMIUM_PRODUCTS
            },
            {
                'keywords': ['ออนไลน์', 'สั่งออนไลน์', 'online', 'facebook', 'line',
                             'shopee', 'ซื้อผ่านเน็ต', 'สั่งซื้อ'],
                'intent': 'online_products',
                'description': 'ผลิตภัณฑ์ที่ขายออนไลน์',
                'query': SEMANTIC_ONLINE_PRODUCTS
            },
            {
                'keywords': ['ราคาถูก', 'ถูก', 'ประหยัด', 'cheap', 'ราคาย่อมเยา'],
                'intent': 'cheap_products',
                'description': 'ผลิตภัณฑ์ราคาไม่เกิน 50 บาท',
                'query': """
SELECT ?product ?name ?price ?categoryName ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    FILTER (?price <= 50)
    OPTIONAL {
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['แพง', 'ราคาสูง', 'พรีเมียม', 'หรูหรา'],
                'intent': 'expensive_products',
                'description': 'ผลิตภัณฑ์ราคา 100 บาทขึ้นไป',
                'query': """
SELECT ?product ?name ?price ?categoryName ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    FILTER (?price >= 100)
    OPTIONAL {
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY DESC(?price)
"""
            },
            {
                'keywords': ['ขนม', 'ของว่าง', 'snack', 'ของกินเล่น', 'กินเล่น'],
                'intent': 'snack_products',
                'description': 'ผลิตภัณฑ์ประเภทขนม/ของว่าง',
                'query': """
SELECT ?product ?name ?price ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:Snack .
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['เครื่องดื่ม', 'น้ำ', 'ดื่ม', 'drink', 'beverage'],
                'intent': 'beverage_products',
                'description': 'ผลิตภัณฑ์ประเภทเครื่องดื่ม',
                'query': """
SELECT ?product ?name ?price ?enterpriseName ?description
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    {
        ?product sce:belongsToCategory sce:Beverage .
    } UNION {
        ?product sce:belongsToCategory sce:AlcoholicBeverage .
    }
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['ข้าว', 'rice', 'ข้าวกล้อง', 'ข้าวอินทรีย์'],
                'intent': 'rice_products',
                'description': 'ผลิตภัณฑ์จากข้าว',
                'query': """
SELECT ?product ?name ?price ?enterpriseName ?description
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:RiceProduct .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['น้ำพริก', 'เครื่องปรุง', 'ปรุงรส', 'ปลาร้า', 'seasoning'],
                'intent': 'seasoning_products',
                'description': 'ผลิตภัณฑ์ประเภทเครื่องปรุงรส/น้ำพริก',
                'query': """
SELECT ?product ?name ?price ?enterpriseName ?description
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:Seasoning .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['หมัก', 'ดอง', 'fermented', 'ปลาส้ม', 'ไข่เค็ม'],
                'intent': 'fermented_products',
                'description': 'ผลิตภัณฑ์อาหารหมักดอง',
                'query': """
SELECT ?product ?name ?price ?enterpriseName ?description
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:FermentedFood .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['แมลง', 'จิ้งหรีด', 'insect', 'โปรตีน'],
                'intent': 'insect_products',
                'description': 'ผลิตภัณฑ์อาหารจากแมลง',
                'query': """
SELECT ?product ?name ?price ?enterpriseName ?description
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:InsectFood .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?price
"""
            },
            {
                'keywords': ['รีวิว', 'คะแนน', 'ยอดนิยม', 'แนะนำ', 'review', 'popular'],
                'intent': 'reviewed_products',
                'description': 'ผลิตภัณฑ์ที่มีรีวิวและคะแนนสูง',
                'query': """
SELECT ?productName ?price (AVG(?rating) AS ?avgRating)
       (COUNT(?review) AS ?reviewCount)
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?productName ;
             sce:hasPrice ?price ;
             sce:hasReview ?review .
    ?review sce:hasRating ?rating .
}
GROUP BY ?productName ?price
ORDER BY DESC(?avgRating)
"""
            },
        ]

        # mapping อำเภอ
        self.district_map = {
            'เมือง': 'MueangSakonNakhon',
            'เมืองสกลนคร': 'MueangSakonNakhon',
            'กุสุมาลย์': 'Kusuman',
            'พังโคน': 'Phangkhon',
            'ภูพาน': 'PhuPhan',
            'สว่างแดนดิน': 'SawangDaenDin',
            'วานรนิวาส': 'Wanonniwat',
            'โพนนาแก้ว': 'PhonNaKaew',
            'คำตากล้า': 'KhamTaKla',
            'บ้านม่วง': 'BanMuang',
            'กุดบาก': 'KutBak',
            'อากาศอำนวย': 'AkatAmnuai',
            'บ้านโป่ง': 'BanPong',
        }

    def search(self, query_text):
        """ค้นหาเชิงความหมาย"""
        query_lower = query_text.lower().strip()

        # ตรวจสอบว่ามีชื่ออำเภอในคำค้นหรือไม่
        for district_name, district_id in self.district_map.items():
            if district_name in query_text:
                result = fuseki_client.query(
                    SEMANTIC_PRODUCTS_BY_DISTRICT.format(district_id=district_id)
                )
                if result['success']:
                    return {
                        'message': f"ผลิตภัณฑ์ในพื้นที่ {district_name}: {result['count']} รายการ",
                        'query': query_text,
                        'search_type': 'semantic',
                        'intent': 'district_search',
                        'intent_description': f'ค้นหาผลิตภัณฑ์ในอำเภอ{district_name}',
                        'count': result['count'],
                        'products': result['results'],
                        'response_time_ms': result['response_time_ms']
                    }

        # ตรวจสอบ pattern ที่ตรงกับคำค้น
        best_match = None
        best_score = 0

        for pattern in self.patterns:
            score = sum(1 for kw in pattern['keywords'] if kw in query_lower)
            if score > best_score:
                best_score = score
                best_match = pattern

        if best_match and best_score > 0:
            result = fuseki_client.query(best_match['query'])
            if result['success']:
                return {
                    'message': f"{best_match['description']}: {result['count']} รายการ",
                    'query': query_text,
                    'search_type': 'semantic',
                    'intent': best_match['intent'],
                    'intent_description': best_match['description'],
                    'count': result['count'],
                    'products': result['results'],
                    'response_time_ms': result['response_time_ms']
                }

        # ถ้าไม่ตรง pattern ใดๆ → ใช้ full-text search
        result = fuseki_client.query(
            SEARCH_PRODUCTS_BY_TEXT.format(search_term=query_text)
        )

        if result['success']:
            return {
                'message': f"ผลการค้นหา '{query_text}': {result['count']} รายการ",
                'query': query_text,
                'search_type': 'fallback_text',
                'intent': 'text_search',
                'intent_description': f'ค้นหาข้อความ: {query_text}',
                'count': result['count'],
                'products': result['results'],
                'response_time_ms': result['response_time_ms']
            }

        return {
            'message': f"ไม่พบผลลัพธ์สำหรับ '{query_text}'",
            'query': query_text,
            'search_type': 'semantic',
            'count': 0,
            'products': [],
            'response_time_ms': 0
        }
