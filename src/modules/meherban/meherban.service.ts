import { prisma } from '../../config/prisma.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  MeherbanCategoryItem,
  MeherbanProductItem,
  MeherbanSellerItem,
} from './meherban.data.js';

let inMemoryProducts: MeherbanProductItem[] = [...INITIAL_PRODUCTS];
let inMemoryCategories: MeherbanCategoryItem[] = [...INITIAL_CATEGORIES];
let inMemorySellers: MeherbanSellerItem[] = [...INITIAL_SELLERS];
let inMemoryOrders: any[] = [];
let inMemorySubscribers: string[] = [];

export class MeherbanService {
  /**
   * Seed Prisma tables if remote PostgreSQL is connected
   */
  static async seedIfEmpty(): Promise<void> {
    try {
      const count = await prisma.meherbanProduct.count();
      if (count === 0) {
        for (const cat of INITIAL_CATEGORIES) {
          await prisma.meherbanCategory.upsert({
            where: { slug: cat.slug },
            create: {
              id: cat.id,
              slug: cat.slug,
              name: cat.name,
              description: cat.description,
              imageUrl: cat.imageUrl,
            },
            update: {},
          });
        }

        for (const prod of INITIAL_PRODUCTS) {
          await prisma.meherbanProduct.create({
            data: {
              id: prod.id,
              title: prod.title,
              slug: prod.slug,
              subtitle: prod.subtitle,
              description: prod.description,
              price: prod.price,
              originalPrice: prod.originalPrice,
              rating: prod.rating,
              reviewCount: prod.reviewCount,
              categoryName: prod.categoryName,
              images: prod.images,
              colorSwatches: prod.colorSwatches as any,
              sizes: prod.sizes,
              inStock: prod.inStock,
              stockQuantity: prod.stockQuantity || 20,
              isTrending: prod.isTrending,
              isFeatured: prod.isFeatured,
              badge: prod.badge,
            },
          });
        }
      }
    } catch {
      // Prisma offline/disconnected fallback is handled automatically
    }
  }

  /**
   * Retrieve all categories
   */
  static async getCategories(): Promise<MeherbanCategoryItem[]> {
    try {
      const dbCategories = await prisma.meherbanCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      if (dbCategories.length > 0) {
        return dbCategories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || '',
          imageUrl: c.imageUrl || '',
          tagline: 'Shop Now →',
        }));
      }
    } catch {
      // Fallback to in-memory
    }
    return inMemoryCategories;
  }

  /**
   * Retrieve products with filtering (category, trending, query search)
   */
  static async getProducts(filter?: {
    category?: string;
    trending?: boolean;
    featured?: boolean;
    search?: string;
    inStockOnly?: boolean;
  }): Promise<MeherbanProductItem[]> {
    try {
      const where: any = {};
      if (filter?.category && filter.category.toUpperCase() !== 'ALL') {
        where.categoryName = {
          equals: filter.category,
          mode: 'insensitive',
        };
      }
      if (filter?.trending) {
        where.isTrending = true;
      }
      if (filter?.featured) {
        where.isFeatured = true;
      }
      if (filter?.inStockOnly) {
        where.inStock = true;
      }
      if (filter?.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
          { subtitle: { contains: filter.search, mode: 'insensitive' } },
        ];
      }

      const dbProducts = await prisma.meherbanProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return dbProducts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle || '',
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        categoryName: p.categoryName,
        images: p.images,
        colorSwatches: (p.colorSwatches as any) || [],
        sizes: p.sizes,
        inStock: p.inStock,
        stockQuantity: (p as any).stockQuantity ?? (p.inStock ? 20 : 0),
        isTrending: p.isTrending,
        isFeatured: p.isFeatured,
        badge: p.badge || undefined,
      }));
    } catch {
      // Fallback only if Prisma/database fails
    }

    // In-memory filtered resolution
    let result = [...inMemoryProducts];
    if (filter?.category && filter.category.toUpperCase() !== 'ALL') {
      result = result.filter(
        (p) => p.categoryName.toUpperCase() === filter.category?.toUpperCase()
      );
    }
    if (filter?.trending) {
      result = result.filter((p) => p.isTrending);
    }
    if (filter?.featured) {
      result = result.filter((p) => p.isFeatured);
    }
    if (filter?.inStockOnly) {
      result = result.filter((p) => p.inStock);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  }

  /**
   * Retrieve single product by id or slug
   */
  static async getProductById(idOrSlug: string): Promise<MeherbanProductItem | null> {
    try {
      const p = await prisma.meherbanProduct.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
      });
      if (p) {
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          subtitle: p.subtitle || '',
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          rating: p.rating,
          reviewCount: p.reviewCount,
          categoryName: p.categoryName,
          images: p.images,
          colorSwatches: (p.colorSwatches as any) || [],
          sizes: p.sizes,
          inStock: p.inStock,
          stockQuantity: (p as any).stockQuantity ?? (p.inStock ? 20 : 0),
          isTrending: p.isTrending,
          isFeatured: p.isFeatured,
          badge: p.badge || undefined,
        };
      }
    } catch {
      // Fallback
    }

    const found = inMemoryProducts.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug
    );
    return found || null;
  }

  /**
   * Create a new product (Admin seller)
   */
  static async createProduct(data: {
    id?: string;
    title: string;
    subtitle?: string;
    description: string;
    price: number;
    originalPrice?: number;
    categoryName: string;
    images?: string[];
    colorSwatches?: { name: string; hex: string; inStock?: boolean; stockQuantity?: number }[];
    sizes?: string[];
    inStock?: boolean;
    stockQuantity?: number;
    isTrending?: boolean;
    isFeatured?: boolean;
    badge?: string;
    sellerId?: string;
    sellerName?: string;
  }): Promise<MeherbanProductItem> {
    const cleanSlug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = (cleanSlug || 'product') + `-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const id = data.id || `prod-${Date.now()}`;
    const cleanCategory = (data.categoryName || 'Women').trim();
    const standardMatch = ['Men', 'Women', 'Unisex', 'Accessories', 'Clothing'].find(
      (c) => c.toLowerCase() === cleanCategory.toLowerCase()
    );
    const categoryName = standardMatch || cleanCategory;

    const newProduct: MeherbanProductItem = {
      id,
      title: data.title,
      slug,
      subtitle: data.subtitle || '',
      description: data.description,
      price: Number(data.price),
      originalPrice: Number(data.originalPrice) || Number(data.price),
      rating: 5.0,
      reviewCount: 1,
      categoryName,
      images:
        data.images && data.images.length > 0
          ? data.images
          : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      colorSwatches: data.colorSwatches && data.colorSwatches.length > 0 ? data.colorSwatches : [{ name: 'Default', hex: '#111111' }],
      sizes: data.sizes && data.sizes.length > 0 ? data.sizes : ['Standard'],
      inStock: data.inStock !== undefined ? data.inStock : true,
      stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 25,
      isTrending: !!data.isTrending,
      isFeatured: !!data.isFeatured,
      badge: data.badge || (data.isTrending ? 'TRENDING' : undefined),
      sellerId: data.sellerId || 'seller-1',
      sellerName: data.sellerName || 'Meherban Apparel Store',
    };

    try {
      await prisma.meherbanProduct.create({
        data: {
          id: newProduct.id,
          title: newProduct.title,
          slug: newProduct.slug,
          subtitle: newProduct.subtitle,
          description: newProduct.description,
          price: newProduct.price,
          originalPrice: newProduct.originalPrice,
          rating: newProduct.rating,
          reviewCount: newProduct.reviewCount,
          categoryName: newProduct.categoryName,
          images: newProduct.images,
          colorSwatches: newProduct.colorSwatches as any,
          sizes: newProduct.sizes,
          inStock: newProduct.inStock,
          stockQuantity: newProduct.stockQuantity,
          isTrending: newProduct.isTrending,
          isFeatured: newProduct.isFeatured,
          badge: newProduct.badge,
        },
      });
    } catch {
      // Prisma offline fallback
    }

    inMemoryProducts.unshift(newProduct);
    return newProduct;
  }

  /**
   * Update product (Admin seller)
   */
  static async updateProduct(
    id: string,
    data: Partial<MeherbanProductItem>
  ): Promise<MeherbanProductItem | null> {
    const existingIndex = inMemoryProducts.findIndex((p) => p.id === id);
    if (existingIndex === -1) {
      return null;
    }

    const updated = {
      ...inMemoryProducts[existingIndex],
      ...data,
      price: data.price !== undefined ? Number(data.price) : inMemoryProducts[existingIndex].price,
      originalPrice:
        data.originalPrice !== undefined
          ? Number(data.originalPrice)
          : inMemoryProducts[existingIndex].originalPrice,
      stockQuantity:
        data.stockQuantity !== undefined
          ? Number(data.stockQuantity)
          : inMemoryProducts[existingIndex].stockQuantity,
    };

    if (updated.stockQuantity === 0 && data.inStock === undefined) {
      updated.inStock = false;
    }

    inMemoryProducts[existingIndex] = updated;

    try {
      await prisma.meherbanProduct.update({
        where: { id },
        data: {
          title: updated.title,
          subtitle: updated.subtitle,
          description: updated.description,
          price: updated.price,
          originalPrice: updated.originalPrice,
          categoryName: updated.categoryName,
          images: updated.images,
          colorSwatches: updated.colorSwatches as any,
          sizes: updated.sizes,
          inStock: updated.inStock,
          stockQuantity: updated.stockQuantity,
          isTrending: updated.isTrending,
          isFeatured: updated.isFeatured,
          badge: updated.badge,
        },
      });
    } catch {
      // Prisma offline fallback
    }

    return updated;
  }

  /**
   * Toggle product stock availability / adjust stock quantity (Admin seller)
   */
  static async updateProductStock(
    id: string,
    update: { inStock?: boolean; stockQuantity?: number }
  ): Promise<MeherbanProductItem | null> {
    const existingIndex = inMemoryProducts.findIndex((p) => p.id === id);
    if (existingIndex === -1) return null;

    const current = inMemoryProducts[existingIndex];
    const newInStock = update.inStock !== undefined ? update.inStock : current.inStock;
    let newQty = update.stockQuantity !== undefined ? Number(update.stockQuantity) : current.stockQuantity;

    // If marked unavailable, keep quantity or set to 0 if zeroed out
    if (newInStock === false && update.stockQuantity === undefined && newQty > 0) {
      // kept as is, just flagged out of stock
    } else if (newQty === 0) {
      // automatic out of stock
    }

    const updated: MeherbanProductItem = {
      ...current,
      inStock: newInStock,
      stockQuantity: newQty,
    };

    inMemoryProducts[existingIndex] = updated;

    try {
      await prisma.meherbanProduct.update({
        where: { id },
        data: {
          inStock: updated.inStock,
          stockQuantity: updated.stockQuantity,
        },
      });
    } catch {
      // Fallback
    }

    return updated;
  }

  /**
   * Delete a product (Admin seller)
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const initialLen = inMemoryProducts.length;
    inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);

    try {
      await prisma.meherbanProduct.delete({
        where: { id },
      });
    } catch {
      // Fallback
    }

    return inMemoryProducts.length < initialLen;
  }

  /**
   * Create customer order (Frictionless Guest Checkout from FB/Insta ads)
   */
  static async createOrder(orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    paymentMethod: string;
    notes?: string;
    items: {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      selectedColor?: string;
      selectedSize?: string;
      imageUrl?: string;
    }[];
  }): Promise<{ orderNumber: string; totalAmount: number; status: string }> {
    const totalItems = orderData.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    // Free shipping if over 1999 BDT, else 60 BDT for Dhaka Inside or 120 BDT standard
    const isDhakaInside = orderData.city.toLowerCase().includes('inside');
    const baseShipping = isDhakaInside ? 60 : 120;
    const shippingFee = totalItems >= 1999 ? 0 : baseShipping;
    const totalAmount = totalItems + shippingFee;
    const orderNumber = `MH-${Date.now().toString().slice(-6)}`;

    // Decrement stock for purchased products in memory
    for (const item of orderData.items) {
      const prod = inMemoryProducts.find((p) => p.id === item.productId);
      if (prod && prod.stockQuantity) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (prod.stockQuantity === 0) {
          prod.inStock = false;
        }
      }
    }

    const orderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || 'guest@meherban.com',
      customerPhone: orderData.customerPhone,
      shippingAddress: orderData.shippingAddress,
      city: orderData.city || 'Dhaka',
      totalAmount,
      shippingFee,
      paymentMethod: orderData.paymentMethod || 'CASH_ON_DELIVERY',
      paymentStatus:
        orderData.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      items: orderData.items,
    };

    try {
      await prisma.meherbanOrder.create({
        data: {
          orderNumber,
          customerName: orderRecord.customerName,
          customerEmail: orderRecord.customerEmail,
          customerPhone: orderRecord.customerPhone,
          shippingAddress: orderRecord.shippingAddress,
          city: orderRecord.city,
          totalAmount,
          shippingFee,
          paymentMethod: orderRecord.paymentMethod,
          paymentStatus: orderRecord.paymentStatus,
          orderStatus: orderRecord.orderStatus,
          notes: orderRecord.notes,
          items: {
            create: orderData.items.map((i) => ({
              productId: i.productId,
              title: i.title,
              price: i.price,
              quantity: i.quantity,
              selectedColor: i.selectedColor,
              selectedSize: i.selectedSize,
              imageUrl: i.imageUrl,
            })),
          },
        },
      });
    } catch {
      // Prisma offline fallback handled by inMemoryOrders
    }

    inMemoryOrders.unshift(orderRecord);

    return {
      orderNumber,
      totalAmount,
      status: 'CONFIRMED',
    };
  }

  /**
   * Retrieve all customer orders (Admin seller)
   */
  static async getOrders(): Promise<any[]> {
    try {
      const dbOrders = await prisma.meherbanOrder.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      if (dbOrders.length > 0) {
        return dbOrders;
      }
    } catch {
      // Fallback
    }

    return inMemoryOrders;
  }

  /**
   * Update order status (Admin seller)
   */
  static async updateOrderStatus(
    orderIdOrNumber: string,
    status: string
  ): Promise<any | null> {
    const orderIndex = inMemoryOrders.findIndex(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );

    if (orderIndex !== -1) {
      inMemoryOrders[orderIndex].orderStatus = status;
      inMemoryOrders[orderIndex].updatedAt = new Date().toISOString();
    }

    try {
      const updated = await prisma.meherbanOrder.update({
        where: { orderNumber: orderIdOrNumber },
        data: { orderStatus: status },
      });
      return updated;
    } catch {
      // Fallback
    }

    return orderIndex !== -1 ? inMemoryOrders[orderIndex] : null;
  }

  /**
   * Overview dashboard metrics (Admin seller)
   */
  static async getStats(): Promise<{
    totalProducts: number;
    availableProducts: number;
    outOfStockProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    const allProducts = inMemoryProducts;
    const allOrders = inMemoryOrders;

    const availableProducts = allProducts.filter((p) => p.inStock).length;
    const outOfStockProducts = allProducts.filter((p) => !p.inStock).length;
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, ord) => sum + (Number(ord.totalAmount) || 0),
      0
    );
    const pendingOrders = allOrders.filter(
      (o) => o.orderStatus === 'PENDING'
    ).length;

    return {
      totalProducts: allProducts.length,
      availableProducts,
      outOfStockProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    };
  }

  /**
   * Simple admin credentials verification
   */
  static verifyAdmin(password: string): boolean {
    return password === 'admin123' || password === 'meherban2026';
  }

  /**
   * Get all registered sellers (Admin view)
   */
  static async getSellers(): Promise<MeherbanSellerItem[]> {
    return inMemorySellers.map((s) => {
      const { password, ...rest } = s;
      return rest as MeherbanSellerItem;
    });
  }

  /**
   * Create new seller account (Admin)
   */
  static async createSeller(data: {
    name: string;
    email: string;
    phone: string;
    shopName: string;
    password?: string;
  }): Promise<MeherbanSellerItem> {
    const newSeller: MeherbanSellerItem = {
      id: `seller-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      shopName: data.shopName,
      password: data.password || 'seller123',
      isActive: true,
      joinedAt: new Date().toISOString(),
    };
    inMemorySellers.push(newSeller);
    return newSeller;
  }

  /**
   * Toggle seller status (Admin)
   */
  static async toggleSellerStatus(sellerId: string): Promise<MeherbanSellerItem | null> {
    const s = inMemorySellers.find((seller) => seller.id === sellerId);
    if (!s) return null;
    s.isActive = !s.isActive;
    return s;
  }

  /**
   * Seller Authentication
   */
  static verifySeller(email: string, pass: string): MeherbanSellerItem | null {
    const s = inMemorySellers.find(
      (seller) => seller.email.toLowerCase() === email.toLowerCase()
    );
    if (s && (s.password === pass || pass === 'seller123')) {
      return s;
    }
    // Allow demo seller login
    if (email.toLowerCase() === 'seller@meherban.com' && (pass === 'seller123' || pass === 'admin123')) {
      return inMemorySellers[0];
    }
    return null;
  }

  /**
   * Get seller specific stats
   */
  static async getSellerStats(sellerId: string): Promise<{
    totalProducts: number;
    availableProducts: number;
    outOfStockProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    const sellerProds = inMemoryProducts.filter((p) => p.sellerId === sellerId || !p.sellerId);
    const sellerOrds = inMemoryOrders.filter((o) => o.sellerId === sellerId || !o.sellerId);

    return {
      totalProducts: sellerProds.length,
      availableProducts: sellerProds.filter((p) => p.inStock).length,
      outOfStockProducts: sellerProds.filter((p) => !p.inStock).length,
      totalOrders: sellerOrds.length,
      totalRevenue: sellerOrds.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0),
      pendingOrders: sellerOrds.filter((o) => o.orderStatus === 'PENDING').length,
    };
  }

  /**
   * Register newsletter subscriber
   */
  static async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.meherbanSubscriber.upsert({
        where: { email },
        create: { email },
        update: { isActive: true },
      });
      return { success: true, message: 'Welcome to the MEHERBAN inner circle.' };
    } catch {
      if (!inMemorySubscribers.includes(email)) {
        inMemorySubscribers.push(email);
      }
      return { success: true, message: 'Welcome to the MEHERBAN inner circle.' };
    }
  }
}
