import "lucide-react";

declare module "lucide-react" {
  // Override LucideIcon to return JSX.Element explicitly, which is safer than ReactNode in mixed envs
  export type LucideIcon = (props: LucideProps) => JSX.Element;
}
