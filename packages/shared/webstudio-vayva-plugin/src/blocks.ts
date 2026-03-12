import { COMMERCE_BLOCKS, CommerceBlockDef } from "@vayva/shared";

/**
 * Adapter for the commerce block registry.
 * Provides metadata and helper functions for the Webstudio plugin UI.
 */

export const getCommerceBlocks = (): CommerceBlockDef[] => {
  return COMMERCE_BLOCKS;
};

export const getBlockByKey = (key: string): CommerceBlockDef | undefined => {
  return COMMERCE_BLOCKS.find((b) => b.key === key);
};

export interface BlockPlaceholderProps {
  blockKey: string;
  props: Record<string, any>;
}

/**
 * Generates the HTML snippet that will be inserted into Webstudio.
 * This snippet is parsed by the storefront runtime.
 */
export const generateBlockHtml = (
  blockKey: string,
  props: Record<string, any>,
): string => {
  let html = `<div data-vayva-block="${blockKey}"`;

  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined && value !== null && value !== "") {
      // Rule 54.4: All values stored as strings; runtime parser converts types.
      html += ` data-${key}="${String(value)}"`;
    }
  }

  html += `></div>`;
  return html;
};
