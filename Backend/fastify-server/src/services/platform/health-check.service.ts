import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class HealthCheckService {
  constructor(private readonly db = prisma) {}

  async comprehensive() {
    const checks: Record<string, any> = {};
    const results: Array<{ name: string; status: string; details?: any }> = [];

    // Database health check
    try {
      await this.db.$queryRaw`SELECT 1`;
      checks.database = { status: 'healthy' };
      results.push({ name: 'database', status: 'healthy' });
    } catch (error) {
      checks.database = { status: 'unhealthy', error: String(error) };
      results.push({ name: 'database', status: 'unhealthy', details: String(error) });
    }

    // Store count
    try {
      const storeCount = await this.db.store.count();
      checks.stores = { status: 'healthy', count: storeCount };
      results.push({ name: 'stores', status: 'healthy', details: { count: storeCount } });
    } catch (error) {
      checks.stores = { status: 'unhealthy', error: String(error) };
      results.push({ name: 'stores', status: 'unhealthy', details: String(error) });
    }

    // User count
    try {
      const userCount = await this.db.user.count();
      checks.users = { status: 'healthy', count: userCount };
      results.push({ name: 'users', status: 'healthy', details: { count: userCount } });
    } catch (error) {
      checks.users = { status: 'unhealthy', error: String(error) };
      results.push({ name: 'users', status: 'unhealthy', details: String(error) });
    }

    // Order count
    try {
      const orderCount = await this.db.order.count();
      checks.orders = { status: 'healthy', count: orderCount };
      results.push({ name: 'orders', status: 'healthy', details: { count: orderCount } });
    } catch (error) {
      checks.orders = { status: 'unhealthy', error: String(error) };
      results.push({ name: 'orders', status: 'unhealthy', details: String(error) });
    }

    // Product count
    try {
      const productCount = await this.db.product.count();
      checks.products = { status: 'healthy', count: productCount };
      results.push({ name: 'products', status: 'healthy', details: { count: productCount } });
    } catch (error) {
      checks.products = { status: 'unhealthy', error: String(error) };
      results.push({ name: 'products', status: 'unhealthy', details: String(error) });
    }

    const allHealthy = results.every((r) => r.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      results,
    };
  }
}
