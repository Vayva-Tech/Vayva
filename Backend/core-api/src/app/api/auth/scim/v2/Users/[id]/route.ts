/**
 * SCIM 2.0 Individual User Operations
 *
 * GET    /api/auth/scim/v2/Users/[id]  - Get user
 * PUT    /api/auth/scim/v2/Users/[id]  - Replace user
 * PATCH  /api/auth/scim/v2/Users/[id]  - Update user (add/replace/remove)
 * DELETE /api/auth/scim/v2/Users/[id]  - Deactivate user
 */

import { NextRequest, NextResponse } from 'next/server';
import { scimService, type ScimPatchOperation } from '@vayva/security';

const SCIM_SCHEMAS_ERROR = ['urn:ietf:params:scim:api:messages:2.0:Error'];

async function validateScimAuth(request: NextRequest): Promise<{ valid: boolean; tenantId?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return { valid: false };
  const token = authHeader.replace('Bearer ', '');
  return scimService.validateToken(token);
}

function scimError(status: number, detail: string) {
  return NextResponse.json(
    { schemas: SCIM_SCHEMAS_ERROR, status, detail },
    { status, headers: { 'Content-Type': 'application/scim+json' } }
  );
}

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/auth/scim/v2/Users/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) return scimError(401, 'Authorization Required');

  const { id } = await params;
  const user = await scimService.getUser(tenantId, id);
  if (!user) return scimError(404, `User ${id} not found`);

  return NextResponse.json(user, { headers: { 'Content-Type': 'application/scim+json' } });
}

/**
 * PUT /api/auth/scim/v2/Users/[id]
 * Full replacement of user attributes
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) return scimError(401, 'Authorization Required');

  const { id } = await params;
  try {
    const body = await request.json();
    const user = await scimService.updateUser(tenantId, id, body);
    return NextResponse.json(user, { headers: { 'Content-Type': 'application/scim+json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return scimError(400, message);
  }
}

/**
 * PATCH /api/auth/scim/v2/Users/[id]
 * Partial update via patch operations
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) return scimError(401, 'Authorization Required');

  const { id } = await params;
  try {
    const body = await request.json() as { Operations: ScimPatchOperation[] };
    if (!body.Operations || !Array.isArray(body.Operations)) {
      return scimError(400, 'Operations array required');
    }

    const user = await scimService.patchUser(tenantId, id, body.Operations);
    return NextResponse.json(user, { headers: { 'Content-Type': 'application/scim+json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Patch failed';
    return scimError(400, message);
  }
}

/**
 * DELETE /api/auth/scim/v2/Users/[id]
 * Deactivate user (SCIM spec: deactivate, not hard delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { valid, tenantId } = await validateScimAuth(request);
  if (!valid || !tenantId) return scimError(401, 'Authorization Required');

  const { id } = await params;
  const result = await scimService.deactivateUser(tenantId, id);

  if (!result.success) {
    return scimError(404, `User ${id} not found`);
  }

  return new NextResponse(null, { status: 204 });
}
