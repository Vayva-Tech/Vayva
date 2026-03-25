/**
 * Kitchen / KDS types — map to @vayva/industry-restaurant KDS types.
 */

export type {
  KDSOrder,
  KDSItem,
  KDSStation,
  RecipeCost,
} from "@vayva/industry-restaurant/types";

export type { EightySixItem } from "@vayva/industry-restaurant/types";

export type { KDSOrder as Ticket } from "@vayva/industry-restaurant/types";
export type { KDSOrder as Order } from "@vayva/industry-restaurant/types";
export type { KDSItem as OrderItem } from "@vayva/industry-restaurant/types";
export type { KDSStation as KitchenStation } from "@vayva/industry-restaurant/types";
export type { RecipeCost as Recipe } from "@vayva/industry-restaurant/types";

export type WasteLog = Record<string, unknown>;
export type ShiftHandover = Record<string, unknown>;

export {
  ORDER_STATUS,
  TABLE_STATUS,
  TICKET_STATUS,
  SERVICE_PERIOD,
} from "@vayva/industry-restaurant/types/kitchen-types";
