import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = ({
  value,
  onChange,
  placeholder,
  rows,
  className,
  ...props
}: TextareaProps) => (
  <textarea
    className={`w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none ${className}`}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    {...props}
  />
);
