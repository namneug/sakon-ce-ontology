# การตั้งค่าระบบ Backend API
import os

# การตั้งค่า Fuseki
FUSEKI_URL = os.getenv('FUSEKI_URL', 'http://localhost:3030')
FUSEKI_DATASET = os.getenv('FUSEKI_DATASET', 'sakon_ce')
FUSEKI_QUERY_ENDPOINT = f"{FUSEKI_URL}/{FUSEKI_DATASET}/sparql"
FUSEKI_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{FUSEKI_DATASET}/update"
FUSEKI_DATA_ENDPOINT = f"{FUSEKI_URL}/{FUSEKI_DATASET}/data"
FUSEKI_ADMIN_USER = os.getenv('FUSEKI_ADMIN_USER', 'admin')
FUSEKI_ADMIN_PASSWORD = os.getenv('FUSEKI_ADMIN_PASSWORD', 'sakon_ce_admin')

# Namespace ของ Ontology
SCE_NAMESPACE = "http://sakon-ce.example.org/ontology#"
SCE_PREFIX = "sce"

# การตั้งค่า Flask
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5050)))
FLASK_DEBUG = os.getenv('FLASK_ENV', 'production') == 'development'

# Admin
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'sakon_ce_admin')
ADMIN_SECRET_KEY = os.getenv('ADMIN_SECRET_KEY', 'sakon-ce-secret-key-2024')

# SPARQL Prefixes ที่ใช้บ่อย
SPARQL_PREFIXES = """
PREFIX sce: <http://sakon-ce.example.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
"""
