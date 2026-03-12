/**
 * SCIM 2.0 Users Endpoint
 *
 * GET  /api/auth/scim/v2/Users      - List users (with pagination)
 * POST /api/auth/scim/v2/Users      - Create user (IdP provisioning)
 *
 * Conforms to RFC 7644 - SCIM 2.0 Protocol
 */

import { NextRequest, NextResponse } from 'next/server';
import { scimService } from '@vayva/security';

const SCIM_SCHEMAS_LIST = ['urn:ietf:params:scim:api:messages:2.0:ListResponse'];
const SCIM_SCHEMAS_ERROR = ['urn:ietf:params:scim:api:messages:2.0:Error'];

/**
 * Validate SCIM Bearer token from Authorization header
 */
async function validateScimAuth(request: NextRequest): Promise<{ valid: boolean; tenantId?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.replace('Bearer ', '');
  return scimService.validateToken(token);
}

function scimError(status: number, detail: string) {
  return NextResponse.json(
    { schemas: SCIM_SCHEMAS_ERROR, status, detail },
    { status, headers: { 'Content-Type': 'application/scim+json' } }
  );
}

/**
 * GET /api/auth/scim/v2/Users
 * List provisioned users with pagination
 */
export async function GET(request: NextRequest) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) {
    return scimError(401, 'Authorization Required');
  }

  const { searchParams } = new URL(request.url);
  const startIndex = parseInt(searchParams.get('startIndex') || '1');
  const count = parseInt(searchParams.get('count') || '100');
  const filter = searchParams.get('filter') || undefined;

  const result = await scimService.listUsers(tenantId, { startIndex, count, filter });

  return NextResponse.json(
    { ...result, schemas: SCIM_SCHEMAS_LIST },
    { headers: { 'Content-Type': 'application/scim+json' } }
  );
}

/**
 * POST /api/auth/scim/v2/Users
 * Create a new provisioned user
 */
export async function POST(request: NextRequest) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) {
    return scimError(401, 'Authorization Required');
  }

  try {
    const body = await request.json();
    const user = await scimService.createUser(tenantId, body);

    return NextResponse.json(user, {
      status: 201,
      headers: {
        'Content-Type': 'application/scim+json',
        'Location': `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/scim/v2/Users/${user.id}`,
      },
    });
  } catch (error) {
    console.error('[SCIM] Create user failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return scimError(400, message);
  }
}
