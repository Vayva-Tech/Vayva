import { useToast as useSonnerToast } from "sonner";

export function Toaster() {
  import { Toaster as SonnerToaster } from "sonner";
  return <SonnerToaster position="bottom-right" />;
}

export function useToast() {
  const { toast } = useSonnerToast();
  return { toast };
}
