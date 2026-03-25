/**
 * Retail - Point of Sale (POS) Screen
 * 
 * Mobile POS with barcode scanning, cart management, and offline payment processing
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { backendAPIService } from '../../services/api/backend-api.service';
import {
  CreditCard,
  Image as ImageIcon,
  Minus,
  Package,
  Plus,
  ScanBarcode,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react-native';

interface CartItem {
  product: Product;
  quantity: number;
}

type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  imageUrl?: string;
  sku?: string;
};

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await backendAPIService.getProducts();
      setProducts(response.data as Product[]);
    } catch (error: unknown) {
      console.error('[POS] Failed to load products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    setCart(prevCart => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }

  function calculateSubtotal(): number {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  function calculateTax(): number {
    return calculateSubtotal() * 0.08; // 8% tax rate
  }

  function calculateTotal(): number {
    return calculateSubtotal() + calculateTax();
  }

  async function processPayment(paymentMethod: 'cash' | 'card' | 'digital') {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to the cart first.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
      };

      // Try to process online
      try {
        const _response = await backendAPIService.processOrder(orderData);
        Alert.alert('Success', `Order completed! Total: $${calculateTotal().toFixed(2)}`);
        setCart([]);
      } catch (error: unknown) {
        // If offline, queue for later sync
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("Network")) {
          await backendAPIService.queueRequest('create', 'orders', orderData);
          Alert.alert(
            'Offline Mode',
            'Order queued for processing when connection is restored.'
          );
          setCart([]);
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      console.error('[POS] Payment error:', error);
      Alert.alert(
        "Payment Failed",
        error instanceof Error ? error.message : "Failed to process payment",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function showPaymentOptions() {
    Alert.alert(
      'Select Payment Method',
      `Total: $${calculateTotal().toFixed(2)}`,
      [
        {
          text: 'Cash',
          onPress: () => processPayment('cash'),
        },
        {
          text: 'Card',
          onPress: () => processPayment('card'),
        },
        {
          text: 'Digital Wallet',
          onPress: () => processPayment('digital'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Products List */}
      <View style={styles.productsSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.scanButton}>
            <ScanBarcode size={24} color="#10b981" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.productRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => addToCart(item)}
            >
              {item.image_url || item.imageUrl ? (
                <View style={styles.productImage}>
                  <ImageIcon size={40} color="#ccc" />
                </View>
              ) : (
                <View style={[styles.productImage, styles.noImage]}>
                  <Package size={40} color="#999" />
                </View>
              )}
              
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productSku}>{item.sku}</Text>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Cart Section */}
      <View style={styles.cartSection}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Current Order</Text>
          <Text style={styles.cartCount}>{cart.length} items</Text>
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCart size={48} color="#ccc" />
            <Text style={styles.emptyCartText}>Cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id}
            style={styles.cartList}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    ${item.product.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
                
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={16} color="#fff" />
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.product.id)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Order Summary */}
        {cart.length > 0 && (
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%):</Text>
              <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, isProcessing && styles.checkoutButtonDisabled]}
              onPress={showPaymentOptions}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <CreditCard size={20} color="#fff" />
                  <Text style={styles.checkoutText}>Process Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  productsSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  scanButton: {
    padding: 8,
  },
  productsGrid: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  noImage: {
    backgroundColor: '#e2e8f0',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  cartSection: {
    width: 400,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cartCount: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#10b981',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  orderSummary: {
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
