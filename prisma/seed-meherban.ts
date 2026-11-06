import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../src/modules/meherban/meherban.data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MEHERBAN Categories and Products into Neon PostgreSQL...');

  // 1. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.meherbanCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_CATEGORIES.length} MEHERBAN fashion categories.`);

  // 2. Seed Products
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.meherbanProduct.upsert({
      where: { slug: prod.slug },
      update: {
        title: prod.title,
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
        stockQuantity: prod.stockQuantity ?? 20,
        isTrending: prod.isTrending,
        isFeatured: prod.isFeatured,
        badge: prod.badge,
        sellerId: prod.sellerId || 'seller-1',
        sellerName: prod.sellerName || 'MEHERBAN Official Store',
      },
      create: {
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
        stockQuantity: prod.stockQuantity ?? 20,
        isTrending: prod.isTrending,
        isFeatured: prod.isFeatured,
        badge: prod.badge,
        sellerId: prod.sellerId || 'seller-1',
        sellerName: prod.sellerName || 'MEHERBAN Official Store',
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} MEHERBAN products into Neon PostgreSQL.`);
}

main()
  .catch((e) => {
    console.error('Meherban Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
