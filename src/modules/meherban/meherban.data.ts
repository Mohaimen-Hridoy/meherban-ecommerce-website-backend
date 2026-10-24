export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface MeherbanProductItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  images: string[];
  colorSwatches: ColorSwatch[];
  sizes: string[];
  inStock: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  badge?: string;
}

export interface MeherbanCategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  tagline: string;
}

export const INITIAL_CATEGORIES: MeherbanCategoryItem[] = [
  {
    id: 'cat-men',
    slug: 'men',
    name: 'MEN',
    description: 'Classic meets modern contemporary streetwear and tailoring.',
    tagline: 'Shop Now →',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-women',
    slug: 'women',
    name: 'WOMEN',
    description: 'Elegance in every detail with timeless neutral silhouettes.',
    tagline: 'Shop Now →',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-unisex',
    slug: 'unisex',
    name: 'UNISEX',
    description: 'Versatile, fluid essentials designed for all humans.',
    tagline: 'Shop Now →',
    imageUrl:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'ACCESSORIES',
    description: 'Handcrafted leather goods, polarized eyewear, and timepieces.',
    tagline: 'Shop Now →',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_PRODUCTS: MeherbanProductItem[] = [
  {
    id: 'prod-oversized-tee',
    title: 'Oversized T-Shirt',
    slug: 'oversized-t-shirt',
    subtitle: 'Streetwear Luxury Graphic Tee',
    description:
      'Crafted from 240 GSM combed compact cotton for a heavyweight drape, breathable feel, and long-lasting structure. Features custom typographic screenprint artwork on the rear.',
    price: 1499,
    originalPrice: 1899,
    rating: 4.9,
    reviewCount: 128,
    categoryName: 'Men',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Charcoal Grey', hex: '#555555' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'HOT',
  },
  {
    id: 'prod-classic-hoodie',
    title: 'Classic Hoodie',
    slug: 'classic-hoodie',
    subtitle: 'Heavyweight Minimalist Fleece Hoodie',
    description:
      '420 GSM pre-shrunk French Terry fleece. Double-layered hood without drawstrings for a sleek minimalist contour, dropped shoulder seams, and dense ribbed cuffs.',
    price: 2499,
    originalPrice: 2999,
    rating: 5.0,
    reviewCount: 94,
    categoryName: 'Unisex',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Oatmeal Beige', hex: '#E6DEC9' },
      { name: 'Midnight Black', hex: '#161616' },
      { name: 'Muted Taupe', hex: '#8C7D70' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'BESTSELLER',
  },
  {
    id: 'prod-wide-leg-pants',
    title: "Women's Wide Leg Pants",
    slug: 'womens-wide-leg-pants',
    subtitle: 'High-Waisted Tailored Pleated Trousers',
    description:
      'Flattering high-rise pleated pants in structured stretch crepe. Designed with crisp knife pleats, slanted pockets, and an elongated wide-leg hem that drapes seamlessly.',
    price: 2199,
    originalPrice: 2699,
    rating: 4.8,
    reviewCount: 76,
    categoryName: 'Women',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Sand Khaki', hex: '#C7B299' },
      { name: 'Cocoa Brown', hex: '#584333' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'TRENDING',
  },
  {
    id: 'prod-sunglasses-unisex',
    title: 'Sunglasses (Unisex)',
    slug: 'sunglasses-unisex',
    subtitle: 'Polarized Geometric Acetate Eyewear',
    description:
      'Handcrafted glossy Italian acetate frames featuring polarized Category 3 UV400 dark lenses and custom 5-barrel metallic hinges for all-day UV defense and timeless flair.',
    price: 1299,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 112,
    categoryName: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Jet Black', hex: '#0B0B0B' },
      { name: 'Dark Tortoiseshell', hex: '#42281D' },
    ],
    sizes: ['One Size'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'NEW',
  },
  {
    id: 'prod-leather-crossbody',
    title: 'Leather Crossbody Bag',
    slug: 'leather-crossbody-bag',
    subtitle: 'Saffiano Textured Flap Bag',
    description:
      'Structured flap crossbody bag in rich micro-grain vegan leather. Fitted with concealed magnetic closures, gold-tone hardware, and an adjustable wide shoulder strap.',
    price: 1299,
    originalPrice: 1999,
    rating: 4.7,
    reviewCount: 83,
    categoryName: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Sleek Black', hex: '#1A1A1A' },
      { name: 'Warm Cognac', hex: '#87512F' },
    ],
    sizes: ['One Size'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'POPULAR',
  },
  {
    id: 'prod-luxury-watch',
    title: 'Luxury Watch',
    slug: 'luxury-watch',
    subtitle: 'Stealth Black Chronograph Timepiece',
    description:
      'Surgical 316L ion-plated matte black stainless steel casing. Sapphire glass anti-reflective dial with precise Japanese quartz movement and 5ATM water resistance.',
    price: 4999,
    originalPrice: 6499,
    rating: 5.0,
    reviewCount: 65,
    categoryName: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    ],
    colorSwatches: [
      { name: 'Matte Black', hex: '#111111' },
      { name: 'Champagne Gold', hex: '#CDB17F' },
    ],
    sizes: ['42mm Case'],
    inStock: true,
    isTrending: true,
    isFeatured: true,
    badge: 'PREMIUM',
  },
];
