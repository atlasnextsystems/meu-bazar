import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { ProductService } from './services/product.service';
import { SaleService } from './services/sale.service';
import { DashboardService } from './services/dashboard.service';
import { ReportService } from './services/report.service';
import { UserService } from './services/user.service';

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

const callOptions = { cors: true };

// 1. Create Product
export const createProduct = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await ProductService.createProduct(request.auth.uid, request.data);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to create product');
  }
});

// 2. Update Product
export const updateProduct = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { productId, updates } = request.data;
  if (!productId) {
    throw new HttpsError('invalid-argument', 'Product ID is required.');
  }
  try {
    await ProductService.updateProduct(request.auth.uid, productId, updates);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to update product');
  }
});

// 3. Delete Product
export const deleteProduct = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { productId } = request.data;
  try {
    await ProductService.deleteProduct(request.auth.uid, productId);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to delete product');
  }
});

// 4. Restore Product
export const restoreProduct = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { productId } = request.data;
  try {
    await ProductService.restoreProduct(request.auth.uid, productId);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to restore product');
  }
});

// 5. Mark Product as Sold
export const markProductSold = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { productId } = request.data;
  try {
    await ProductService.markAsSold(request.auth.uid, productId);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to mark product as sold');
  }
});

// 6. Register Sale
export const registerSale = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await SaleService.registerSale(request.auth.uid, request.data);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to register sale');
  }
});

// 7. Get Sale History
export const getSaleHistory = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { filter } = request.data || {};
  try {
    return await SaleService.getSaleHistory(request.auth.uid, filter);
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to fetch sales history');
  }
});

// 8. Get Dashboard Data
export const getDashboardData = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await DashboardService.getDashboardData(request.auth.uid);
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to fetch dashboard metrics');
  }
});

// 9. Get Reports Data
export const getReportsData = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await ReportService.getReportsData(request.auth.uid);
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to fetch reports');
  }
});

// 10. Update Settings
export const updateSettings = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await UserService.updateSettings(request.auth.uid, request.data);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to update settings');
  }
});
