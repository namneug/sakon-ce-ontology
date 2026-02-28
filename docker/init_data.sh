#!/bin/sh
# โหลดข้อมูล Ontology เข้า Apache Jena Fuseki
set -e

FUSEKI_URL="http://fuseki:3030"
DATASET="sakon_ce"
ADMIN_USER="admin"
ADMIN_PASS="${ADMIN_PASSWORD:-sakon_ce_admin}"
MAX_RETRIES=30
RETRY_INTERVAL=3

echo "============================================"
echo "  โหลดข้อมูล Ontology เข้า Fuseki"
echo "============================================"

# รอ Fuseki พร้อม
echo "[1/4] รอ Fuseki พร้อมใช้งาน..."
RETRY=0
until curl -sf "${FUSEKI_URL}/\$/ping" > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
    echo "[ERROR] Fuseki ไม่พร้อมหลังจากรอ $((MAX_RETRIES * RETRY_INTERVAL)) วินาที"
    exit 1
  fi
  echo "  รอ Fuseki... (${RETRY}/${MAX_RETRIES})"
  sleep "$RETRY_INTERVAL"
done
echo "  Fuseki พร้อมแล้ว!"

# สร้าง Dataset (ถ้ายังไม่มี)
echo "[2/4] สร้าง Dataset: ${DATASET}..."
EXISTING=$(curl -s -u "${ADMIN_USER}:${ADMIN_PASS}" "${FUSEKI_URL}/\$/datasets" | grep -c "\"/${DATASET}\"" || true)
if [ "$EXISTING" -gt 0 ]; then
  echo "  Dataset ${DATASET} มีอยู่แล้ว ข้ามขั้นตอนนี้"
else
  curl -s -u "${ADMIN_USER}:${ADMIN_PASS}" -X POST "${FUSEKI_URL}/\$/datasets" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "dbName=${DATASET}&dbType=tdb2" > /dev/null
  echo "  สร้าง Dataset ${DATASET} สำเร็จ"
fi

# โหลดไฟล์ OWL
echo "[3/4] โหลด OWL Schema..."
if [ -f /staging/sakon_ce_ontology.owl ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "${ADMIN_USER}:${ADMIN_PASS}" \
    -X POST "${FUSEKI_URL}/${DATASET}/data" \
    -H "Content-Type: application/rdf+xml" \
    --data-binary @/staging/sakon_ce_ontology.owl)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  โหลด OWL สำเร็จ"
  else
    echo "  [WARN] โหลด OWL HTTP: ${HTTP_CODE}"
  fi
else
  echo "  [WARN] ไม่พบไฟล์ sakon_ce_ontology.owl"
fi

# โหลดไฟล์ TTL
echo "[4/4] โหลด TTL Data..."
if [ -f /staging/sample_data.ttl ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "${ADMIN_USER}:${ADMIN_PASS}" \
    -X POST "${FUSEKI_URL}/${DATASET}/data" \
    -H "Content-Type: text/turtle" \
    --data-binary @/staging/sample_data.ttl)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  โหลด TTL สำเร็จ"
  else
    echo "  [WARN] โหลด TTL HTTP: ${HTTP_CODE}"
  fi
else
  echo "  [WARN] ไม่พบไฟล์ sample_data.ttl"
fi

# นับ Triples
echo ""
echo "============================================"
TRIPLE_COUNT=$(curl -s "${FUSEKI_URL}/${DATASET}/sparql" \
  --data-urlencode "query=SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }" \
  -H "Accept: application/sparql-results+json" | \
  grep -o '"value":"[0-9]*"' | head -1 | grep -o '[0-9]*')
echo "  จำนวน RDF Triples: ${TRIPLE_COUNT:-ไม่สามารถนับได้}"
echo "  Fuseki: ${FUSEKI_URL}/${DATASET}"
echo "  SPARQL: ${FUSEKI_URL}/${DATASET}/sparql"
echo "============================================"
echo "  โหลดข้อมูลเสร็จสมบูรณ์!"
echo "============================================"
