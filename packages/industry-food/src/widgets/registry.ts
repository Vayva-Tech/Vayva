// ============================================================================
// Food Industry Widget Registry
// ============================================================================
// Register food/restaurant-specific widgets
// ============================================================================

import React, { type ComponentType } from "react";
import type { WidgetProps } from "@vayva/industry-core";
import { getWidgetRegistry } from "@vayva/industry-core";
import {
  KitchenDisplaySystem,
  type KDSBoardProps,
} from "./KitchenDisplaySystem";
import {
  EightySixBoard,
  type EightySixBoardProps,
  type MenuItem86,
} from "./86Board";

const FoodKdsBoard: ComponentType<WidgetProps> = (props) => {
  const cfg = props.widget.config;
  const rawOrders =
    cfg && typeof cfg === "object" && "orders" in cfg
      ? (cfg as { orders: unknown }).orders
      : undefined;
  const orders: KDSBoardProps["orders"] = Array.isArray(rawOrders)
    ? (rawOrders as KDSBoardProps["orders"])
    : [];
  const designCategory =
    cfg && typeof cfg === "object" && "designCategory" in cfg
      ? ((cfg as { designCategory?: KDSBoardProps["designCategory"] })
          .designCategory)
      : undefined;
  return React.createElement(KitchenDisplaySystem, {
    orders,
    designCategory,
  });
};

const FoodEightySixBoard: ComponentType<WidgetProps> = (props) => {
  const cfg = props.widget.config;
  const rawItems =
    cfg && typeof cfg === "object" && "items" in cfg
      ? (cfg as { items: unknown }).items
      : undefined;
  const items: MenuItem86[] = Array.isArray(rawItems)
    ? (rawItems as MenuItem86[])
    : [];
  const designCategory =
    cfg && typeof cfg === "object" && "designCategory" in cfg
      ? ((cfg as { designCategory?: EightySixBoardProps["designCategory"] })
          .designCategory)
      : undefined;
  return React.createElement(EightySixBoard, {
    items,
    designCategory,
  });
};

/**
 * Register all food industry widgets
 */
export function registerFoodWidgets() {
  const registry = getWidgetRegistry();
  registry.register("kds-board", FoodKdsBoard);
  registry.register("86-board", FoodEightySixBoard);

  console.log("Food industry widgets registered");
}
