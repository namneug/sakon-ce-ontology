#!/bin/bash
# สคริปต์โหลดข้อมูล Ontology เข้า Apache Jena Fuseki
# ใช้สำหรับระบบฐานข้อมูลออนโทโลยีวิสาหกิจชุมชน จ.สกลนคร

FUSEKI_URL="${FUSEKI_URL:-http://localhost:3030}"
DATASET="${FUSEKI_DATASET:-sakon_ce}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-sakon_ce_admin}"
STAGING_DIR="${STAGING_DIR:-../ontology}"

echo "============================================"
echo "โหลดข้อมูล Ontology เข้า Apache Jena Fuseki"
echo "============================================"
echo "Fuseki URL: $FUSEKI_URL"
echo "Dataset: $DATASET"
echo ""

# รอให้ Fuseki พร้อมใช้งาน
echo "รอให้ Fuseki เริ่มต้นทำงาน..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s -o /dev/null -w "%{http_code}" "$FUSEKI_URL/\$/ping" | grep -q "200"; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "ผิดพลาด: ไม่สามารถเชื่อมต่อ Fuseki ได้หลังจากลอง $MAX_RETRIES ครั้ง"
        exit 1
    fi
    echo "  รอ... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo "Fuseki พร้อมใช้งานแล้ว!"
echo ""

# ตรวจสอบว่า dataset มีอยู่แล้วหรือไม่
echo "ตรวจสอบ dataset: $DATASET"
DATASET_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
    -u admin:$ADMIN_PASSWORD \
    "$FUSEKI_URL/\$/datasets/$DATASET")

if [ "$DATASET_EXISTS" != "200" ]; then
    echo "สร้าง dataset ใหม่: $DATASET"
    curl -s -X POST \
        -u admin:$ADMIN_PASSWORD \
        -d "dbName=$DATASET&dbType=tdb2" \
        "$FUSEKI_URL/\$/datasets"
    echo ""
    echo "สร้าง dataset สำเร็จ!"
else
    echo "Dataset $DATASET มีอยู่แล้ว"
fi
echo ""

# โหลดไฟล์ OWL (Ontology schema)
echo "โหลด Ontology schema (.owl)..."
if [ -f "$STAGING_DIR/sakon_ce_ontology.owl" ]; then
    curl -s -X POST \
        -u admin:$ADMIN_PASSWORD \
        -H "Content-Type: application/rdf+xml" \
        --data-binary @"$STAGING_DIR/sakon_ce_ontology.owl" \
        "$FUSEKI_URL/$DATASET/data?default"
    echo ""
    echo "โหลด OWL สำเร็จ!"
else
    echo "ไม่พบไฟล์ sakon_ce_ontology.owl"
    exit 1
fi
echo ""

# โหลดไฟล์ TTL (Sample data)
echo "โหลดข้อมูลตัวอย่าง (.ttl)..."
if [ -f "$STAGING_DIR/sample_data.ttl" ]; then
    curl -s -X POST \
        -u admin:$ADMIN_PASSWORD \
        -H "Content-Type: text/turtle" \
        --data-binary @"$STAGING_DIR/sample_data.ttl" \
        "$FUSEKI_URL/$DATASET/data?default"
    echo ""
    echo "โหลด TTL สำเร็จ!"
else
    echo "ไม่พบไฟล์ sample_data.ttl"
    exit 1
fi
echo ""

# นับจำนวน triples
echo "นับจำนวน triples ทั้งหมด..."
TRIPLE_COUNT=$(curl -s -X POST \
    -u admin:$ADMIN_PASSWORD \
    -H "Content-Type: application/sparql-query" \
    -H "Accept: application/sparql-results+json" \
    --data "SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }" \
    "$FUSEKI_URL/$DATASET/sparql" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data['results']['bindings'][0]['count']['value'])
" 2>/dev/null)

echo "============================================"
echo "จำนวน triples ทั้งหมด: $TRIPLE_COUNT"
echo "============================================"
echo ""

# ทดสอบ SPARQL query อย่างง่าย
echo "ทดสอบ SPARQL query: ดึงผลิตภัณฑ์ทั้งหมด..."
curl -s -X POST \
    -H "Content-Type: application/sparql-query" \
    -H "Accept: application/sparql-results+json" \
    --data "
PREFIX sce: <http://sakon-ce.example.org/ontology#>
SELECT ?name ?price WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
}
ORDER BY ?name
LIMIT 5
" "$FUSEKI_URL/$DATASET/sparql" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('ตัวอย่างผลิตภัณฑ์ 5 รายการแรก:')
for row in data['results']['bindings']:
    name = row['name']['value']
    price = row['price']['value']
    print(f'  - {name}: {price} บาท')
" 2>/dev/null

echo ""
echo "============================================"
echo "โหลดข้อมูลเสร็จสมบูรณ์!"
echo "============================================"
