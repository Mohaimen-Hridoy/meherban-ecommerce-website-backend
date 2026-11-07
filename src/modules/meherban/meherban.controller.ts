import { Request, Response } from 'express';
import { MeherbanService } from './meherban.service.js';
import { uploadImageFile } from './meherban.upload.js';
import { sendResponse } from '../../utils/response.js';

export class MeherbanController {
  static async getCategories(_req: Request, res: Response) {
    try {
      const categories = await MeherbanService.getCategories();
      return sendResponse(res, {
        statusCode: 200,
        message: 'Categories fetched successfully',
        data: categories,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to fetch categories',
        errors: [error.message],
      });
    }
  }

  static async getProducts(req: Request, res: Response) {
    try {
      const { category, trending, featured, search, inStockOnly } = req.query;
      const products = await MeherbanService.getProducts({
        category: category as string,
        trending: trending === 'true',
        featured: featured === 'true',
        search: search as string,
        inStockOnly: inStockOnly === 'true',
      });

      return sendResponse(res, {
        statusCode: 200,
        message: 'Products fetched successfully',
        data: products,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to fetch products',
        errors: [error.message],
      });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await MeherbanService.getProductById(id);
      if (!product) {
        return sendResponse(res, {
          statusCode: 404,
          message: 'Product not found',
          data: null,
          errors: ['NOT_FOUND'],
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: 'Product details retrieved successfully',
        data: product,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to retrieve product',
        errors: [error.message],
      });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const {
        id,
        title,
        subtitle,
        description,
        price,
        originalPrice,
        categoryName,
        images,
        colorSwatches,
        sizes,
        inStock,
        stockQuantity,
        isTrending,
        isFeatured,
        badge,
      } = req.body;

      if (!title || price === undefined || !description) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Product title, price, and description are required.',
          errors: ['VALIDATION_ERROR'],
        });
      }

      const newProduct = await MeherbanService.createProduct({
        id,
        title,
        subtitle,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryName: categoryName || 'Unisex',
        images,
        colorSwatches,
        sizes,
        inStock,
        stockQuantity: stockQuantity ? Number(stockQuantity) : undefined,
        isTrending,
        isFeatured,
        badge,
      });

      return sendResponse(res, {
        statusCode: 201,
        message: 'Product created successfully',
        data: newProduct,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to create product',
        errors: [error.message],
      });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await MeherbanService.updateProduct(id, req.body);
      if (!updated) {
        return sendResponse(res, {
          statusCode: 404,
          message: 'Product not found to update',
          errors: ['PRODUCT_NOT_FOUND'],
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: 'Product updated successfully',
        data: updated,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to update product',
        errors: [error.message],
      });
    }
  }

  static async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { inStock, stockQuantity } = req.body;

      const updated = await MeherbanService.updateProductStock(id, {
        inStock: inStock !== undefined ? Boolean(inStock) : undefined,
        stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : undefined,
      });

      if (!updated) {
        return sendResponse(res, {
          statusCode: 404,
          message: 'Product not found',
          errors: ['NOT_FOUND'],
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: 'Product stock updated successfully',
        data: updated,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to update stock',
        errors: [error.message],
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await MeherbanService.deleteProduct(id);
      if (!success) {
        return sendResponse(res, {
          statusCode: 404,
          message: 'Product not found or already deleted',
          errors: ['DELETE_FAILED'],
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: 'Product deleted successfully',
        data: { id },
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to delete product',
        errors: [error.message],
      });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        paymentMethod,
        notes,
        items,
      } = req.body;

      // Guest checkout from Facebook & Instagram ads: phone and address are mandatory, email is optional!
      if (!customerName || !customerPhone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Customer name, phone number, delivery address, and items are required.',
          errors: ['INVALID_ORDER_PAYLOAD'],
        });
      }

      const orderResult = await MeherbanService.createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city: city || 'Dhaka',
        paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
        notes,
        items,
      });

      return sendResponse(res, {
        statusCode: 201,
        message: 'Order placed successfully',
        data: orderResult,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Order creation failed',
        errors: [error.message],
      });
    }
  }

  static async getOrders(_req: Request, res: Response) {
    try {
      const orders = await MeherbanService.getOrders();
      return sendResponse(res, {
        statusCode: 200,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to retrieve orders',
        errors: [error.message],
      });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Status is required',
          errors: ['MISSING_STATUS'],
        });
      }

      const updated = await MeherbanService.updateOrderStatus(id, status);
      return sendResponse(res, {
        statusCode: 200,
        message: 'Order status updated successfully',
        data: updated,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to update order status',
        errors: [error.message],
      });
    }
  }

  static async getStats(_req: Request, res: Response) {
    try {
      const stats = await MeherbanService.getStats();
      return sendResponse(res, {
        statusCode: 200,
        message: 'Stats retrieved successfully',
        data: stats,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to retrieve stats',
        errors: [error.message],
      });
    }
  }

  static async adminLogin(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const isValid = MeherbanService.verifyAdmin(password);

      if (!isValid) {
        return sendResponse(res, {
          statusCode: 401,
          message: 'Invalid admin credentials',
          errors: ['UNAUTHORIZED'],
        });
      }

      return sendResponse(res, {
        statusCode: 200,
        message: 'Admin authenticated successfully',
        data: {
          authenticated: true,
          role: 'ADMIN',
          token: `mhb-token-${Date.now()}`,
        },
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Authentication error',
        errors: [error.message],
      });
    }
  }

  static async sellerLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Seller email and password are required',
          errors: ['MISSING_CREDENTIALS'],
        });
      }

      const seller = MeherbanService.verifySeller(email, password);
      if (!seller) {
        return sendResponse(res, {
          statusCode: 401,
          message: 'Invalid seller email or password',
          errors: ['UNAUTHORIZED'],
        });
      }

      if (!seller.isActive) {
        return sendResponse(res, {
          statusCode: 403,
          message: 'This seller account has been disabled by Admin.',
          errors: ['ACCOUNT_DISABLED'],
        });
      }

      const { password: _, ...safeSeller } = seller;
      return sendResponse(res, {
        statusCode: 200,
        message: 'Seller authenticated successfully',
        data: {
          authenticated: true,
          role: 'SELLER',
          seller: safeSeller,
          token: `seller-token-${Date.now()}`,
        },
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Seller authentication error',
        errors: [error.message],
      });
    }
  }

  static async getSellers(_req: Request, res: Response) {
    try {
      const sellers = await MeherbanService.getSellers();
      return sendResponse(res, {
        statusCode: 200,
        message: 'Sellers fetched successfully',
        data: sellers,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to fetch sellers',
        errors: [error.message],
      });
    }
  }

  static async createSeller(req: Request, res: Response) {
    try {
      const { name, email, phone, shopName, password } = req.body;
      if (!name || !email || !shopName) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Seller name, email, and shop name are required',
          errors: ['VALIDATION_ERROR'],
        });
      }

      const created = await MeherbanService.createSeller({
        name,
        email,
        phone: phone || '',
        shopName,
        password: password || 'seller123',
      });

      const { password: _, ...safeSeller } = created;
      return sendResponse(res, {
        statusCode: 201,
        message: 'Seller created successfully',
        data: safeSeller,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to create seller',
        errors: [error.message],
      });
    }
  }

  static async toggleSeller(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const toggled = await MeherbanService.toggleSellerStatus(id);
      if (!toggled) {
        return sendResponse(res, {
          statusCode: 404,
          message: 'Seller not found',
          errors: ['NOT_FOUND'],
        });
      }

      const { password: _, ...safeSeller } = toggled;
      return sendResponse(res, {
        statusCode: 200,
        message: 'Seller status updated',
        data: safeSeller,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to update seller status',
        errors: [error.message],
      });
    }
  }

  static async getSellerStats(req: Request, res: Response) {
    try {
      const { sellerId } = req.params;
      const stats = await MeherbanService.getSellerStats(sellerId);
      return sendResponse(res, {
        statusCode: 200,
        message: 'Seller stats fetched',
        data: stats,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Failed to fetch seller stats',
        errors: [error.message],
      });
    }
  }

  static async subscribeNewsletter(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Valid email address is required',
          errors: ['INVALID_EMAIL'],
        });
      }

      const result = await MeherbanService.subscribeNewsletter(email);
      return sendResponse(res, {
        statusCode: 200,
        message: result.message,
        data: { email },
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Subscription failed',
        errors: [error.message],
      });
    }
  }

  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'No image file uploaded. Please select a valid JPG, PNG, or WebP image.',
          errors: ['FILE_MISSING'],
        });
      }

      const uploadResult = await uploadImageFile(req.file);
      return sendResponse(res, {
        statusCode: 200,
        message: `Image uploaded successfully via ${uploadResult.provider}`,
        data: uploadResult,
      });
    } catch (error: any) {
      return sendResponse(res, {
        statusCode: 500,
        message: 'Image upload failed',
        errors: [error.message],
      });
    }
  }
}
