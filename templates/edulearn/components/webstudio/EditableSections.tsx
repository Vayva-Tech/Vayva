"use client";

import { useWebStudio } from "./WebStudioProvider";
import { ReactNode } from "react";

interface EditableSectionProps {
  children: ReactNode;
  regionId: string;
  className?: string;
}

export function EditableSection({ children, regionId, className }: EditableSectionProps) {
  const { isEditMode } = useWebStudio();
  
  return (
    <div 
      data-editable={regionId}
      className={`${className || ""} ${isEditMode ? "outline-2 outline-dashed outline-blue-400 outline-offset-4 rounded" : ""}`}
    >
      {children}
    </div>
  );
}

interface EditableTextProps {
  children: string;
  regionId: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function EditableText({ children, regionId, className, as: Component = "span" }: EditableTextProps) {
  const { isEditMode } = useWebStudio();
  
  return (
    <Component 
      data-editable-text={regionId}
      className={`${className || ""} ${isEditMode ? "cursor-text hover:bg-blue-50/50 rounded px-1" : ""}`}
    >
      {children}
    </Component>
  );
}
