# ระบบฐานข้อมูลออนโทโลยีผลิตภัณฑ์อาหารวิสาหกิจชุมชน จังหวัดสกลนคร

## Ontology-based Database System for Community Enterprise Food Products in Sakon Nakhon Province

ระบบ E-commerce ที่ใช้เทคโนโลยี **Semantic Web** และ **Ontology** เป็นพื้นฐานในการจัดเก็บและสืบค้นข้อมูลผลิตภัณฑ์อาหารจากวิสาหกิจชุมชนในจังหวัดสกลนคร รองรับ **การค้นหาเชิงความหมาย (Semantic Search)** ด้วยภาษาธรรมชาติภาษาไทย

---

## สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
- [เทคโนโลยีที่ใช้](#เทคโนโลยีที่ใช้)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การติดตั้งและใช้งาน](#การติดตั้งและใช้งาน)
- [ข้อมูลในระบบ](#ข้อมูลในระบบ)
- [Ontology Schema](#ontology-schema)
- [API Endpoints](#api-endpoints)
- [การค้นหาเชิงความหมาย](#การค้นหาเชิงความหมาย)
- [หน้าจอเว็บแอปพลิเคชัน](#หน้าจอเว็บแอปพลิเคชัน)
- [การประเมินผลระบบ](#การประเมินผลระบบ)
- [แบบสอบถามความพึงพอใจ](#แบบสอบถามความพึงพอใจ)

---

## ภาพรวมระบบ

ระบบนี้พัฒนาขึ้นเพื่อ:

1. **จัดเก็บข้อมูล** ผลิตภัณฑ์อาหารวิสาหกิจชุมชนในรูปแบบ Ontology (OWL/RDF) ซึ่งสามารถแสดงความสัมพันธ์เชิงความหมายระหว่างข้อมูลได้
2. **ให้บริการสืบค้น** ผ่าน SPARQL Endpoint (Apache Jena Fuseki) และ REST API
3. **รองรับการค้นหาเชิงความหมาย** ด้วยภาษาธรรมชาติภาษาไทย โดยแปลงคำค้นหาเป็น SPARQL Query อัตโนมัติ
4. **แสดงผลผ่านเว็บแอปพลิเคชัน** ที่ใช้งานง่าย รองรับ Responsive Design

### ตัวอย่างการค้นหาเชิงความหมาย

| คำค้นหาภาษาไทย | Intent ที่ระบบเข้าใจ | ผลลัพธ์ |
|---|---|---|
| "สุขภาพ" | สินค้าสุขภาพ + อินทรีย์ | 7 ผลิตภัณฑ์ |
| "ของฝาก" | สินค้าเหมาะเป็นของฝาก | 15 ผลิตภัณฑ์ |
| "ซื้อออนไลน์" | สินค้าที่มีช่องทางออนไลน์ | 2 ผลิตภัณฑ์ |
| "ราคาถูก" | สินค้าราคาไม่เกิน 50 บาท | 14 ผลิตภัณฑ์ |
| "วานรนิวาส" | สินค้าจากอำเภอวานรนิวาส | 2 ผลิตภัณฑ์ |

---

## สถาปัตยกรรมระบบ

ระบบประกอบด้วย 3 ส่วนหลัก ทำงานร่วมกันผ่าน Docker Compose:

```
┌─────────────────────────────────────────────────┐
│            Frontend (React + Nginx)             │  Port 3000
│      Tailwind CSS / Recharts / React Router     │
│          9 หน้าจอ + แบบสอบถาม                    │
└───────────────────────┬─────────────────────────┘
                        │ REST API (HTTP/JSON)
┌───────────────────────▼─────────────────────────┐
│            Backend (Python Flask)                │  Port 5050
│    Semantic Search Engine / SPARQLWrapper        │
│    14 Intents + 21 API Endpoints                │
└───────────────────────┬─────────────────────────┘
                        │ SPARQL Protocol
┌───────────────────────▼─────────────────────────┐
│        Triple Store (Apache Jena Fuseki)        │  Port 3030
│            TDB2 / SPARQL 1.1 Endpoint           │
│              1,674 RDF Triples                  │
└───────────────────────┬─────────────────────────┘
                        │ RDF Data Model
┌───────────────────────▼─────────────────────────┐
│           Ontology (OWL + Turtle)               │
│    sakon_ce_ontology.owl (Schema/TBox)          │
│    sample_data.ttl (Instances/ABox)             │
└─────────────────────────────────────────────────┘
```

### การไหลของข้อมูล

1. ผู้ใช้พิมพ์คำค้นหาภาษาไทยผ่าน **Frontend**
2. **Backend** วิเคราะห์คำค้นหา จับคู่กับ Intent แล้วสร้าง SPARQL Query
3. ส่ง SPARQL Query ไปยัง **Fuseki** เพื่อสืบค้นจาก Triple Store
4. ผลลัพธ์ถูกแปลงเป็น JSON ส่งกลับให้ Frontend แสดงผล

---

## เทคโนโลยีที่ใช้

| Layer | เทคโนโลยี | เวอร์ชัน |
|---|---|---|
| **Ontology** | OWL 2 (Web Ontology Language), RDF/XML, Turtle, SPARQL 1.1 | - |
| **Triple Store** | Apache Jena Fuseki, TDB2 | 4.x |
| **Backend** | Python, Flask, SPARQLWrapper, flask-cors | 3.9, 2.3.3 |
| **Frontend** | React, Tailwind CSS, Recharts, React Router | 19, 3.x, 7.x |
| **Deployment** | Docker, Docker Compose, Nginx | - |
| **Evaluation** | Precision/Recall/F1-Score, matplotlib, numpy | - |

---

## โครงสร้างโปรเจกต์

```
sakon-ce-ontology/
├── docker-compose.yml              # Docker Compose configuration
├── README.md                       # เอกสารนี้
├── .gitignore
├── .dockerignore
│
├── ontology/                       # Ontology Layer
│   ├── sakon_ce_ontology.owl       # OWL Schema (TBox)
│   ├── sample_data.ttl             # Instance Data (ABox)
│   └── sparql_queries/             # ตัวอย่าง SPARQL Queries
│       ├── basic_queries.rq        # คำสั่ง SPARQL พื้นฐาน
│       └── semantic_queries.rq     # คำสั่ง SPARQL เชิงความหมาย
│
├── backend/                        # Backend API Layer
│   ├── app.py                      # Flask Application + Survey Endpoints
│   ├── config.py                   # Environment Configuration
│   ├── requirements.txt            # Python Dependencies
│   ├── routes/                     # API Route Handlers
│   │   ├── products.py             # /api/products, /api/products/<id>
│   │   ├── enterprises.py          # /api/enterprises, /api/enterprises/<id>
│   │   ├── search.py               # /api/search, /api/search/semantic
│   │   ├── categories.py           # /api/categories
│   │   └── analytics.py            # /api/analytics/*
│   ├── services/                   # Business Logic
│   │   ├── semantic_search.py      # Thai NL → SPARQL (14 intents)
│   │   └── recommendation.py       # Similar Products Engine
│   ├── sparql/                     # SPARQL Data Access Layer
│   │   ├── fuseki_client.py        # Fuseki Connection + Query Execution
│   │   └── queries.py              # SPARQL Query Templates
│   └── utils/
│       └── helpers.py              # Utility Functions
│
├── frontend/                       # Frontend Layer
│   ├── package.json                # Node.js Dependencies
│   ├── tailwind.config.js          # Tailwind CSS Theme Configuration
│   ├── postcss.config.js           # PostCSS Configuration
│   ├── public/
│   │   └── index.html              # HTML Template
│   └── src/
│       ├── App.jsx                 # Main App + Routing (9 routes)
│       ├── index.js                # Entry Point
│       ├── index.css               # Global Styles + Tailwind Directives
│       ├── services/
│       │   └── api.js              # API Client (axios)
│       ├── components/             # Reusable Components
│       │   ├── Header.jsx          # Responsive Navigation + Search
│       │   ├── Footer.jsx          # Footer with Links
│       │   ├── ProductCard.jsx     # Product Display Card
│       │   ├── SearchBar.jsx       # Search with Basic/Semantic Toggle
│       │   └── LoadingSpinner.jsx  # Loading States
│       └── pages/                  # Page Components (9 pages)
│           ├── HomePage.jsx        # หน้าแรก + Hero + สถิติ
│           ├── ProductListPage.jsx # รายการสินค้า + ตัวกรอง
│           ├── ProductDetailPage.jsx # รายละเอียดสินค้า + รีวิว
│           ├── EnterprisesPage.jsx  # รายการวิสาหกิจชุมชน
│           ├── EnterpriseDetailPage.jsx # รายละเอียดวิสาหกิจ
│           ├── SearchResultPage.jsx # ผลการค้นหา + SPARQL Viewer
│           ├── AnalyticsPage.jsx   # แดชบอร์ดวิเคราะห์ข้อมูล
│           ├── OntologyViewerPage.jsx # แสดงโครงสร้าง Ontology
│           └── AboutPage.jsx       # เกี่ยวกับระบบ
│
├── evaluation/                     # Evaluation Layer
│   ├── test_queries.json           # ชุดคำถามทดสอบ 20 ข้อ + Ground Truth
│   ├── evaluation.py               # Evaluation Script (P/R/F1/RT)
│   ├── survey_form.html            # แบบสอบถาม Likert Scale 5 ระดับ
│   └── results/                    # ผลลัพธ์การประเมิน
│       ├── evaluation_results.csv  # ตารางผลลัพธ์ CSV
│       ├── evaluation_results.json # ผลลัพธ์ JSON พร้อมรายละเอียด
│       ├── precision_recall_chart.png
│       ├── response_time_chart.png
│       ├── response_time_boxplot.png
│       └── comparison_chart.png
│
└── docker/                         # Docker Configuration
    ├── Dockerfile.backend          # Backend Image (Python 3.9-slim)
    ├── Dockerfile.frontend         # Frontend Image (Node 20 build + Nginx)
    ├── nginx.conf                  # Nginx SPA Configuration
    └── init_data.sh                # Fuseki Data Loading Script
```

---

## การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น

- **Docker** >= 20.0 และ **Docker Compose** >= 2.0
- (สำหรับ Development) Python 3.9+, Node.js 20+

### วิธีที่ 1: Docker Compose (แนะนำ)

```bash
# 1. Clone โปรเจกต์
git clone <repository-url>
cd sakon-ce-ontology

# 2. รันทั้งระบบด้วยคำสั่งเดียว
docker compose up -d

# 3. รอประมาณ 30-60 วินาทีให้ระบบเริ่มต้น

# 4. ตรวจสอบสถานะ
docker compose ps

# 5. ดู log การโหลดข้อมูล
docker compose logs fuseki-init
```

**เข้าใช้งาน:**

| บริการ | URL | รายละเอียด |
|---|---|---|
| Frontend (เว็บหลัก) | http://localhost:3000 | เว็บแอปพลิเคชันหลัก |
| Backend API | http://localhost:5050/api | REST API Endpoints |
| Fuseki Admin | http://localhost:3030 | SPARQL Endpoint (admin / sakon_ce_admin) |
| แบบสอบถาม | http://localhost:3000/survey.html | แบบประเมินความพึงพอใจ |

**คำสั่งที่ใช้บ่อย:**

```bash
# ตรวจสอบสถานะทุก container
docker compose ps

# ดู logs ของทุก service
docker compose logs -f

# ดู logs เฉพาะ backend
docker compose logs -f backend

# หยุดระบบ (เก็บข้อมูลไว้)
docker compose down

# หยุดระบบ + ลบข้อมูลทั้งหมด
docker compose down -v

# Build ใหม่ (หลังแก้ไขโค้ด)
docker compose up -d --build
```

### วิธีที่ 2: รันแยกส่วน (สำหรับ Development)

#### ขั้นตอนที่ 1: เริ่ม Apache Jena Fuseki

```bash
# รัน Fuseki container
docker run -d --name fuseki -p 3030:3030 \
  -e ADMIN_PASSWORD=sakon_ce_admin \
  stain/jena-fuseki

# สร้าง dataset
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/$/datasets \
  -d "dbName=sakon_ce&dbType=tdb2"

# โหลด OWL Schema
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/sakon_ce/data \
  -H "Content-Type: application/rdf+xml" \
  --data-binary @ontology/sakon_ce_ontology.owl

# โหลด Turtle Data
curl -u admin:sakon_ce_admin -X POST http://localhost:3030/sakon_ce/data \
  -H "Content-Type: text/turtle" \
  --data-binary @ontology/sample_data.ttl
```

#### ขั้นตอนที่ 2: เริ่ม Backend API

```bash
cd backend
pip install -r requirements.txt
python app.py
# Backend จะรันที่ http://localhost:5050
```

#### ขั้นตอนที่ 3: เริ่ม Frontend

```bash
cd frontend
npm install
npm start
# Frontend จะรันที่ http://localhost:3000 (development mode)
```

---

## ข้อมูลในระบบ

### สรุปข้อมูลทั้งหมด

| ประเภทข้อมูล | จำนวน |
|---|---|
| วิสาหกิจชุมชน (CommunityEnterprise) | 24 แห่ง |
| ผลิตภัณฑ์อาหาร (FoodProduct) | 26 รายการ |
| หมวดหมู่ (FoodCategory) | 11 หมวด |
| วัตถุดิบ (Ingredient) | 65 รายการ |
| การรับรองมาตรฐาน (Certification) | 9 มาตรฐาน |
| ช่องทางจำหน่าย (SalesChannel) | 16 ช่องทาง |
| อำเภอ (District) | 12 อำเภอ |
| ตำบล (SubDistrict) | 23 ตำบล |
| รีวิว (Review) | 15 รีวิว |
| **รวม RDF Triples** | **1,674 triples** |

### หมวดหมู่ผลิตภัณฑ์

| หมวดหมู่ | ชื่อภาษาอังกฤษ | จำนวนสินค้า |
|---|---|---|
| แปรรูปเนื้อสัตว์ | ProcessedMeat | 5 |
| ขนม/ของว่าง | Snack | 4 |
| เครื่องปรุงรส | Seasoning | 4 |
| ผลิตภัณฑ์จากข้าว | RiceProduct | 3 |
| อาหารหมักดอง | FermentedFood | 3 |
| เครื่องดื่ม | Beverage | 2 |
| เบเกอรี่/ขนมอบ | Bakery | 2 |
| เครื่องดื่มแอลกอฮอล์ | AlcoholicBeverage | 1 |
| อาหารจากแมลง | InsectFood | 1 |
| ผลิตผลสด | FreshProduce | 1 |

### ตัวอย่างผลิตภัณฑ์

| ผลิตภัณฑ์ | หมวดหมู่ | ราคา (บาท) | วิสาหกิจ |
|---|---|---|---|
| กุนเชียงปลา | แปรรูปเนื้อสัตว์ | 80 | กลุ่มแปรรูปปลาบ้านท่าสะอาด |
| ข้าวขาวดอกมะลิ 105 อินทรีย์กล้อง | ผลิตภัณฑ์จากข้าว | 50 | กลุ่มข้าวอินทรีย์บ้านนาดี |
| น้ำพริกปลาร้าสับ | เครื่องปรุงรส | 45 | กลุ่มแม่บ้านเกษตรกรบ้านโนนสวรรค์ |
| ไส้กรอกอีสาน | แปรรูปเนื้อสัตว์ | 60 | กลุ่มแปรรูปเนื้อสัตว์บ้านหนองแวง |

---

## Ontology Schema

### ข้อมูลทั่วไป

- **Namespace:** `http://sakon-ce.example.org/ontology#`
- **Prefix:** `sce:`
- **รูปแบบ Schema:** OWL 2 (RDF/XML)
- **รูปแบบ Instance Data:** Turtle (.ttl)

### โครงสร้างคลาสหลัก (Class Hierarchy)

```
owl:Thing
├── sce:CommunityEnterprise          # วิสาหกิจชุมชน
├── sce:FoodProduct                  # ผลิตภัณฑ์อาหาร
│   ├── sce:ProcessedMeatProduct     #   แปรรูปเนื้อสัตว์
│   ├── sce:RiceBasedProduct         #   ผลิตภัณฑ์จากข้าว
│   ├── sce:SeasoningProduct         #   เครื่องปรุงรส
│   ├── sce:SnackProduct             #   ขนม/ของว่าง
│   ├── sce:BeverageProduct          #   เครื่องดื่ม
│   ├── sce:FermentedProduct         #   อาหารหมักดอง
│   ├── sce:BakeryProduct            #   เบเกอรี่
│   └── sce:InsectFoodProduct        #   อาหารจากแมลง
├── sce:FoodCategory                 # หมวดหมู่อาหาร
├── sce:Ingredient                   # วัตถุดิบ
├── sce:Certification                # การรับรองมาตรฐาน
├── sce:SalesChannel                 # ช่องทางจำหน่าย
├── sce:Location                     # ที่ตั้ง
│   ├── sce:Province                 #   จังหวัด
│   ├── sce:District                 #   อำเภอ
│   └── sce:SubDistrict              #   ตำบล
├── sce:CustomerSegment              # กลุ่มลูกค้าเป้าหมาย
├── sce:ProductionProcess            # กระบวนการผลิต
└── sce:Review                       # รีวิว/ความคิดเห็น
```

### Object Properties (ความสัมพันธ์ระหว่างคลาส)

| Property | Domain | Range | คำอธิบาย |
|---|---|---|---|
| `producedBy` | FoodProduct | CommunityEnterprise | ผลิตโดย |
| `hasCategory` | FoodProduct | FoodCategory | หมวดหมู่ |
| `hasIngredient` | FoodProduct | Ingredient | วัตถุดิบ |
| `hasCertification` | FoodProduct | Certification | การรับรอง |
| `soldVia` | FoodProduct | SalesChannel | ช่องทางจำหน่าย |
| `targetsCustomer` | FoodProduct | CustomerSegment | กลุ่มเป้าหมาย |
| `locatedIn` | CommunityEnterprise | Location | ที่ตั้ง |
| `hasReview` | FoodProduct | Review | รีวิว |
| `hasProductionProcess` | FoodProduct | ProductionProcess | กระบวนการผลิต |

### Datatype Properties (คุณสมบัติข้อมูล)

| Property | Domain | Datatype | คำอธิบาย |
|---|---|---|---|
| `hasName` | Thing | xsd:string | ชื่อ |
| `hasPrice` | FoodProduct | xsd:decimal | ราคา (บาท) |
| `hasDescription` | FoodProduct | xsd:string | คำอธิบาย |
| `hasRating` | Review | xsd:decimal | คะแนน (1-5) |
| `hasCapacity` | CommunityEnterprise | xsd:string | กำลังการผลิต |
| `hasMemberCount` | CommunityEnterprise | xsd:integer | จำนวนสมาชิก |

---

## API Endpoints

### ผลิตภัณฑ์ (Products)

| Method | Endpoint | คำอธิบาย | ตัวอย่าง |
|---|---|---|---|
| GET | `/api/products` | รายการผลิตภัณฑ์ทั้งหมด | `/api/products` |
| GET | `/api/products?category=<id>` | กรองตามหมวดหมู่ | `/api/products?category=Snack` |
| GET | `/api/products?min_price=<n>&max_price=<n>` | กรองตามช่วงราคา | `/api/products?max_price=50` |
| GET | `/api/products/<id>` | รายละเอียดผลิตภัณฑ์ | `/api/products/FishSausage` |

### วิสาหกิจชุมชน (Enterprises)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/enterprises` | รายการวิสาหกิจทั้งหมด |
| GET | `/api/enterprises/<id>` | รายละเอียดวิสาหกิจพร้อมผลิตภัณฑ์ |

### ค้นหา (Search)

| Method | Endpoint | คำอธิบาย | ตัวอย่าง |
|---|---|---|---|
| GET | `/api/search?q=<คำค้น>` | ค้นหาพื้นฐาน (text matching) | `/api/search?q=ข้าว` |
| GET | `/api/search/semantic?q=<คำค้น>` | ค้นหาเชิงความหมาย (NL → SPARQL) | `/api/search/semantic?q=สุขภาพ` |
| GET | `/api/search/certification?q=<คำค้น>` | ค้นหาตามมาตรฐาน | `/api/search/certification?q=อย.` |

### หมวดหมู่ (Categories)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/categories` | รายการหมวดหมู่ทั้งหมดพร้อมจำนวนสินค้า |
| GET | `/api/categories/<id>/products` | ผลิตภัณฑ์ในหมวดหมู่ |

### วิเคราะห์ข้อมูล (Analytics)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/analytics/overview` | ภาพรวมระบบ (จำนวนสินค้า, วิสาหกิจ, หมวดหมู่) |
| GET | `/api/analytics/price-by-category` | ราคาเฉลี่ยตามหมวดหมู่ |
| GET | `/api/analytics/channels` | สถิติช่องทางจำหน่าย |
| GET | `/api/analytics/certifications` | สถิติการรับรองมาตรฐาน |
| GET | `/api/analytics/top-rated` | ผลิตภัณฑ์คะแนนรีวิวสูงสุด |
| GET | `/api/analytics/shared-ingredients` | วัตถุดิบที่ใช้ร่วมกัน |

### อื่นๆ

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | ตรวจสอบสถานะระบบ + จำนวน triples |
| GET | `/api/recommendations/<id>/similar` | แนะนำผลิตภัณฑ์ที่คล้ายกัน |
| POST | `/api/survey` | ส่งแบบสอบถามความพึงพอใจ |
| GET | `/api/survey/results` | ผลสรุปแบบสอบถาม |

### ตัวอย่างการเรียกใช้ API

```bash
# ตรวจสอบสถานะระบบ
curl http://localhost:5050/api/health

# ดูผลิตภัณฑ์ทั้งหมด
curl http://localhost:5050/api/products

# ค้นหาเชิงความหมาย (ต้อง URL-encode ภาษาไทย)
curl "http://localhost:5050/api/search/semantic?q=%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B8%A0%E0%B8%B2%E0%B8%9E"

# ดูรายละเอียดผลิตภัณฑ์
curl http://localhost:5050/api/products/FishSausage

# ดูสถิติราคาตามหมวดหมู่
curl http://localhost:5050/api/analytics/price-by-category
```

---

## การค้นหาเชิงความหมาย

ระบบรองรับการแปลงคำค้นหาภาษาธรรมชาติภาษาไทยเป็น SPARQL Query อัตโนมัติ โดยใช้ Keyword-based Intent Detection รองรับ **14 intents**:

### ตาราง Intents ที่รองรับ

| # | Intent | คำค้นหาตัวอย่าง | SPARQL Pattern | ผลลัพธ์ |
|---|---|---|---|---|
| 1 | สุขภาพ | "สุขภาพ", "healthy" | `targetsCustomer = HealthConscious` | 7 |
| 2 | ของฝาก | "ของฝาก", "souvenir" | `targetsCustomer = Tourist` | 15 |
| 3 | อินทรีย์ | "ออร์แกนิก", "ปลอดสาร" | `hasCertification = Organic` | - |
| 4 | คุณภาพสูง | "OTOP 5 ดาว", "อย." | `hasCertification = OTOP + FDA` | - |
| 5 | ออนไลน์ | "ซื้อออนไลน์", "shopee" | `soldVia = Online Channels` | 2 |
| 6 | ราคาถูก | "ราคาถูก", "ไม่เกิน 50" | `hasPrice <= 50` | 14 |
| 7 | ราคาสูง | "พรีเมียม", "ราคาสูง" | `hasPrice >= 100` | 2 |
| 8 | ขนม | "ขนม", "ของว่าง" | `hasCategory = Snack` | 4 |
| 9 | เครื่องดื่ม | "น้ำดื่ม", "เครื่องดื่ม" | `hasCategory = Beverage` | 2 |
| 10 | ข้าว | "ข้าว", "ข้าวอินทรีย์" | `hasCategory = RiceProduct` | 3 |
| 11 | เครื่องปรุง | "น้ำพริก", "ปลาร้า" | `hasCategory = Seasoning` | 4 |
| 12 | หมักดอง | "ปลาส้ม", "ไข่เค็ม" | `hasCategory = FermentedFood` | 3 |
| 13 | แมลง | "จิ้งหรีด", "โปรตีนแมลง" | `hasCategory = InsectFood` | 1 |
| 14 | อำเภอ | "วานรนิวาส", "พังโคน" | `locatedIn = District` | ขึ้นกับอำเภอ |

### หลักการทำงาน

```
ผู้ใช้พิมพ์: "อยากได้ของฝากสกลนคร"
                    │
                    ▼
        ┌──────────────────────┐
        │  Keyword Matching    │  จับคู่คำว่า "ของฝาก"
        │  "ของฝาก" → gift     │
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  Generate SPARQL     │  สร้าง query:
        │  SELECT ?product ... │  ?product sce:targetsCustomer
        │  WHERE { ... }       │            sce:Tourist
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  Execute on Fuseki   │  ส่ง SPARQL ไปยัง
        │  via SPARQLWrapper   │  Fuseki SPARQL Endpoint
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │  Return JSON Results │  15 ผลิตภัณฑ์
        └──────────────────────┘
```

---

## หน้าจอเว็บแอปพลิเคชัน

ระบบ Frontend ประกอบด้วย 9 หน้าจอหลัก:

| # | หน้าจอ | Route | คำอธิบาย |
|---|---|---|---|
| 1 | หน้าแรก | `/` | Hero Section, ค้นหา, หมวดหมู่, สินค้าแนะนำ, สถิติ |
| 2 | รายการผลิตภัณฑ์ | `/products` | แสดงสินค้าทั้งหมด + ตัวกรอง (หมวดหมู่, ช่วงราคา, เรียงลำดับ) |
| 3 | รายละเอียดผลิตภัณฑ์ | `/products/:id` | ข้อมูลสินค้า, วัตถุดิบ, กระบวนการผลิต, มาตรฐาน, รีวิว, สินค้าคล้ายกัน |
| 4 | รายการวิสาหกิจ | `/enterprises` | วิสาหกิจชุมชนทั้งหมด + กรองตามอำเภอ |
| 5 | รายละเอียดวิสาหกิจ | `/enterprises/:id` | ข้อมูลวิสาหกิจ + รายการผลิตภัณฑ์ |
| 6 | ผลการค้นหา | `/search` | ผลค้นหาแบบพื้นฐาน/เชิงความหมาย + SPARQL Query Viewer |
| 7 | แดชบอร์ดวิเคราะห์ | `/analytics` | กราฟราคาตามหมวด, แผนภูมิช่องทาง, มาตรฐาน, Top Rated |
| 8 | โครงสร้าง Ontology | `/ontology` | แสดง Class Hierarchy, Properties, ตัวอย่าง Triples |
| 9 | เกี่ยวกับระบบ | `/about` | คำอธิบายโปรเจกต์, สถาปัตยกรรม, เทคโนโลยี |

### ธีมสี (Color Theme)

| สี | Hex Code | การใช้งาน |
|---|---|---|
| Primary (เขียว) | `#065F46` | ส่วนหัว, ปุ่มหลัก, ลิงก์ |
| Secondary (ส้ม) | `#EA580C` | ปุ่มเน้น, ราคา, badge |
| Accent (ทอง) | `#D97706` | ไอคอน, ดาวรีวิว |
| Background (ครีม) | `#FFF7ED` | พื้นหลัง |

---

## การประเมินผลระบบ

### วิธีรันการประเมิน

```bash
# ต้องมี Backend API รันอยู่ที่ port 5050

# ติดตั้ง dependencies
pip install matplotlib numpy requests

# รันการประเมิน
cd evaluation
python evaluation.py --api-url http://localhost:5050/api --output results/
```

### ชุดคำถามทดสอบ

ระบบใช้ชุดคำถาม 20 ข้อ (จากไฟล์ `test_queries.json`):

- **10 คำถามพื้นฐาน (Basic Search):** ค้นหาด้วยข้อความ + กรองหมวดหมู่
- **10 คำถามเชิงความหมาย (Semantic Search):** ค้นหาด้วยภาษาธรรมชาติ

แต่ละคำถามมี **Ground Truth** (คำตอบที่ถูกต้อง) สำหรับเปรียบเทียบ

### เมตริกที่ใช้วัดผล

| เมตริก | สูตร | คำอธิบาย |
|---|---|---|
| **Precision** | \|relevant ∩ retrieved\| / \|retrieved\| | ความแม่นยำ: สัดส่วนผลที่ถูกต้องจากผลที่ค้นพบ |
| **Recall** | \|relevant ∩ retrieved\| / \|relevant\| | ความครบถ้วน: สัดส่วนผลที่ค้นพบจากผลที่ควรค้นพบ |
| **F1-Score** | 2 × (P × R) / (P + R) | ค่าเฉลี่ยฮาร์โมนิกของ Precision และ Recall |
| **Response Time** | วัด 5 รอบ/คำถาม | เวลาตอบสนองเฉลี่ย (ms) |

### ผลการประเมิน

ทดสอบ 20 คำถาม, 5 รอบต่อคำถาม:

| เมตริก | รวมทั้งหมด (20 queries) | Basic Search (10) | Semantic Search (10) |
|---|---|---|---|
| **Precision** | **1.0000** | 1.0000 | 1.0000 |
| **Recall** | **1.0000** | 1.0000 | 1.0000 |
| **F1-Score** | **1.0000** | 1.0000 | 1.0000 |
| **Avg Response Time** | **11.30 ms** | 12.67 ms | 9.93 ms |

### ไฟล์ผลลัพธ์

| ไฟล์ | คำอธิบาย |
|---|---|
| `results/evaluation_results.csv` | ตารางผลลัพธ์รายข้อ (CSV) |
| `results/evaluation_results.json` | ผลลัพธ์แบบละเอียดพร้อม metadata (JSON) |
| `results/precision_recall_chart.png` | กราฟ Precision / Recall / F1 ทุกคำถาม |
| `results/response_time_chart.png` | กราฟ Response Time ทุกคำถาม |
| `results/response_time_boxplot.png` | Box Plot เปรียบเทียบ Basic vs Semantic |
| `results/comparison_chart.png` | กราฟเปรียบเทียบประสิทธิภาพ Basic vs Semantic |

---

## แบบสอบถามความพึงพอใจ

แบบสอบถามประเมินความพึงพอใจของผู้ใช้ระบบ ใช้ **Likert Scale 5 ระดับ** (1 = น้อยที่สุด ถึง 5 = มากที่สุด)

### โครงสร้างแบบสอบถาม

| ส่วนที่ | หัวข้อ | จำนวนข้อ |
|---|---|---|
| 1 | ด้านการใช้งาน (Usability) | 5 ข้อ |
| 2 | ด้านความถูกต้องของข้อมูล (Accuracy) | 5 ข้อ |
| 3 | ด้านประโยชน์ (Usefulness) | 5 ข้อ |
| 4 | ด้านการออกแบบ (Design) | 3 ข้อ |
| 5 | ความพึงพอใจโดยรวม (Overall Satisfaction) | 2 ข้อ |
| | **รวม** | **20 ข้อ** |

### การเข้าถึงแบบสอบถาม

- **ผ่าน Docker:** http://localhost:3000/survey.html
- **เปิดไฟล์โดยตรง:** `evaluation/survey_form.html`
- ข้อมูลที่ส่งจะถูกบันทึกผ่าน API `POST /api/survey`
- ดูผลสรุปได้ที่ `GET /api/survey/results`

---

## Docker Services

### รายละเอียด Docker Compose

| Service | Image | Port | คำอธิบาย |
|---|---|---|---|
| `fuseki` | stain/jena-fuseki | 3030 | Triple Store + SPARQL Endpoint |
| `fuseki-init` | curlimages/curl | - | โหลดข้อมูล OWL/TTL เข้า Fuseki (ทำครั้งเดียว) |
| `backend` | python:3.9-slim | 5050 | Flask REST API |
| `frontend` | node:20 → nginx:alpine | 3000 | React SPA (multi-stage build) |

### Health Checks

- **Fuseki:** `curl http://localhost:3030/$/ping` (ทุก 10 วินาที)
- **Backend:** `curl http://localhost:5050/api/health` (ทุก 10 วินาที)
- **Frontend:** `curl http://localhost:3000/nginx-health`

### Volumes

- `fuseki_data` - เก็บข้อมูล TDB2 ของ Fuseki (persist ข้ามการ restart)
