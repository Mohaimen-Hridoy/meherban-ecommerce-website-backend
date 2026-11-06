import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MeherbanService } from '../src/modules/meherban/meherban.service.js';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../src/modules/meherban/meherban.data.js';

describe('MEHERBAN E-Commerce Storefront Tests', () => {
  test('should retrieve all default fashion categories', async () => {
    // Arrange & Act
    const categories = await MeherbanService.getCategories();

    // Assert
    assert.ok(Array.isArray(categories));
    assert.strictEqual(categories.length >= 4, true);
    assert.ok(categories.some((c) => c.slug === 'men'));
    assert.ok(categories.some((c) => c.slug === 'women'));
    assert.ok(categories.some((c) => c.slug === 'accessories'));
  });

  test('should filter trending products correctly matching the UI screenshot', async () => {
    // Arrange & Act
    const trendingProducts = await MeherbanService.getProducts({ trending: true });

    // Assert
    assert.ok(trendingProducts.length >= 6);
    const titles = trendingProducts.map((p) => p.title);
    assert.ok(titles.includes('Oversized T-Shirt'));
    assert.ok(titles.includes('Classic Hoodie'));
    assert.ok(titles.includes("Women's Wide Leg Pants"));
    assert.ok(titles.includes('Sunglasses (Unisex)'));
    assert.ok(titles.includes('Leather Crossbody Bag'));
    assert.ok(titles.includes('Luxury Watch'));
  });

  test('should calculate order subtotal and grant free shipping over ৳ 1999', async () => {
    // Arrange
    const qualifyingOrder = {
      customerName: 'Test User',
      customerEmail: 'test@meherban.com',
      customerPhone: '01700000000',
      shippingAddress: 'Gulshan 2, Dhaka',
      city: 'Dhaka',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [
        {
          productId: 'prod-classic-hoodie',
          title: 'Classic Hoodie',
          price: 2499,
          quantity: 1,
        },
      ],
    };

    // Act
    const result = await MeherbanService.createOrder(qualifyingOrder);

    // Assert
    assert.ok(result.orderNumber.startsWith('MH-'));
    assert.strictEqual(result.totalAmount, 2499); // Free shipping because 2499 >= 1999
    assert.strictEqual(result.status, 'CONFIRMED');
  });

  test('should charge shipping fee of ৳ 120 when order is below ৳ 1999', async () => {
    // Arrange
    const smallOrder = {
      customerName: 'Test User',
      customerEmail: 'test@meherban.com',
      customerPhone: '01700000000',
      shippingAddress: 'Dhanmondi, Dhaka',
      city: 'Dhaka',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [
        {
          productId: 'prod-oversized-tee',
          title: 'Oversized T-Shirt',
          price: 1499,
          quantity: 1,
        },
      ],
    };

    // Act
    const result = await MeherbanService.createOrder(smallOrder);

    // Assert
    assert.strictEqual(result.totalAmount, 1499 + 120); // 1619
  });

  test('should allow seller to add, update stock availability, and delete products', async () => {
    // 1. Add product
    const created = await MeherbanService.createProduct({
      title: 'Winter Knit Sweater',
      price: 2199,
      description: 'Heavy gauge luxury wool blend',
      categoryName: 'Unisex',
      inStock: true,
      stockQuantity: 10,
    });

    assert.ok(created.id);
    assert.strictEqual(created.title, 'Winter Knit Sweater');
    assert.strictEqual(created.inStock, true);
    assert.strictEqual(created.stockQuantity, 10);

    // 2. Toggle stock to unavailable (Seller control)
    const toggled = await MeherbanService.updateProductStock(created.id, {
      inStock: false,
      stockQuantity: 0,
    });
    assert.ok(toggled);
    assert.strictEqual(toggled?.inStock, false);
    assert.strictEqual(toggled?.stockQuantity, 0);

    // Verify it is excluded when querying inStockOnly
    const availableOnly = await MeherbanService.getProducts({ inStockOnly: true });
    assert.ok(!availableOnly.some((p) => p.id === created.id));

    // 3. Delete product (Seller control)
    const deleted = await MeherbanService.deleteProduct(created.id);
    assert.strictEqual(deleted, true);

    const lookup = await MeherbanService.getProductById(created.id);
    assert.strictEqual(lookup, null);
  });

  test('should allow seller to retrieve orders and update status without requiring customer login', async () => {
    // Place guest order without login
    const guestOrder = {
      customerName: 'Instagram Ad Buyer',
      customerPhone: '01811223344',
      shippingAddress: 'Mirpur 10, Dhaka',
      city: 'Dhaka',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [
        {
          productId: 'prod-sunglasses-unisex',
          title: 'Sunglasses (Unisex)',
          price: 1299,
          quantity: 1,
        },
      ],
    };

    const orderRes = await MeherbanService.createOrder(guestOrder);
    assert.ok(orderRes.orderNumber);

    // Seller retrieves all orders
    const allOrders = await MeherbanService.getOrders();
    const placed = allOrders.find((o) => o.orderNumber === orderRes.orderNumber);
    assert.ok(placed);
    assert.strictEqual(placed.customerName, 'Instagram Ad Buyer');
    assert.strictEqual(placed.customerPhone, '01811223344');

    // Seller updates status to SHIPPED
    const updated = await MeherbanService.updateOrderStatus(orderRes.orderNumber, 'SHIPPED');
    assert.ok(updated);
    assert.strictEqual(updated.orderStatus, 'SHIPPED');

    // Seller gets dashboard stats
    const stats = await MeherbanService.getStats();
    assert.ok(stats.totalProducts > 0);
    assert.ok(stats.totalOrders > 0);
    assert.ok(stats.totalRevenue > 0);
  });
});
