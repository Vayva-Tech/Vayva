// Type declarations for @phosphor-icons/react subpath imports
// These augment the package exports to support tree-shaking with Next.js

import type { Icon } from "@phosphor-icons/react";

declare module "@phosphor-icons/react/dist/ssr/*" {
  const IconComponent: Icon;
  export default IconComponent;
  export { IconComponent as Icon };
}
