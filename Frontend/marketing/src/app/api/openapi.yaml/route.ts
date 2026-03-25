import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * GET /api/openapi.yaml
 * 
 * Returns the OpenAPI specification for the Vayva API.
 * This serves the generated OpenAPI spec from the project root.
 */
export async function GET() {
  try {
    // Try to read the generated OpenAPI spec
    const yamlPath = resolve(process.cwd(), "..", "..", "openapi.yaml");
    
    try {
      const yamlContent = readFileSync(yamlPath, "utf-8");
      
      return new NextResponse(yamlContent, {
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch {
      // If file doesn't exist, return a basic OpenAPI spec
      const basicSpec = generateBasicSpec();
      
      return new NextResponse(basicSpec, {
        headers: {
          "Content-Type": "text/yaml; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.error("[OPENAPI] Error serving spec:", error);
    return NextResponse.json(
      { error: "Failed to load OpenAPI specification" },
      { status: 500 }
    );
  }
}

function generateBasicSpec(): string {
  return `openapi: 3.1.0
info:
  title: Vayva API
  description: |
    Vayva Platform API for merchants, developers, and partners.
    
    ## Authentication
    
    The Vayva API uses API keys for authentication. You can obtain an API key
    from your merchant dashboard under Settings > API Keys.
    
    Include your API key in the Authorization header:
    \`\`\`
    Authorization: Bearer YOUR_API_KEY
    \`\`\`
    
    ## Rate Limiting
    
    API requests are rate limited based on your plan:
    - Starter: 100 requests/minute
    - Growth: 500 requests/minute
    - Pro: 2000 requests/minute
    
    ## Webhooks
    
    Configure webhook endpoints to receive real-time event notifications.
    All webhook payloads include a signature for verification.
  version: 1.0.0
  contact:
    name: Vayva Developer Support
    email: developers@vayva.ng
    url: https://vayva.ng/help
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.vayva.ng
    description: Production
  - url: https://staging-api.vayva.ng
    description: Staging

security:
  - bearerAuth: []

tags:
  - name: Authentication
    description: User authentication and session management
  - name: Orders
    description: Order creation and management
  - name: Products
    description: Product catalog management
  - name: Customers
    description: Customer management
  - name: Payments
    description: Payment processing
  - name: Webhooks
    description: Webhook configuration

paths:
  /v1/orders:
    get:
      summary: List orders
      description: Retrieve a paginated list of orders
      tags:
        - Orders
      parameters:
        - name: page
          in: query
          description: Page number
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          description: Items per page
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: status
          in: query
          description: Filter by order status
          schema:
            type: string
            enum: [pending, processing, completed, cancelled]
      responses:
        '200':
          description: List of orders
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
    
    post:
      summary: Create order
      description: Create a new order
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /v1/orders/{orderId}:
    get:
      summary: Get order
      description: Retrieve a specific order by ID
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          description: Order ID
          schema:
            type: string
      responses:
        '200':
          description: Order details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          $ref: '#/components/responses/NotFound'

  /v1/products:
    get:
      summary: List products
      description: Retrieve a paginated list of products
      tags:
        - Products
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductListResponse'
    
    post:
      summary: Create product
      description: Create a new product
      tags:
        - Products
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProductRequest'
      responses:
        '201':
          description: Product created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'

  /v1/webhooks:
    get:
      summary: List webhooks
      description: List configured webhook endpoints
      tags:
        - Webhooks
      responses:
        '200':
          description: List of webhooks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Webhook'
    
    post:
      summary: Create webhook
      description: Register a new webhook endpoint
      tags:
        - Webhooks
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWebhookRequest'
      responses:
        '201':
          description: Webhook created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Webhook'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: API key authentication

  schemas:
    Order:
      type: object
      properties:
        id:
          type: string
          description: Order ID
        orderNumber:
          type: string
          description: Human-readable order number
        status:
          type: string
          enum: [pending, processing, completed, cancelled]
        customer:
          $ref: '#/components/schemas/Customer'
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
        total:
          type: number
          description: Order total amount
        currency:
          type: string
          default: NGN
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required:
        - id
        - orderNumber
        - status
        - total
        - currency

    CreateOrderRequest:
      type: object
      properties:
        customer:
          type: object
          properties:
            name:
              type: string
            phone:
              type: string
            email:
              type: string
              format: email
        items:
          type: array
          items:
            type: object
            properties:
              productId:
                type: string
              quantity:
                type: integer
                minimum: 1
              price:
                type: number
        currency:
          type: string
          default: NGN
      required:
        - customer
        - items

    OrderListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Order'
        meta:
          type: object
          properties:
            total:
              type: integer
            page:
              type: integer
            limit:
              type: integer
            totalPages:
              type: integer

    Product:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        price:
          type: number
        currency:
          type: string
        stock:
          type: integer
        images:
          type: array
          items:
            type: string
            format: uri

    CreateProductRequest:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        price:
          type: number
          minimum: 0
        stock:
          type: integer
          minimum: 0
      required:
        - name
        - price

    Customer:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        phone:
          type: string
        email:
          type: string
          format: email

    OrderItem:
      type: object
      properties:
        productId:
          type: string
        name:
          type: string
        quantity:
          type: integer
        price:
          type: number
        total:
          type: number

    Webhook:
      type: object
      properties:
        id:
          type: string
        url:
          type: string
          format: uri
        events:
          type: array
          items:
            type: string
        secret:
          type: string
        active:
          type: boolean

    CreateWebhookRequest:
      type: object
      properties:
        url:
          type: string
          format: uri
        events:
          type: array
          items:
            type: string
            enum:
              - order.created
              - order.updated
              - order.completed
              - payment.received
              - payment.failed
      required:
        - url
        - events

    Error:
      type: object
      properties:
        success:
          type: boolean
          enum: [false]
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object

  responses:
    Unauthorized:
      description: Unauthorized - Invalid or missing API key
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    BadRequest:
      description: Bad Request - Invalid input data
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    NotFound:
      description: Not Found - Resource does not exist
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

    RateLimited:
      description: Rate Limited - Too many requests
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
          description: Request limit per minute
        X-RateLimit-Remaining:
          schema:
            type: integer
          description: Remaining requests
        X-RateLimit-Reset:
          schema:
            type: integer
          description: Unix timestamp when limit resets
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
`;
}
