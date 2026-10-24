import { Request, Response } from 'express';
import { MeherbanService } from './meherban.service.js';
import { sendResponse } from '../../utils/response.js';

export class MeherbanController {
  static async getCategories(req: Request, res: Response) {
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
      const { category, trending, featured, search } = req.query;
      const products = await MeherbanService.getProducts({
        category: category as string,
        trending: trending === 'true',
        featured: featured === 'true',
        search: search as string,
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

  static async createOrder(req: Request, res: Response) {
    try {
      const { customerName, customerEmail, customerPhone, shippingAddress, city, paymentMethod, items } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
        return sendResponse(res, {
          statusCode: 400,
          message: 'Missing required order fields or items array',
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
}
