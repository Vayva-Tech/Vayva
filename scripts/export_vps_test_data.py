#!/usr/bin/env python3
"""
Export test data from VPS PostgreSQL for local ML testing
Exports products, customers, and orders for embedding generation
"""
import psycopg2
import csv
import os
from datetime import datetime

# Configuration - Connect to VPS PostgreSQL
DB_CONFIG = {
    'host': '163.245.209.203',
    'port': 5432,
    'database': 'vayva',
    'user': 'vayva',
    'password': 'QyKJ8nvIagBUJgrJSG7F1UGxv5kMZz64glkGe0fX'
}

OUTPUT_DIR = '/tmp/vayva_test_data'

def ensure_output_dir():
    """Create output directory if it doesn't exist"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"✓ Output directory: {OUTPUT_DIR}")

def connect_to_vps():
    """Establish connection to VPS PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print(f"✓ Connected to VPS PostgreSQL at {DB_CONFIG['host']}")
        return conn
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        return None

def export_products(conn, limit=100):
    """Export products for embedding generation"""
    print(f"\nℹ Exporting {limit} products...")
    
    query = f"""
    SELECT 
        id,
        name,
        description,
        category,
        price,
        stock,
        created_at
    FROM products
    WHERE description IS NOT NULL AND description != ''
    LIMIT {limit}
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    products = cursor.fetchall()
    
    # Get column names
    columns = [desc[0] for desc in cursor.description]
    
    # Write to CSV
    output_file = f"{OUTPUT_DIR}/products_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(products)
    
    print(f"✓ Exported {len(products)} products to {output_file}")
    return output_file

def export_customers(conn, limit=100):
    """Export customer data for analysis"""
    print(f"\nℹ Exporting {limit} customers...")
    
    query = f"""
    SELECT 
        id,
        name,
        email,
        phone,
        created_at,
        updated_at
    FROM customers
    ORDER BY created_at DESC
    LIMIT {limit}
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    customers = cursor.fetchall()
    
    columns = [desc[0] for desc in cursor.description]
    
    output_file = f"{OUTPUT_DIR}/customers_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(customers)
    
    print(f"✓ Exported {len(customers)} customers to {output_file}")
    return output_file

def export_orders(conn, limit=200):
    """Export order data for graph relationships"""
    print(f"\nℹ Exporting {limit} orders...")
    
    query = f"""
    SELECT 
        o.id,
        o.customer_id,
        o.total_amount,
        o.status,
        o.created_at,
        c.name as customer_name,
        c.email as customer_email
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
    LIMIT {limit}
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    orders = cursor.fetchall()
    
    columns = [desc[0] for desc in cursor.description]
    
    output_file = f"{OUTPUT_DIR}/orders_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(orders)
    
    print(f"✓ Exported {len(orders)} orders to {output_file}")
    return output_file

def export_order_items(conn, order_ids):
    """Export order items for product relationships"""
    if not order_ids:
        return None
        
    print(f"\nℹ Exporting order items...")
    
    placeholders = ','.join(['%s'] * len(order_ids))
    query = f"""
    SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name as product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id IN ({placeholders})
    """
    
    cursor = conn.cursor()
    cursor.execute(query, order_ids)
    items = cursor.fetchall()
    
    columns = [desc[0] for desc in cursor.description]
    
    output_file = f"{OUTPUT_DIR}/order_items_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(columns)
        writer.writerows(items)
    
    print(f"✓ Exported {len(items)} order items to {output_file}")
    return output_file

def main():
    """Main export function"""
    print("=" * 60)
    print("📦 VPS PostgreSQL Test Data Export")
    print("=" * 60)
    
    # Ensure output directory exists
    ensure_output_dir()
    
    # Connect to VPS
    conn = connect_to_vps()
    if not conn:
        print("\n✗ Export failed - cannot connect to VPS")
        return
    
    try:
        # Export products (primary focus for embeddings)
        products_file = export_products(conn, limit=100)
        
        # Export customers
        customers_file = export_customers(conn, limit=100)
        
        # Export orders
        orders_file = export_orders(conn, limit=200)
        
        # Get order IDs for items export
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM orders ORDER BY created_at DESC LIMIT 200")
        order_ids = [row[0] for row in cursor.fetchall()]
        
        # Export order items
        if order_ids:
            export_order_items(conn, order_ids)
        
        print("\n" + "=" * 60)
        print("✅ EXPORT COMPLETE")
        print("=" * 60)
        print(f"\nFiles created in {OUTPUT_DIR}:")
        print(f"  • Products: {products_file}")
        print(f"  • Customers: {customers_file}")
        print(f"  • Orders: {orders_file}")
        print(f"  • Order Items: (see above)")
        print("\nNext step:")
        print(f"  Run: python3 scripts/generate_embeddings_local.py")
        print(f"  This will generate embeddings and upload to Qdrant")
        
    except Exception as e:
        print(f"\n✗ Export failed: {e}")
    finally:
        conn.close()
        print("\n✓ Database connection closed")

if __name__ == "__main__":
    main()
