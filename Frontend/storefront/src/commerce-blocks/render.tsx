"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { reportError } from "@/lib/error";
import ProductGrid from "./blocks/ProductGrid";
import FeaturedProducts from "./blocks/FeaturedProducts";
import ProductCarousel from "./blocks/ProductCarousel";
import CollectionList from "./blocks/CollectionList";
import CategoryTiles from "./blocks/CategoryTiles";
import AddToCartButton from "./blocks/AddToCartButton";
import MiniCart from "./blocks/MiniCart";
import PostList from "./blocks/PostList";
import FeaturedPost from "./blocks/FeaturedPost";
import ServiceListBlock from "./blocks/ServiceListBlock";
import BookingCalendarBlock from "./blocks/BookingCalendarBlock";
import EventListBlock from "./blocks/EventListBlock";
import TicketWidgetBlock from "./blocks/TicketWidgetBlock";
import CampaignProgressBlock from "./blocks/CampaignProgressBlock";
import DonationFormBlock from "./blocks/DonationFormBlock";
import VehicleGridBlock from "./blocks/VehicleGridBlock";
import AvailabilityCalendarBlock from "./blocks/AvailabilityCalendarBlock";
import CourseGridBlock from "./blocks/CourseGridBlock";
import EnrollmentFormBlock from "./blocks/EnrollmentFormBlock";
import PropertyGridBlock from "./blocks/PropertyGridBlock";
import PropertySearchBlock from "./blocks/PropertySearchBlock";

const BLOCK_MAP: Record<string, React.ComponentType<any>> = {
  "product-grid": ProductGrid,
  "featured-products": FeaturedProducts,
  "product-carousel": ProductCarousel,
  "collection-list": CollectionList,
  "category-tiles": CategoryTiles,
  "add-to-cart-button": AddToCartButton,
  "mini-cart": MiniCart,
  "post-list": PostList,
  "featured-post": FeaturedPost,
  "service-list": ServiceListBlock,
  "booking-calendar": BookingCalendarBlock,
  "event-list": EventListBlock,
  "ticket-widget": TicketWidgetBlock,
  "campaign-progress": CampaignProgressBlock,
  "donation-form": DonationFormBlock,
  "vehicle-grid": VehicleGridBlock,
  "availability-calendar": AvailabilityCalendarBlock,
  "course-grid": CourseGridBlock,
  "enrollment-form": EnrollmentFormBlock,
  "property-grid": PropertyGridBlock,
  "property-search": PropertySearchBlock,
};

export function renderCommerceBlocks() {
  const containers = document.querySelectorAll("[data-vayva-block]");

  containers.forEach((container) => {
    // Prevent double-rendering
    if (container.getAttribute("data-vayva-rendered") === "true") return;

    const blockKey = container.getAttribute("data-vayva-block");
    if (!blockKey) return;

    const BlockComponent = BLOCK_MAP[blockKey];
    if (!BlockComponent) {
      console.warn(`[Vayva] Unknown commerce block: ${blockKey}`);
      return;
    }

    // Extract all data-* props
    const props: Record<string, any> = {};
    const dataset = (container as HTMLElement).dataset;

    for (const key in dataset) {
      if (key === "vayvaBlock") continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let val: any = dataset[key];
      // Type conversion
      if (val === "true") val = true;
      else if (val === "false") val = false;
      else if (!isNaN(Number(val)) && val.trim() !== "") val = Number(val);

      props[key] = val;
    }

    try {
      const root = createRoot(container);
      root.render(<BlockComponent {...props} />);
      container.setAttribute("data-vayva-rendered", "true");
    } catch (err) {
      reportError(err, {
        scope: "commerce-blocks.render",
        app: "storefront",
        blockKey,
      });
      container.innerHTML = `<div class="p-4 text-xs text-red-500 border border-red-100 rounded-xl bg-red-50">Error loading ${blockKey}</div>`;
    }
  });
}
