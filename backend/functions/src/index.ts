import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { ProductService } from './services/product.service';
import { SaleService } from './services/sale.service';
import { DashboardService } from './services/dashboard.service';
import { ReportService } from './services/report.service';
import { UserService } from './services/user.service';
import { BazaarService } from './services/bazaar.service';

setGlobalOptions({ maxInstances: 10, region: 'us-central1' });

const callOptions = { cors: true };

// 1. Create Bazaar (SaaS Subscription)
export const createBazaar = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await BazaarService.createBazaar(request.auth.uid, request.auth.token.email || '', request.data);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to create bazaar');
  }
});

// 2. Get User Bazaars
export const getUserBazaars = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await BazaarService.getUserBazaars(request.auth.uid, request.auth.token.email || '');
  } catch (err: any) {
    throw new HttpsError('internal', err.message || 'Failed to fetch bazaars');
  }
});

// 3. Invite Member (RBAC)
export const inviteMember = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { bazaarId, targetEmail, role } = request.data;
  try {
    return await BazaarService.inviteMember(request.auth.uid, bazaarId, targetEmail, role);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to invite member');
  }
});

// 4. Remove Member (RBAC)
export const removeMember = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { bazaarId, targetMemberId } = request.data;
  try {
    await BazaarService.removeMember(request.auth.uid, bazaarId, targetMemberId);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to remove member');
  }
});

// 5. Update Bazaar Info
export const updateBazaar = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { bazaarId, updates } = request.data;
  try {
    await BazaarService.updateBazaar(request.auth.uid, bazaarId, updates);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to update bazaar');
  }
});

// 6. Update Personal User Profile
export const updateProfile = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  try {
    return await UserService.updateSettings(request.auth.uid, request.data);
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to update profile');
  }
});

// 7. Create Product
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

// 8. Update Product
export const updateProduct = onCall(callOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }
  const { productId, updates } = request.data;
  try {
    await ProductService.updateProduct(request.auth.uid, productId, updates);
    return { success: true };
  } catch (err: any) {
    throw new HttpsError('invalid-argument', err.message || 'Failed to update product');
  }
});

// 9. Delete Product
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

// 10. Restore Product
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

// 11. Mark Product as Sold
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

// 12. Register Sale
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

// 13. Get Sale History
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

// 14. Get Dashboard Data
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

// 15. Get Reports Data
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
