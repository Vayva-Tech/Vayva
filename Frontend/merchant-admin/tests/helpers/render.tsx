import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function that wraps components with necessary providers
 * Add any global providers here (e.g., ThemeProvider, QueryClientProvider, etc.)
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Add providers here as needed
  // Example:
  // return (
  //   <ThemeProvider>
  //     <QueryClientProvider client={queryClient}>
  //       {children}
  //     </QueryClientProvider>
  //   </ThemeProvider>
  // );

  return <>{children}</>;
};

/**
 * Custom render function with providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };
