# Ontology-based E-commerce for Community Enterprises, Sakon Nakhon Province

**ระบบพาณิชย์อิเล็กทรอนิกส์ฐานออนโทโลยีสำหรับวิสาหกิจชุมชน จังหวัดสกลนคร**

A Semantic Web-powered e-commerce platform for community enterprise food products in Sakon Nakhon, Thailand. Built with OWL/RDF ontology, SPARQL querying, and Thai natural language semantic search.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-green?style=for-the-badge)](https://sakon-ce-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/API-Render-blue?style=for-the-badge)](https://sakon-ce-backend.onrender.com/api/health)

---

## Key Statistics

| Metric | Value |
|---|---|
| Products | **39** food products |
| Community Enterprises | **27** enterprises |
| Categories | **11** food categories |
| RDF Triples | **2,057** triples |
| Ontology Classes | **24** classes |
| Ontology Instances | **274+** instances |
| Ontology Properties | **25** properties |
| Semantic Search Intents | **14** intent types |

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://sakon-ce-frontend.onrender.com |
| Admin Panel | https://sakon-ce-frontend.onrender.com/admin |
| Backend API | https://sakon-ce-backend.onrender.com |
| API Health Check | https://sakon-ce-backend.onrender.com/api/health |

> **Note:** The backend runs on Render free tier with a self-ping keep-alive mechanism (every 14 minutes) to prevent cold starts.

---

## Screenshots

### Homepage with Hero Section
<!-- ![Homepage](screenshots/homepage.png) -->
*Hero section with background image, animated floating leaves, shimmer effect, and animated stat cards*

### Product Listing & Filtering
<!-- ![Products](screenshots/products.png) -->
*Grid view with category filters, price range, and sorting options*

### Semantic Search
<!-- ![Search](screenshots/search.png) -->
*Thai natural language search with SPARQL query viewer*

### Analytics Dashboard
<!-- ![Analytics](screenshots/analytics.png) -->
*Price analysis, sales channels, certifications, and top-rated products*

### Ontology Viewer
<!-- ![Ontology](screenshots/ontology.png) -->
*Interactive class hierarchy, properties, and sample triples*

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User / Browser                       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Frontend (React 18 SPA)                    │
│         Tailwind CSS + Recharts + React Router          │
│     11 pages  |  Responsive  |  Cloudinary images       │
│         Hosted on Render (Static Site)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────────┐
│              Backend (Python Flask)                      │
│    Semantic Search (14 intents) | JWT Auth | CORS       │
│    SPARQLWrapper | Self-ping Keep-alive (14 min)        │
│         Hosted on Render (Docker, Free Tier)            │
└──────────────────────┬──────────────────────────────────┘
                       │ SPARQL Protocol
┌──────────────────────▼──────────────────────────────────┐
│          Triple Store (Apache Jena Fuseki)               │
│          In-memory dataset | SPARQL 1.1 Endpoint        │
│             2,057 RDF Triples loaded at startup         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Ontology (OWL 2 + Turtle)                  │
│     sakon_ce_ontology.owl (TBox) — 24 Classes           │
│     sample_data.ttl (ABox) — 274+ Instances             │
│     25 Properties (Object + Datatype)                   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User types Thai query: "อยากได้ของฝากสกลนคร"
        │
        ▼
  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
  │  Keyword     │ ──▶ │  Generate    │ ──▶ │  Execute    │
  │  Matching    │     │  SPARQL      │     │  on Fuseki  │
  │  "ของฝาก"   │     │  Query       │     │             │
  └─────────────┘     └──────────────┘     └──────┬──────┘
                                                   │
                                            JSON Results
                                            15 products
```

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Ontology** | OWL 2, RDF/XML, Turtle | 24 classes, 274+ instances, 25 properties |
| **Triple Store** | Apache Jena Fuseki | In-memory SPARQL 1.1 endpoint |
| **Backend** | Python Flask | Semantic search, JWT auth, SPARQLWrapper |
| **Frontend** | React 18, Tailwind CSS | 11 pages, Recharts, responsive design |
| **Image Storage** | Cloudinary | Product images with CDN delivery |
| **Deployment** | Render (Free Tier) | Docker backend + static frontend |
| **Keep-alive** | Self-ping daemon thread | Prevents Render free tier sleep (14 min) |

---

## Features

### Semantic Search (14 Intent Types)

| # | Intent | Example Query | SPARQL Pattern |
|---|---|---|---|
| 1 | Health products | "สุขภาพ", "healthy" | `targetsCustomer = HealthConscious` |
| 2 | Souvenirs | "ของฝาก", "souvenir" | `targetsCustomer = Tourist` |
| 3 | Organic | "ออร์แกนิก", "ปลอดสาร" | `hasCertification = Organic` |
| 4 | Premium quality | "OTOP 5 ดาว", "อย." | `hasCertification = OTOP + FDA` |
| 5 | Online shopping | "ซื้อออนไลน์", "shopee" | `soldVia = Online Channels` |
| 6 | Budget-friendly | "ราคาถูก", "ไม่เกิน 50" | `hasPrice <= 50` |
| 7 | Premium price | "พรีเมียม", "ราคาสูง" | `hasPrice >= 100` |
| 8 | Snacks | "ขนม", "ของว่าง" | `hasCategory = Snack` |
| 9 | Beverages | "น้ำดื่ม", "เครื่องดื่ม" | `hasCategory = Beverage` |
| 10 | Rice products | "ข้าว", "ข้าวอินทรีย์" | `hasCategory = RiceProduct` |
| 11 | Seasonings | "น้ำพริก", "ปลาร้า" | `hasCategory = Seasoning` |
| 12 | Fermented food | "ปลาส้ม", "ไข่เค็ม" | `hasCategory = FermentedFood` |
| 13 | Insect food | "จิ้งหรีด", "โปรตีนแมลง" | `hasCategory = InsectFood` |
| 14 | By district | "วานรนิวาส", "พังโคน" | `locatedIn = District` |

### Other Features

- **JWT Authentication** for admin operations
- **Cloudinary Image Storage** with CDN delivery
- **Product Recommendations** based on shared ingredients and categories
- **Analytics Dashboard** with price analysis, sales channels, certifications
- **Ontology Viewer** with interactive class hierarchy
- **Survey System** with Likert scale questionnaire
- **Self-ping Keep-alive** to prevent Render free tier hibernation
- **Responsive Design** for mobile and desktop

---

## Ontology Schema

**Namespace:** `http://sakon-ce.example.org/ontology#` (prefix: `sce:`)

### Class Hierarchy

```
owl:Thing
├── sce:CommunityEnterprise          # Community Enterprise
├── sce:FoodProduct                  # Food Product
│   ├── sce:ProcessedMeatProduct     #   Processed Meat
│   ├── sce:RiceBasedProduct         #   Rice Products
│   ├── sce:SeasoningProduct         #   Seasonings
│   ├── sce:SnackProduct             #   Snacks
│   ├── sce:BeverageProduct          #   Beverages
│   ├── sce:FermentedProduct         #   Fermented Food
│   ├── sce:BakeryProduct            #   Bakery
│   └── sce:InsectFoodProduct        #   Insect Food
├── sce:FoodCategory                 # Food Category
├── sce:Ingredient                   # Ingredient
├── sce:Certification                # Certification
├── sce:SalesChannel                 # Sales Channel
├── sce:Location                     # Location
│   ├── sce:Province                 #   Province
│   ├── sce:District                 #   District
│   └── sce:SubDistrict              #   Sub-district
├── sce:CustomerSegment              # Customer Segment
├── sce:ProductionProcess            # Production Process
└── sce:Review                       # Review
```

### Key Properties

| Property | Type | Domain → Range |
|---|---|---|
| `producedBy` | Object | FoodProduct → CommunityEnterprise |
| `hasCategory` | Object | FoodProduct → FoodCategory |
| `hasIngredient` | Object | FoodProduct → Ingredient |
| `hasCertification` | Object | FoodProduct → Certification |
| `soldVia` | Object | FoodProduct → SalesChannel |
| `targetsCustomer` | Object | FoodProduct → CustomerSegment |
| `locatedIn` | Object | CommunityEnterprise → Location |
| `hasName` | Datatype | Thing → xsd:string |
| `hasPrice` | Datatype | FoodProduct → xsd:decimal |
| `hasRating` | Datatype | Review → xsd:decimal |

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products (supports `?category=`, `?min_price=`, `?max_price=`) |
| GET | `/api/products/<id>` | Product detail with ingredients, processes, certifications |

### Enterprises
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/enterprises` | List all community enterprises |
| GET | `/api/enterprises/<id>` | Enterprise detail with products |

### Search
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/search?q=<query>` | Basic text search |
| GET | `/api/search/semantic?q=<query>` | Semantic search (NL → SPARQL) |
| GET | `/api/search/certification?q=<query>` | Search by certification |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview` | System overview (counts, triples) |
| GET | `/api/analytics/price-by-category` | Price stats by category |
| GET | `/api/analytics/channels` | Sales channel distribution |
| GET | `/api/analytics/certifications` | Certification statistics |
| GET | `/api/analytics/top-rated` | Highest rated products |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check + Fuseki status |
| GET | `/api/recommendations/<id>/similar` | Similar product recommendations |
| POST | `/api/survey` | Submit satisfaction survey |

---

## Project Structure

```
sakon-ce-ontology/
├── render.yaml                     # Render deployment blueprint
├── Dockerfile.render               # Docker image for Render
│
├── ontology/                       # Ontology Layer
│   ├── sakon_ce_ontology.owl       # OWL 2 Schema (TBox) — 24 classes
│   ├── sample_data.ttl             # Turtle instances (ABox) — 274+ instances
│   └── sparql_queries/             # Example SPARQL queries
│
├── backend/                        # Backend API (Flask)
│   ├── app.py                      # Main app + keep-alive + survey
│   ├── config.py                   # Environment config
│   ├── routes/                     # API route handlers
│   │   ├── products.py             # Product CRUD
│   │   ├── enterprises.py          # Enterprise CRUD
│   │   ├── search.py               # Basic + semantic search
│   │   ├── categories.py           # Category listing
│   │   ├── analytics.py            # Analytics endpoints
│   │   ├── admin.py                # Admin operations (JWT)
│   │   └── upload.py               # Cloudinary image upload
│   ├── services/
│   │   ├── semantic_search.py      # Thai NL → SPARQL (14 intents)
│   │   └── recommendation.py       # Similar products engine
│   └── sparql/
│       ├── fuseki_client.py        # Fuseki connection + query execution
│       └── queries.py              # SPARQL query templates
│
├── frontend/                       # Frontend (React 18)
│   ├── tailwind.config.js          # Green nature theme
│   └── src/
│       ├── App.jsx                 # Routing (11 routes) + floating leaves
│       ├── index.css               # Global styles + animations
│       ├── components/             # Header, Footer, ProductCard, SearchBar
│       └── pages/                  # 11 page components
│
├── evaluation/                     # Evaluation & Testing
│   ├── test_queries.json           # 20 test queries + ground truth
│   ├── evaluation.py               # P/R/F1/Response time script
│   ├── survey_form.html            # Likert scale questionnaire
│   └── results/                    # Charts + CSV/JSON results
│
└── docker/                         # Docker configs (local dev)
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── init_data.sh
```

---

## Local Development

### Prerequisites
- Docker >= 20.0 & Docker Compose >= 2.0
- (Or) Python 3.9+, Node.js 20+

### Quick Start with Docker Compose

```bash
git clone https://github.com/namneug/sakon-ce-ontology.git
cd sakon-ce-ontology
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5050/api |
| Fuseki Admin | http://localhost:3030 |

### Manual Setup

```bash
# 1. Start Fuseki
docker run -d --name fuseki -p 3030:3030 -e ADMIN_PASSWORD=sakon_ce_admin stain/jena-fuseki

# 2. Create dataset and load data
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/$/datasets -d "dbName=sakon_ce&dbType=tdb2"
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/sakon_ce/data -H "Content-Type: application/rdf+xml" --data-binary @ontology/sakon_ce_ontology.owl
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/sakon_ce/data -H "Content-Type: text/turtle" --data-binary @ontology/sample_data.ttl

# 3. Start Backend
cd backend && pip install -r requirements.txt && python app.py

# 4. Start Frontend
cd frontend && npm install && npm start
```

---

## Evaluation Results

Tested with 20 queries (10 basic + 10 semantic), 5 rounds each:

| Metric | Overall | Basic Search | Semantic Search |
|---|---|---|---|
| **Precision** | 1.0000 | 1.0000 | 1.0000 |
| **Recall** | 1.0000 | 1.0000 | 1.0000 |
| **F1-Score** | 1.0000 | 1.0000 | 1.0000 |
| **Avg Response Time** | 11.30 ms | 12.67 ms | 9.93 ms |

---

## Author

**Piya Pluem (อ.ปิยะ ปลื้ม)**
Department of Innovation and Computer Education, Sakon Nakhon Rajabhat University
(สาขาวิชานวัตกรรมและคอมพิวเตอร์ศึกษา มหาวิทยาลัยราชภัฏสกลนคร)

---

## License

This project is developed for academic research purposes.
