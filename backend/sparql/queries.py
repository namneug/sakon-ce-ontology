# SPARQL Queries สำหรับ Backend API
# รวม query templates ที่ใช้บ่อยทั้งหมด

# === ผลิตภัณฑ์ (Products) ===

GET_ALL_PRODUCTS = """
SELECT ?product ?name ?price ?description ?weight ?categoryName ?enterpriseName ?shelfLife
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL { ?product sce:hasWeight ?weight }
    OPTIONAL { ?product sce:hasShelfLifeDays ?shelfLife }
    OPTIONAL {
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }
    OPTIONAL {
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }
}
ORDER BY ?name
"""

GET_PRODUCT_BY_ID = """
SELECT ?name ?price ?description ?weight ?categoryName ?enterpriseName
       ?enterpriseDesc ?shelfLife
WHERE {{
    sce:{product_id} a sce:FoodProduct ;
                     sce:hasName ?name ;
                     sce:hasPrice ?price .
    OPTIONAL {{ sce:{product_id} sce:hasDescription ?description }}
    OPTIONAL {{ sce:{product_id} sce:hasWeight ?weight }}
    OPTIONAL {{ sce:{product_id} sce:hasShelfLifeDays ?shelfLife }}
    OPTIONAL {{
        sce:{product_id} sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }}
    OPTIONAL {{
        sce:{product_id} sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
        OPTIONAL {{ ?enterprise sce:hasDescription ?enterpriseDesc }}
    }}
}}
"""

GET_PRODUCT_INGREDIENTS = """
SELECT ?ingredientName ?ingredientDesc
WHERE {{
    sce:{product_id} sce:hasIngredient ?ingredient .
    ?ingredient sce:hasName ?ingredientName .
    OPTIONAL {{ ?ingredient sce:hasDescription ?ingredientDesc }}
}}
ORDER BY ?ingredientName
"""

GET_PRODUCT_CERTIFICATIONS = """
SELECT ?certName ?certDesc
WHERE {{
    sce:{product_id} sce:hasCertification ?cert .
    ?cert sce:hasName ?certName .
    OPTIONAL {{ ?cert sce:hasDescription ?certDesc }}
}}
"""

GET_PRODUCT_CHANNELS = """
SELECT ?channelName ?channelDesc
WHERE {{
    sce:{product_id} sce:soldVia ?channel .
    ?channel sce:hasName ?channelName .
    OPTIONAL {{ ?channel sce:hasDescription ?channelDesc }}
}}
"""

GET_PRODUCT_CUSTOMERS = """
SELECT ?customerName ?customerDesc
WHERE {{
    sce:{product_id} sce:targetsCustomer ?customer .
    ?customer sce:hasName ?customerName .
    OPTIONAL {{ ?customer sce:hasDescription ?customerDesc }}
}}
"""

GET_PRODUCT_REVIEWS = """
SELECT ?reviewerName ?rating ?reviewDesc
WHERE {{
    sce:{product_id} sce:hasReview ?review .
    ?review sce:hasName ?reviewerName ;
            sce:hasRating ?rating .
    OPTIONAL {{ ?review sce:hasDescription ?reviewDesc }}
}}
ORDER BY DESC(?rating)
"""

GET_PRODUCT_PROCESS = """
SELECT ?processName ?processDesc
WHERE {{
    sce:{product_id} sce:hasProductionProcess ?process .
    ?process sce:hasName ?processName .
    OPTIONAL {{ ?process sce:hasDescription ?processDesc }}
}}
"""

GET_PRODUCTS_BY_CATEGORY = """
SELECT ?product ?name ?price ?description ?enterpriseName
WHERE {{
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:belongsToCategory sce:{category_id} .
    OPTIONAL {{ ?product sce:hasDescription ?description }}
    OPTIONAL {{
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }}
}}
ORDER BY ?name
"""

GET_PRODUCTS_BY_PRICE_RANGE = """
SELECT ?product ?name ?price ?categoryName ?enterpriseName
WHERE {{
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    FILTER (?price >= {min_price} && ?price <= {max_price})
    OPTIONAL {{
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }}
    OPTIONAL {{
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }}
}}
ORDER BY ?price
"""

# === วิสาหกิจชุมชน (Enterprises) ===

GET_ALL_ENTERPRISES = """
SELECT ?enterprise ?name ?description ?locationName
WHERE {
    ?enterprise a sce:CommunityEnterprise ;
                sce:hasName ?name .
    OPTIONAL { ?enterprise sce:hasDescription ?description }
    OPTIONAL {
        ?enterprise sce:locatedIn ?location .
        ?location sce:hasName ?locationName .
    }
}
ORDER BY ?name
"""

GET_ENTERPRISE_BY_ID = """
SELECT ?name ?description ?locationName ?districtName ?phone
WHERE {{
    sce:{enterprise_id} a sce:CommunityEnterprise ;
                        sce:hasName ?name .
    OPTIONAL {{ sce:{enterprise_id} sce:hasDescription ?description }}
    OPTIONAL {{
        sce:{enterprise_id} sce:locatedIn ?location .
        ?location sce:hasName ?locationName .
        OPTIONAL {{
            ?location sce:locatedIn ?district .
            ?district sce:hasName ?districtName .
        }}
    }}
    OPTIONAL {{
        sce:{enterprise_id} sce:hasContactInfo ?contact .
        ?contact sce:hasPhoneNumber ?phone .
    }}
}}
"""

GET_ENTERPRISE_PRODUCTS = """
SELECT ?product ?productName ?price ?categoryName
WHERE {{
    sce:{enterprise_id} sce:hasProduct ?product .
    ?product sce:hasName ?productName ;
             sce:hasPrice ?price .
    OPTIONAL {{
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }}
}}
ORDER BY ?productName
"""

# === หมวดหมู่ (Categories) ===

GET_ALL_CATEGORIES = """
SELECT ?category ?name ?description (COUNT(?product) AS ?productCount)
WHERE {
    ?category a sce:ProductCategory ;
              sce:hasName ?name .
    OPTIONAL { ?category sce:hasDescription ?description }
    OPTIONAL {
        ?product a sce:FoodProduct ;
                 sce:belongsToCategory ?category .
    }
}
GROUP BY ?category ?name ?description
ORDER BY ?name
"""

# === วิเคราะห์ข้อมูล (Analytics) ===

ANALYTICS_PRICE_BY_CATEGORY = """
SELECT ?categoryName
       (COUNT(?product) AS ?count)
       (AVG(?price) AS ?avgPrice)
       (MIN(?price) AS ?minPrice)
       (MAX(?price) AS ?maxPrice)
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasPrice ?price ;
             sce:belongsToCategory ?category .
    ?category sce:hasName ?categoryName .
}
GROUP BY ?categoryName
ORDER BY DESC(?count)
"""

ANALYTICS_CHANNELS = """
SELECT ?channelName (COUNT(?product) AS ?productCount)
WHERE {
    ?product a sce:FoodProduct ;
             sce:soldVia ?channel .
    ?channel sce:hasName ?channelName .
}
GROUP BY ?channelName
ORDER BY DESC(?productCount)
"""

ANALYTICS_CERTIFICATIONS = """
SELECT ?certName (COUNT(?product) AS ?productCount)
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasCertification ?cert .
    ?cert sce:hasName ?certName .
}
GROUP BY ?certName
ORDER BY DESC(?productCount)
"""

ANALYTICS_ENTERPRISE_PRODUCTS = """
SELECT ?enterpriseName (COUNT(?product) AS ?productCount)
WHERE {
    ?enterprise a sce:CommunityEnterprise ;
                sce:hasName ?enterpriseName ;
                sce:hasProduct ?product .
}
GROUP BY ?enterpriseName
ORDER BY DESC(?productCount)
"""

ANALYTICS_CUSTOMER_SEGMENTS = """
SELECT ?customerName (COUNT(?product) AS ?productCount)
WHERE {
    ?product a sce:FoodProduct ;
             sce:targetsCustomer ?customer .
    ?customer sce:hasName ?customerName .
}
GROUP BY ?customerName
ORDER BY DESC(?productCount)
"""

ANALYTICS_TOP_RATED = """
SELECT ?productName ?price (AVG(?rating) AS ?avgRating) (COUNT(?review) AS ?reviewCount)
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

# === ค้นหา (Search) ===

SEARCH_PRODUCTS_BY_TEXT = """
SELECT ?product ?name ?price ?categoryName ?enterpriseName ?description
WHERE {{
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    OPTIONAL {{ ?product sce:hasDescription ?description }}
    OPTIONAL {{
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }}
    OPTIONAL {{
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }}
    FILTER (
        CONTAINS(LCASE(?name), LCASE("{search_term}"))
        || CONTAINS(LCASE(COALESCE(?description, "")), LCASE("{search_term}"))
    )
}}
ORDER BY ?name
"""

SEARCH_BY_CERTIFICATION = """
SELECT ?product ?name ?price ?certName ?enterpriseName
WHERE {{
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:hasCertification ?cert .
    ?cert sce:hasName ?certName .
    FILTER (CONTAINS(LCASE(?certName), LCASE("{search_term}")))
    OPTIONAL {{
        ?product sce:producedBy ?enterprise .
        ?enterprise sce:hasName ?enterpriseName .
    }}
}}
ORDER BY ?name
"""

# === Semantic Queries ===

SEMANTIC_HEALTH_PRODUCTS = """
SELECT ?product ?name ?price ?description ?categoryName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:targetsCustomer sce:HealthConscious .
    OPTIONAL { ?product sce:hasDescription ?description }
    OPTIONAL {
        ?product sce:belongsToCategory ?category .
        ?category sce:hasName ?categoryName .
    }
}
ORDER BY ?name
"""

SEMANTIC_GIFT_PRODUCTS = """
SELECT DISTINCT ?product ?name ?price ?categoryName ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price .
    { ?product sce:targetsCustomer sce:GiftBuyer }
    UNION
    { ?product sce:targetsCustomer sce:Tourist }
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

SEMANTIC_ORGANIC_PRODUCTS = """
SELECT ?product ?name ?price ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:producedBy ?enterprise .
    ?enterprise sce:hasName ?enterpriseName .
    {
        ?product sce:hasCertification sce:OrganicThailand .
    } UNION {
        ?product sce:hasDescription ?desc .
        FILTER (CONTAINS(?desc, "อินทรีย์"))
    }
}
ORDER BY ?name
"""

SEMANTIC_PREMIUM_PRODUCTS = """
SELECT ?product ?name ?price ?enterpriseName
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:hasCertification sce:FDA_Certificate ;
             sce:producedBy ?enterprise .
    ?enterprise sce:hasName ?enterpriseName .
    {
        ?product sce:hasCertification sce:OTOP_4Star .
    } UNION {
        ?product sce:hasCertification sce:OTOP_5Star .
    }
}
ORDER BY ?name
"""

SEMANTIC_ONLINE_PRODUCTS = """
SELECT ?product ?name ?price ?enterpriseName
       (GROUP_CONCAT(DISTINCT ?channelName; separator=", ") AS ?onlineChannels)
WHERE {
    ?product a sce:FoodProduct ;
             sce:hasName ?name ;
             sce:hasPrice ?price ;
             sce:soldVia ?channel ;
             sce:producedBy ?enterprise .
    ?enterprise sce:hasName ?enterpriseName .
    ?channel sce:hasName ?channelName .
    FILTER (
        ?channel = sce:OnlineFacebook ||
        ?channel = sce:OnlineLINE ||
        ?channel = sce:OnlineShopee
    )
}
GROUP BY ?product ?name ?price ?enterpriseName
ORDER BY ?name
"""

SEMANTIC_SIMILAR_PRODUCTS = """
SELECT ?relatedProduct ?relatedName ?relatedPrice ?categoryName
WHERE {{
    sce:{product_id} sce:belongsToCategory ?category .
    ?relatedProduct a sce:FoodProduct ;
                    sce:belongsToCategory ?category ;
                    sce:hasName ?relatedName ;
                    sce:hasPrice ?relatedPrice .
    ?category sce:hasName ?categoryName .
    FILTER (?relatedProduct != sce:{product_id})
}}
ORDER BY ?relatedName
"""

SEMANTIC_SHARED_INGREDIENTS = """
SELECT ?product1Name ?product2Name (COUNT(?ingredient) AS ?sharedCount)
WHERE {
    ?p1 a sce:FoodProduct ;
        sce:hasName ?product1Name ;
        sce:hasIngredient ?ingredient .
    ?p2 a sce:FoodProduct ;
        sce:hasName ?product2Name ;
        sce:hasIngredient ?ingredient .
    FILTER (STR(?p1) < STR(?p2))
}
GROUP BY ?product1Name ?product2Name
HAVING (COUNT(?ingredient) >= 2)
ORDER BY DESC(?sharedCount)
LIMIT 20
"""

SEMANTIC_PRODUCTS_BY_DISTRICT = """
SELECT ?productName ?price ?enterpriseName ?districtName
WHERE {{
    ?product a sce:FoodProduct ;
             sce:hasName ?productName ;
             sce:hasPrice ?price ;
             sce:producedBy ?enterprise .
    ?enterprise sce:hasName ?enterpriseName ;
                sce:locatedIn ?subDistrict .
    ?subDistrict sce:locatedIn sce:{district_id} .
    sce:{district_id} sce:hasName ?districtName .
}}
ORDER BY ?productName
"""
