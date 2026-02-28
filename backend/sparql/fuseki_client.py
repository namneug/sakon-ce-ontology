# ตัวเชื่อมต่อ Apache Jena Fuseki ผ่าน SPARQLWrapper
import time
import json
from SPARQLWrapper import SPARQLWrapper, JSON, POST, GET
from config import FUSEKI_QUERY_ENDPOINT, FUSEKI_UPDATE_ENDPOINT, SPARQL_PREFIXES, FUSEKI_ADMIN_USER, FUSEKI_ADMIN_PASSWORD


class FusekiClient:
    """คลาสสำหรับเชื่อมต่อและ query ข้อมูลจาก Fuseki"""

    def __init__(self):
        self.query_endpoint = SPARQLWrapper(FUSEKI_QUERY_ENDPOINT)
        self.query_endpoint.setReturnFormat(JSON)
        self.update_endpoint = SPARQLWrapper(FUSEKI_UPDATE_ENDPOINT)
        self.update_endpoint.setCredentials(FUSEKI_ADMIN_USER, FUSEKI_ADMIN_PASSWORD)

    def query(self, sparql_query, include_prefixes=True):
        """ส่ง SPARQL SELECT query และวัดเวลาตอบกลับ"""
        start_time = time.time()

        if include_prefixes and not sparql_query.strip().upper().startswith('PREFIX'):
            sparql_query = SPARQL_PREFIXES + sparql_query

        try:
            self.query_endpoint.setQuery(sparql_query)
            self.query_endpoint.setMethod(GET)
            results = self.query_endpoint.query().convert()
            response_time = round((time.time() - start_time) * 1000, 2)

            return {
                'success': True,
                'results': self._parse_results(results),
                'count': len(results['results']['bindings']),
                'response_time_ms': response_time
            }
        except Exception as e:
            response_time = round((time.time() - start_time) * 1000, 2)
            return {
                'success': False,
                'error': f'เกิดข้อผิดพลาดในการ query: {str(e)}',
                'response_time_ms': response_time
            }

    def _parse_results(self, raw_results):
        """แปลงผลลัพธ์ SPARQL เป็น list ของ dict"""
        parsed = []
        for binding in raw_results['results']['bindings']:
            row = {}
            for var, value in binding.items():
                if value['type'] == 'uri':
                    # ตัด namespace ออกเหลือแค่ชื่อ
                    uri = value['value']
                    if '#' in uri:
                        row[var] = uri.split('#')[-1]
                    else:
                        row[var] = uri
                    row[f'{var}_uri'] = uri
                else:
                    row[var] = value['value']
            parsed.append(row)
        return parsed

    def update(self, sparql_update, include_prefixes=True):
        """ส่ง SPARQL INSERT/DELETE update"""
        start_time = time.time()

        if include_prefixes and not sparql_update.strip().upper().startswith('PREFIX'):
            sparql_update = SPARQL_PREFIXES + sparql_update

        try:
            self.update_endpoint.setQuery(sparql_update)
            self.update_endpoint.setMethod(POST)
            self.update_endpoint.query()
            response_time = round((time.time() - start_time) * 1000, 2)

            return {
                'success': True,
                'response_time_ms': response_time
            }
        except Exception as e:
            response_time = round((time.time() - start_time) * 1000, 2)
            return {
                'success': False,
                'error': f'เกิดข้อผิดพลาดในการ update: {str(e)}',
                'response_time_ms': response_time
            }

    def count_triples(self):
        """นับจำนวน triples ทั้งหมดใน dataset"""
        result = self.query("SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }")
        if result['success'] and result['results']:
            return int(result['results'][0]['count'])
        return 0

    def check_connection(self):
        """ตรวจสอบการเชื่อมต่อกับ Fuseki"""
        try:
            count = self.count_triples()
            return {
                'connected': True,
                'endpoint': FUSEKI_QUERY_ENDPOINT,
                'triple_count': count
            }
        except Exception as e:
            return {
                'connected': False,
                'endpoint': FUSEKI_QUERY_ENDPOINT,
                'error': str(e)
            }


# สร้าง instance เดียวใช้ทั้งแอป
fuseki_client = FusekiClient()
