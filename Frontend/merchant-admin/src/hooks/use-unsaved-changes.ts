import { useEffect } from "react";

/**
 * Hook to prevent accidental navigation when a form is dirty.
 * Handles browser-level beforeunload events.
 *
 * @param isDirty Whether the form has unsaved changes
 * @param message Optional message (most modern browsers show a generic one regardless)
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message = "You have unsaved changes. Are you sure you want to leave?",
) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, message]);
}
