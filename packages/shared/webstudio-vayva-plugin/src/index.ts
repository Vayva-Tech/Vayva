import { VayvaPanel } from "./panel";
import { BlockPlaceholder } from "./preview";

/**
 * Entry point for the Vayva Webstudio Plugin.
 * This object follows the Webstudio Extension API format.
 */
export const VayvaWebstudioPlugin = {
  id: "vayva-commerce",
  name: "Vayva",
  version: "1.0.0",

  /**
   * Defines the sidebar panel
   */
  panel: VayvaPanel,

  /**
   * Tells Webstudio how to render our custom elements in the editor canvas.
   * This implements Level A Editor Preview.
   */
  canvas: {
    // When Webstudio sees an element with our data attribute, it renders this component
    renderElement: (element: HTMLElement) => {
      const blockKey = element.getAttribute("data-vayva-block");
      if (!blockKey) return null;

      // Extract props from data-* attributes
      const props: Record<string, any> = {};
      const dataset = element.dataset;
      for (const key in dataset) {
        if (key !== "vayvaBlock") {
          props[key] = dataset[key];
        }
      }

      return {
        component: BlockPlaceholder,
        props: { blockKey, props },
      };
    },
  },
};

export default VayvaWebstudioPlugin;
