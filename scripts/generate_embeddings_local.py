#!/usr/bin/env python3
"""
Generate embeddings for exported products and upload to Qdrant
This connects to LOCAL Qdrant instance
"""
import requests
import json
import csv
import os
from typing import List, Dict
import hashlib

# Configuration
QDRANT_URL = "http://localhost:6333"
EMBEDDING_SERVICE_URL = "http://localhost:8001"
COLLECTION_NAME = "vayva_products_local"
VECTOR_SIZE = 1024  # BGE-M3 output dimension
DATA_DIR = "/tmp/vayva_test_data"

def check_services():
    """Verify Qdrant and Embedding Service are running"""
    print("=" * 60)
    print("🔍 Checking Service Health")
    print("=" * 60)
    
    # Check Qdrant
    try:
        response = requests.get(f"{QDRANT_URL}/", timeout=5)
        if response.status_code == 200:
            print("✓ Qdrant is healthy")
        else:
            print(f"✗ Qdrant returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Qdrant is not accessible: {e}")
        return False
    
    # Check Embedding Service
    try:
        response = requests.get(f"{EMBEDDING_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Embedding Service is healthy")
        else:
            print(f"✗ Embedding Service returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Embedding Service is not accessible: {e}")
        return False
    
    print()
    return True

def create_collection():
    """Create Qdrant collection if it doesn't exist"""
    print(f"ℹ Creating/verifying collection: {COLLECTION_NAME}")
    
    # Try to get existing collection
    try:
        response = requests.get(f"{QDRANT_URL}/collections/{COLLECTION_NAME}")
        if response.status_code == 200:
            print(f"⚠ Collection '{COLLECTION_NAME}' already exists. Deleting...")
            delete_response = requests.delete(f"{QDRANT_URL}/collections/{COLLECTION_NAME}")
            if delete_response.status_code == 200:
                print(f"✓ Deleted existing collection")
    except Exception as e:
        pass
    
    # Create new collection
    collection_config = {
        "vectors": {
            "size": VECTOR_SIZE,
            "distance": "Cosine"
        },
        "optimizers_config": {
            "indexing_threshold": 20000
        }
    }
    
    response = requests.put(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}",
        json=collection_config
    )
    
    if response.status_code == 200:
        print(f"✓ Created collection '{COLLECTION_NAME}' with vector size {VECTOR_SIZE}")
        return True
    else:
        print(f"✗ Failed to create collection: {response.text}")
        return False

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using local service"""
    payload = {
        "text": text,
        "normalize": True
    }
    
    try:
        response = requests.post(
            f"{EMBEDDING_SERVICE_URL}/embed",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            return data["embedding"]
        else:
            print(f"✗ Embedding failed: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Embedding service error: {e}")
        return None

def load_products() -> List[Dict]:
    """Load products from exported CSV"""
    # Find the most recent products file
    if not os.path.exists(DATA_DIR):
        print(f"✗ Data directory not found: {DATA_DIR}")
        print(f"  Run export first: python3 scripts/export_vps_test_data.py")
        return []
    
    files = [f for f in os.listdir(DATA_DIR) if f.startswith('products_') and f.endswith('.csv')]
    if not files:
        print(f"✗ No product files found in {DATA_DIR}")
        return []
    
    latest_file = sorted(files)[-1]
    filepath = os.path.join(DATA_DIR, latest_file)
    
    print(f"ℹ Loading products from: {latest_file}")
    
    products = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            products.append(row)
    
    print(f"✓ Loaded {len(products)} products")
    return products

def upload_to_qdrant(points: List[Dict]):
    """Upload points to Qdrant"""
    if not points:
        return
    
    print(f"ℹ Uploading {len(points)} points to Qdrant...")
    
    response = requests.put(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}/points",
        json={"points": points},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        if result.get("status") == "ok":
            print(f"✓ Successfully uploaded {len(points)} vectors")
        else:
            print(f"✗ Upload failed: {result}")
    else:
        print(f"✗ Upload failed with status {response.status_code}: {response.text}")

def generate_and_upload_embeddings():
    """Main function to generate and upload embeddings"""
    print("=" * 60)
    print("🎯 Generate & Upload Embeddings")
    print("=" * 60)
    
    # Load products
    products = load_products()
    if not products:
        return
    
    # Generate embeddings in batches
    batch_size = 10
    points_batch = []
    total_uploaded = 0
    
    for idx, product in enumerate(products, 1):
        # Create text representation for embedding
        text = f"{product['name']} - {product.get('description', '')}".strip()
        if not text or len(text) < 10:
            print(f"⊘ Skipping product {idx}: Too short")
            continue
        
        # Generate ID (hash of product name + id)
        point_id = int(hashlib.md5(f"{product['id']}_{product['name']}".encode()).hexdigest(), 16) % (2**63)
        
        # Generate embedding
        print(f"ℹ Generating embedding {idx}/{len(products)}: {product['name'][:50]}...")
        embedding = generate_embedding(text)
        
        if embedding is None:
            print(f"⊘ Failed to generate embedding for product {idx}")
            continue
        
        # Add to batch
        points_batch.append({
            "id": point_id,
            "vector": embedding,
            "payload": {
                "product_id": product['id'],
                "name": product['name'],
                "category": product.get('category', ''),
                "price": float(product.get('price', 0)),
                "text": text
            }
        })
        
        # Upload batch
        if len(points_batch) >= batch_size:
            upload_to_qdrant(points_batch)
            total_uploaded += len(points_batch)
            points_batch = []
    
    # Upload remaining
    if points_batch:
        upload_to_qdrant(points_batch)
        total_uploaded += len(points_batch)
    
    print("\n" + "=" * 60)
    print("✅ EMBEDDING GENERATION COMPLETE")
    print("=" * 60)
    print(f"Total products processed: {len(products)}")
    print(f"Total vectors uploaded: {total_uploaded}")
    print(f"\nView in Qdrant Dashboard:")
    print(f"  open http://localhost:6333/dashboard/collections/{COLLECTION_NAME}")

def test_search(query: str = "test query"):
    """Test semantic search with a query"""
    print(f"\nℹ Testing search with: '{query}'")
    
    # Generate embedding for query
    embedding = generate_embedding(query)
    if not embedding:
        print("✗ Failed to generate query embedding")
        return
    
    # Search
    search_request = {
        "vector": embedding,
        "limit": 5,
        "with_payload": True
    }
    
    response = requests.post(
        f"{QDRANT_URL}/collections/{COLLECTION_NAME}/search",
        json=search_request
    )
    
    if response.status_code == 200:
        results = response.json().get("result", [])
        print(f"\n✓ Found {len(results)} similar products:\n")
        for i, result in enumerate(results, 1):
            score = result.get("score", 0)
            payload = result.get("payload", {})
            print(f"{i}. {payload.get('name', 'Unknown')} (Score: {score:.4f})")
            print(f"   Category: {payload.get('category', 'N/A')}")
            print(f"   Price: ₦{payload.get('price', 0):,.2f}")
            print()
    else:
        print(f"✗ Search failed: {response.text}")

def main():
    """Main entry point"""
    # Check services
    if not check_services():
        print("\n✗ Services not ready. Start them with:")
        print("  ./scripts/start-local-ml.sh")
        return
    
    # Create collection
    if not create_collection():
        print("\n✗ Collection creation failed")
        return
    
    # Generate and upload embeddings
    generate_and_upload_embeddings()
    
    # Test search
    print("\n" + "=" * 60)
    print("🔍 SEARCH TESTS")
    print("=" * 60)
    
    test_queries = [
        "laptop computer",
        "mobile phone",
        "office supplies"
    ]
    
    for query in test_queries:
        test_search(query)
        print("-" * 60)

if __name__ == "__main__":
    main()
