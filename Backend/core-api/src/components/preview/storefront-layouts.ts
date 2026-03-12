import React from "react";
import {
  AAFashionHome,
  AutoDealerHome,
  BloomeHomeLayout,
  BooklyLayout,
  BulkTradeLayout,
  ChopnowLayout,
  EduflowLayout,
  EditorialHome,
  FileVaultLayout,
  GiveFlowLayout,
  GizmoTechHome,
  HomeListLayout,
  MarketHubLayout,
  OneProductLayout,
  StaycationHome,
  TicketlyLayout,
} from "@vayva/templates";

export type LayoutKey =
  | "AAFashionHome"
  | "GizmoTechHome"
  | "BloomeHomeLayout"
  | "BooklyLayout"
  | "ChopnowLayout"
  | "FileVaultLayout"
  | "TicketlyLayout"
  | "EduflowLayout"
  | "BulkTradeLayout"
  | "MarketHubLayout"
  | "GiveFlowLayout"
  | "HomeListLayout"
  | "OneProductLayout"
  | "AutoDealerHome"
  | "StaycationHome"
  | "EditorialHome";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAYOUTS: Record<LayoutKey, React.ComponentType<any>> = {
  AAFashionHome,
  GizmoTechHome,
  BloomeHomeLayout,
  BooklyLayout,
  ChopnowLayout,
  FileVaultLayout,
  TicketlyLayout,
  EduflowLayout,
  BulkTradeLayout,
  MarketHubLayout,
  GiveFlowLayout,
  HomeListLayout,
  OneProductLayout,
  AutoDealerHome,
  StaycationHome,
  EditorialHome,
};

export function getStorefrontLayout(layoutKey?: LayoutKey | null) {
  if (!layoutKey) return null;
  return LAYOUTS[layoutKey] ?? null;
}
