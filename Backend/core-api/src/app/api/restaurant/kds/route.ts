import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";

class RestaurantKDSController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async getTickets(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const params = this.getQueryParams(req, {
          status: "pending",
          station: "all",
          limit: 50,
        });

        // Simulate KDS tickets
        const mockTickets = [
          {
            id: "ticket_1",
            orderId: "order_123",
            orderNumber: "ORD-001",
            tableNumber: "12",
            customerName: "John Smith",
            items: [
              {
                id: "item_1",
                name: "Grilled Salmon",
                quantity: 1,
                specialInstructions: "No lemon",
                prepTime: 15,
                station: "grill",
              },
              {
                id: "item_2",
                name: "Caesar Salad",
                quantity: 1,
                specialInstructions: "",
                prepTime: 8,
                station: "salad",
              },
            ],
            status: "preparing",
            priority: "normal",
            createdAt: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
            estimatedCompletion: new Date(Date.now() + 600000).toISOString(), // 10 mins
          },
        ];

        const filteredTickets = mockTickets.filter(ticket => 
          params.status === "all" || ticket.status === params.status
        );

        return {
          tickets: filteredTickets,
          summary: {
            pending: 8,
            preparing: 12,
            ready: 3,
            total: 23,
          },
        };
      },
      "GET_TICKETS"
    );
  }

  async updateTicketStatus(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await this.parseBody(req);
        const { status } = body;

        if (!id) {
          throw new Error("Ticket ID is required");
        }

        if (!status) {
          throw new Error("Status is required");
        }

        // Simulate status update
        return {
          id,
          status,
          updatedAt: new Date().toISOString(),
        };
      },
      "UPDATE_TICKET_STATUS",
      "Ticket status updated successfully"
    );
  }

  async getStations(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        // Simulate kitchen stations
        return {
          stations: [
            {
              id: "station_1",
              name: "Grill Station",
              isActive: true,
              currentLoad: 6,
              capacity: 8,
              assignedTickets: 4,
            },
            {
              id: "station_2",
              name: "Fry Station",
              isActive: true,
              currentLoad: 8,
              capacity: 10,
              assignedTickets: 6,
            },
            {
              id: "station_3",
              name: "Salad Station",
              isActive: true,
              currentLoad: 3,
              capacity: 5,
              assignedTickets: 2,
            },
          ],
        };
      },
      "GET_STATIONS"
    );
  }

  async updateStation(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await this.parseBody(req);

        if (!id) {
          throw new Error("Station ID is required");
        }

        // Simulate station update
        return {
          id,
          ...body,
          updatedAt: new Date().toISOString(),
        };
      },
      "UPDATE_STATION",
      "Station updated successfully"
    );
  }

  async getTiming(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        // Simulate timing analytics
        return {
          averagePrepTime: 12,
          longestTicket: 25,
          shortestTicket: 5,
          ticketsOverdue: 2,
          onTimePercentage: 87,
          busiestHour: "18:00",
          performance: {
            today: {
              avgTime: 12,
              onTime: 87,
              tickets: 45,
            },
            week: {
              avgTime: 14,
              onTime: 82,
              tickets: 315,
            },
          },
        };
      },
      "GET_TIMING"
    );
  }

  async bumpTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const body = await this.parseBody(req);
        const { ticketId } = body;

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        // Simulate bumping ticket to top of queue
        return {
          ticketId,
          bumped: true,
          newPosition: 1,
          message: "Ticket moved to top of queue",
        };
      },
      "BUMP_TICKET",
      "Ticket bumped successfully"
    );
  }
}

const controller = new RestaurantKDSController();

// GET /api/restaurant/kds/tickets - Get KDS tickets
export const TICKETS = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_VIEW, (req, context) =>
  controller.getTickets(req, context)
);

// PUT /api/restaurant/kds/tickets/:id/status - Update ticket status
export const TICKET_STATUS = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.updateTicketStatus(req, context)
);

// GET /api/restaurant/kds/stations - Get kitchen stations
export const STATIONS = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_VIEW, (req, context) =>
  controller.getStations(req, context)
);

// PUT /api/restaurant/kds/stations/:id - Update station
export const UPDATE_STATION = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_EDIT, (req, context) =>
  controller.updateStation(req, context)
);

// GET /api/restaurant/kds/timing - Get timing analytics
export const TIMING = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getTiming(req, context)
);

// POST /api/restaurant/kds/bump - Bump ticket to top
export const BUMP = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.bumpTicket(req, context)
);