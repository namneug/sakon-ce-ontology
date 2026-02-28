#!/bin/bash
set -e

echo "============================================"
echo "  Render Startup: sakon-ce-ontology"
echo "============================================"

# Configuration
FUSEKI_HOME="/opt/fuseki"
FUSEKI_PORT=3030
DATASET="${FUSEKI_DATASET:-sakon_ce}"
FLASK_PORT="${PORT:-10000}"
ONTOLOGY_DIR="/app/ontology"

# Prevent "Multiple dataset path names given" error:
# Set FUSEKI_BASE to a clean directory so Fuseki doesn't load
# leftover configs from its default run/ directory.
export FUSEKI_BASE=/tmp/fuseki-run
mkdir -p "${FUSEKI_BASE}"

# ==========================================
# Step 1: Start Flask API FIRST (so Render detects the port)
# ==========================================
echo "[1/4] Starting Flask API on port ${FLASK_PORT}..."

export FLASK_PORT="${FLASK_PORT}"

gunicorn \
    --bind "0.0.0.0:${FLASK_PORT}" \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    app:app &
GUNICORN_PID=$!

echo "  Gunicorn started (PID ${GUNICORN_PID}), port ${FLASK_PORT} open for Render."

# ==========================================
# Step 2: Start Fuseki in background (in-memory mode)
# ==========================================
echo "[2/4] Starting Fuseki (in-memory, JVM heap 200m)..."

export JVM_ARGS="-Xmx200m -Xms100m"

${FUSEKI_HOME}/fuseki-server \
    --mem "/${DATASET}" \
    --port=${FUSEKI_PORT} \
    2>&1 &
FUSEKI_PID=$!

# ==========================================
# Step 3: Wait for Fuseki to be ready
# ==========================================
echo "[3/4] Waiting for Fuseki to start..."
MAX_RETRIES=60
RETRY=0
until curl -sf "http://localhost:${FUSEKI_PORT}/\$/ping" > /dev/null 2>&1; do
    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "[ERROR] Fuseki did not start after ${MAX_RETRIES} seconds"
        exit 1
    fi
    sleep 1
done
echo "  Fuseki is ready! (took ~${RETRY} seconds)"

# ==========================================
# Step 4: Load ontology data
# ==========================================
echo "[4/4] Loading ontology data..."

# Load OWL schema
if [ -f "${ONTOLOGY_DIR}/sakon_ce_ontology.owl" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "http://localhost:${FUSEKI_PORT}/${DATASET}/data" \
        -H "Content-Type: application/rdf+xml" \
        --data-binary @"${ONTOLOGY_DIR}/sakon_ce_ontology.owl")
    echo "  OWL schema loaded (HTTP ${HTTP_CODE})"
else
    echo "  [WARN] OWL file not found!"
fi

# Load TTL data
if [ -f "${ONTOLOGY_DIR}/sample_data.ttl" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "http://localhost:${FUSEKI_PORT}/${DATASET}/data" \
        -H "Content-Type: text/turtle" \
        --data-binary @"${ONTOLOGY_DIR}/sample_data.ttl")
    echo "  TTL data loaded (HTTP ${HTTP_CODE})"
else
    echo "  [WARN] TTL file not found!"
fi

# Verify triple count
TRIPLE_COUNT=$(curl -s "http://localhost:${FUSEKI_PORT}/${DATASET}/sparql" \
    --data-urlencode "query=SELECT (COUNT(*) AS ?count) WHERE { ?s ?p ?o }" \
    -H "Accept: application/sparql-results+json" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['results']['bindings'][0]['count']['value'])" 2>/dev/null || echo "unknown")
echo "  Total triples: ${TRIPLE_COUNT}"

echo "============================================"
echo "  Startup complete! Flask + Fuseki running."
echo "============================================"

# Keep the script alive by waiting for gunicorn
wait ${GUNICORN_PID}
