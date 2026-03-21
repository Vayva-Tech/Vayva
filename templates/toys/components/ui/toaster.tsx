import { useToast as useSonnerToast, Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return <SonnerToaster position="bottom-right" />;
}

export function useToast() {
  const { toast } = useSonnerToast();
  return { toast };
}
