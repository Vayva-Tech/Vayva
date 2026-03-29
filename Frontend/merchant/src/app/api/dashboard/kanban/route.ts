import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

// ============================================================================
// Types
// ============================================================================
interface KanbanOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  firstItemName: string;
  total: number;
  createdAt: string;
  expectedDeliveryDate: string;
  status: "pending" | "processing" | "delivered" | "cancelled";
  itemCount: number;
  paymentMethod: string;
}

interface KanbanResponse {
  success: boolean;
  data: {
    pending: KanbanOrder[];
    processing: KanbanOrder[];
    delivered: KanbanOrder[];
    cancelled: KanbanOrder[];
  };
}

// ============================================================================
// Demo data generator — returns realistic orders seeded from today's date
// so the data feels fresh on every visit but stays stable within a session.
// When a real backend endpoint is wired, replace this function body with
//   const result = await apiJson<KanbanResponse>(
//     `${process.env.BACKEND_API_URL}/api/dashboard/kanban?limit=8`,
//     { headers: auth.headers }
//   );
// ============================================================================
function generateKanbanData(): KanbanResponse {
  const now = new Date();

  const customers = [
    "Adebayo Ogunlesi", "Fatima Al-Rashid", "Chen Wei", "Priya Sharma",
    "James Okonkwo", "Aminata Diallo", "Yusuf Ibrahim", "Grace Ndlovu",
    "Emeka Uzoma", "Zainab Bello", "Kofi Mensah", "Nneka Obi",
    "Tunde Bakare", "Aisha Mohammed", "David Oluwaseun", "Blessing Eze",
  ];

  const items = [
    "Wireless Earbuds Pro", "Leather Messenger Bag", "Organic Shea Butter Set",
    "Smart Watch Band", "Ankara Print Fabric (3yd)", "Handmade Bead Necklace",
    "Natural Hair Oil Bundle", "Phone Case (Custom)", "Canvas Tote Bag",
    "Scented Candle Gift Set", "Ceramic Mug Set", "Laptop Sleeve 15\"",
    "Essential Oil Diffuser", "Wooden Desk Organizer", "Bamboo Water Bottle",
    "Handwoven Basket", "Skincare Starter Kit", "Artisan Soap Collection",
  ];

  const paymentMethods = ["paystack", "flutterwave", "cod", "wallet"];

  function makeOrder(
    index: number,
    status: KanbanOrder["status"],
    daysAgo: number,
    deliveryDaysFromNow: number,
  ): KanbanOrder {
    const created = new Date(now);
    created.setDate(created.getDate() - daysAgo);
    const delivery = new Date(now);
    delivery.setDate(delivery.getDate() + deliveryDaysFromNow);

    return {
      id: `ord_${status}_${index}`,
      orderNumber: `ORD-${1000 + index}`,
      customerName: customers[index % customers.length],
      firstItemName: items[index % items.length],
      total: Math.round((1500 + index * 730 + (index % 3) * 2100) * 100) / 100,
      createdAt: created.toISOString(),
      expectedDeliveryDate: delivery.toISOString(),
      status,
      itemCount: 1 + (index % 4),
      paymentMethod: paymentMethods[index % paymentMethods.length],
    };
  }

  return {
    success: true,
    data: {
      pending: [
        makeOrder(0, "pending", 0, 5),
        makeOrder(1, "pending", 1, 4),
        makeOrder(2, "pending", 2, 6),
        makeOrder(3, "pending", 0, 3),
        makeOrder(4, "pending", 3, 7),
      ],
      processing: [
        makeOrder(5, "processing", 2, 3),
        makeOrder(6, "processing", 1, 2),
        makeOrder(7, "processing", 3, 1),
        makeOrder(8, "processing", 4, 2),
      ],
      delivered: [
        makeOrder(9, "delivered", 5, -1),
        makeOrder(10, "delivered", 7, -3),
        makeOrder(11, "delivered", 4, -1),
        makeOrder(12, "delivered", 6, -2),
        makeOrder(13, "delivered", 8, -4),
      ],
      cancelled: [
        makeOrder(14, "cancelled", 3, 0),
        makeOrder(15, "cancelled", 6, 0),
      ],
    },
  };
}

// GET /api/dashboard/kanban - Get orders grouped by status for kanban board
export async function GET(request: NextRequest) {
  try {
    const result = generateKanbanData();
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/dashboard/kanban",
      operation: "GET_KANBAN_ORDERS",
    });
    return NextResponse.json(
      { error: "Failed to fetch kanban orders" },
      { status: 500 },
    );
  }
}
