/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({
  value,
  onChange,
  placeholder,
  rows,
  className,
  ...props
}: TextareaProps) => (
  <textarea
    className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none ${className}`}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    {...props}
  />
);
