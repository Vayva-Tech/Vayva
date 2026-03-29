import { prisma, Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { encrypt } from '../../lib/security/encryption';

export class IntegrationsService {
  constructor(private readonly db = prisma) {}

  async handleInstagramCallback(
    storeId: string,
    code: string,
    state: string,
    expectedState: string
  ): Promise<{ success: boolean; redirectUrl: string }> {
    try {
      // Validate state
      if (!state || !expectedState || state !== expectedState) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'invalid_state') };
      }

      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const redirectUri = process.env.META_IG_REDIRECT_URI;

      if (!appId || !appSecret || !redirectUri) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'missing_config') };
      }

      // Exchange code for short-lived token
      const tokenUrl = new URL('https://graph.facebook.com/v17.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', appId);
      tokenUrl.searchParams.set('client_secret', appSecret);
      tokenUrl.searchParams.set('redirect_uri', redirectUri);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString(), { method: 'GET' });
      if (!tokenRes.ok) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'token_exchange_failed') };
      }

      const shortLived = (await tokenRes.json()) as { access_token: string };

      // Exchange for long-lived token
      const longLivedUrl = new URL('https://graph.facebook.com/v17.0/oauth/access_token');
      longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
      longLivedUrl.searchParams.set('client_id', appId);
      longLivedUrl.searchParams.set('client_secret', appSecret);
      longLivedUrl.searchParams.set('fb_exchange_token', shortLived.access_token);

      const longRes = await fetch(longLivedUrl.toString(), { method: 'GET' });
      if (!longRes.ok) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'long_lived_exchange_failed') };
      }

      const longLived = (await longRes.json()) as { access_token: string };

      // Get pages with Instagram accounts
      const accountsUrl = new URL('https://graph.facebook.com/v17.0/me/accounts');
      accountsUrl.searchParams.set('fields', 'id,name,access_token,instagram_business_account');
      accountsUrl.searchParams.set('access_token', longLived.access_token);

      const accountsRes = await fetch(accountsUrl.toString(), { method: 'GET' });
      if (!accountsRes.ok) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'fetch_pages_failed') };
      }

      const accounts = (await accountsRes.json()) as {
        data?: Array<{
          id: string;
          name?: string;
          access_token?: string;
          instagram_business_account?: { id: string };
        }>;
      };

      const pageWithIg = (accounts.data || []).find(
        (p) => p.instagram_business_account?.id && p.access_token
      );

      if (!pageWithIg || !pageWithIg.access_token || !pageWithIg.instagram_business_account?.id) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'no_ig_business_account') };
      }

      // Encrypt and store the page access token
      const encryptedPageToken = encrypt(pageWithIg.access_token);

      // Update store settings
      const store = await this.db.store.findUnique({ where: { id: storeId } });
      if (!store) {
        return { success: false, redirectUrl: this.buildRedirectUrl(storeId, 'error', 'store_not_found') };
      }

      const settings = (store.settings as Record<string, unknown> | null) ?? {};
      const nextSettings: Record<string, unknown> = {
        ...settings,
        instagram: {
          connected: true,
          provider: 'meta',
          pageId: pageWithIg.id,
          pageName: pageWithIg.name || null,
          igBusinessId: pageWithIg.instagram_business_account.id,
          encryptedPageAccessToken: encryptedPageToken,
          connectedAt: new Date().toISOString(),
        },
      };

      await this.db.store.update({
        where: { id: storeId },
        data: {
          settings: nextSettings as Prisma.InputJsonValue,
        },
      });

      logger.info(`[Integrations] Store ${storeId} connected Instagram account ${pageWithIg.instagram_business_account.id}`);

      return { success: true, redirectUrl: this.buildRedirectUrl(storeId, 'connected') };
    } catch (error) {
      logger.error('[Integrations] Instagram OAuth callback failed', { error });
      throw error;
    }
  }

  private buildRedirectUrl(storeId: string, status: string, reason?: string): string {
    const baseUrl = '/dashboard/socials';
    const params = new URLSearchParams();
    
    if (status === 'connected') {
      params.set('ig', 'connected');
    } else if (status === 'error') {
      params.set('ig', 'error');
      if (reason) params.set('reason', reason);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  async getInstagramConnection(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const settings = store.settings as Record<string, unknown> | null;
    const instagram = settings?.instagram as Record<string, unknown> | undefined;

    return {
      connected: !!instagram?.connected,
      pageId: instagram?.pageId as string | undefined,
      pageName: instagram?.pageName as string | undefined,
      igBusinessId: instagram?.igBusinessId as string | undefined,
      connectedAt: instagram?.connectedAt as string | undefined,
    };
  }

  async disconnectInstagram(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const settings = (store.settings as Record<string, unknown> | null) ?? {};
    delete settings.instagram;

    await this.db.store.update({
      where: { id: storeId },
      data: { settings: settings as Prisma.InputJsonValue },
    });

    logger.info(`[Integrations] Store ${storeId} disconnected Instagram`);
  }
}
