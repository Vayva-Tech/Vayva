import { useToast as useSonnerToast } from "sonner";

export function Toaster() {
  const { Toaster: SonnerToaster } = await import("sonner");
  return <SonnerToaster position="bottom-right" />;
}

export function useToast() {
  const { toast } = useSonnerToast();
  return { toast };
}
