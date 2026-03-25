import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ExportFormatSchema = z.object({
  format: z.enum(["pdf", "csv", "json", "ical"]).default("pdf"),
});

export const GET = withVayvaAPI(
  PERMISSIONS.BOOKINGS_VIEW,
  async (req: NextRequest, { storeId, params, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);

      const parseResult = ExportFormatSchema.safeParse(
        Object.fromEntries(searchParams),
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid export parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { format } = parseResult.data;

      const itinerary = await prisma.travelItinerary.findFirst({
        where: { id, storeId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          activities: {
            orderBy: [{ day: "asc" }, { startTime: "asc" }],
          },
        },
      });

      if (!itinerary) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      let exportData: string | undefined;
      let contentType: string;
      let filename: string;

      switch (format) {
        case "pdf":
          exportData = JSON.stringify({
            itinerary: {
              ...itinerary,
              activities: itinerary.activities.map((activity) => ({
                ...activity,
                date: new Date(
                  itinerary.startDate.getTime() +
                    (activity.day - 1) * 24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split("T")[0],
              })),
            },
            generatedAt: new Date().toISOString(),
            format: "PDF",
          });
          contentType = "application/json";
          filename = `itinerary-${itinerary.id}.pdf`;
          break;

        case "csv": {
          const csvRows = [
            [
              "Day",
              "Time",
              "Activity",
              "Location",
              "Description",
              "Estimated Cost",
            ],
            ...itinerary.activities.map((activity) => [
              activity.day.toString(),
              `${activity.startTime || ""}-${activity.endTime || ""}`,
              activity.title,
              activity.location || "",
              activity.description || "",
              activity.estimatedCost
                ? `${itinerary.currency} ${activity.estimatedCost}`
                : "",
            ]),
          ];
          exportData = csvRows.map((row) => row.join(",")).join("\n");
          contentType = "text/csv";
          filename = `itinerary-${itinerary.id}-activities.csv`;
          break;
        }

        case "json":
          exportData = JSON.stringify(
            {
              itinerary: {
                ...itinerary,
                activities: itinerary.activities.map((activity) => ({
                  ...activity,
                  date: new Date(
                    itinerary.startDate.getTime() +
                      (activity.day - 1) * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split("T")[0],
                })),
              },
              generatedAt: new Date().toISOString(),
              format: "JSON",
            },
            null,
            2,
          );
          contentType = "application/json";
          filename = `itinerary-${itinerary.id}.json`;
          break;

        case "ical": {
          const icalEvents = itinerary.activities
            .map((activity) => {
              const eventDate = new Date(
                itinerary.startDate.getTime() +
                  (activity.day - 1) * 24 * 60 * 60 * 1000,
              );
              return [
                "BEGIN:VEVENT",
                `UID:${activity.id}@vayva.travel`,
                `DTSTART:${eventDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
                `SUMMARY:${activity.title}`,
                `LOCATION:${activity.location || ""}`,
                `DESCRIPTION:${activity.description || ""}`,
                "END:VEVENT",
              ].join("\n");
            })
            .join("\n");

          exportData = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Vayva//Travel Itinerary//EN",
            icalEvents,
            "END:VCALENDAR",
          ].join("\n");
          contentType = "text/calendar";
          filename = `itinerary-${itinerary.id}.ics`;
          break;
        }
      }

      await prisma.travelItineraryExport.create({
        data: {
          itineraryId: id,
          format,
          exportedBy: user.id,
          storeId,
        },
      });

      return new NextResponse(exportData, {
        headers: {
          ...standardHeaders(requestId),
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error: unknown) {
      const { id: itineraryId } = await params;
      logger.error("[TRAVEL_ITINERARY_EXPORT_GET]", { error, itineraryId });
      return NextResponse.json(
        { error: "Failed to export itinerary" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
