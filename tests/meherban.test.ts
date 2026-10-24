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
});
