import { prisma } from '../../config/prisma.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  MeherbanCategoryItem,
  MeherbanProductItem,
} from './meherban.data.js';

let inMemoryProducts: MeherbanProductItem[] = [...INITIAL_PRODUCTS];
let inMemoryCategories: MeherbanCategoryItem[] = [...INITIAL_CATEGORIES];
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

      if (dbProducts.length > 0) {
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
          isTrending: p.isTrending,
          isFeatured: p.isFeatured,
          badge: p.badge || undefined,
        }));
      }
    } catch {
      // Fallback
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
   * Create customer order
   */
  static async createOrder(orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    paymentMethod: string;
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
    // Free shipping if over 1999 BDT, else 120 BDT
    const shippingFee = totalItems >= 1999 ? 0 : 120;
    const totalAmount = totalItems + shippingFee;
    const orderNumber = `MH-${Date.now().toString().slice(-6)}`;

    try {
      const order = await prisma.meherbanOrder.create({
        data: {
          orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress,
          city: orderData.city,
          totalAmount,
          shippingFee,
          paymentMethod: orderData.paymentMethod,
          paymentStatus:
            orderData.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
          orderStatus: 'CONFIRMED',
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

      return {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.orderStatus,
      };
    } catch {
      // Fallback to in-memory order tracking
      const fallbackOrder = {
        orderNumber,
        ...orderData,
        totalAmount,
        shippingFee,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(),
      };
      inMemoryOrders.push(fallbackOrder);
      return {
        orderNumber,
        totalAmount,
        status: 'CONFIRMED',
      };
    }
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
