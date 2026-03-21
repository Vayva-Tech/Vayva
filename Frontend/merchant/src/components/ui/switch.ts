import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input, cn } from "@vayva/ui";
import type { ChangeEvent, InputHTMLAttributes } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Switch = ({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) => {
  return _jsxs("div", {
    className: "relative inline-flex items-center",
    children: [
      _jsx("input", {
        type: "checkbox",
        id: props.id || "switch-toggle",
        checked: checked,
        onChange: (e: ChangeEvent<HTMLInputElement>) => onCheckedChange(e.target.checked),
        disabled: disabled,
        className: "sr-only",
        ...props,
      }),
      _jsx("label", {
        htmlFor: props.id || "switch-toggle",
        className: cn(
          "w-11 h-6 rounded-full relative transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 cursor-pointer",
          checked ? "bg-green-500" : "bg-white-3",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        ),
        children: _jsx("span", {
          className: cn(
            "block w-5 h-5 bg-white rounded-full shadow-sm transition-transform transform",
            checked ? "translate-x-5" : "translate-x-0.5",
            "mt-0.5 ml-0.5",
          ),
        }),
      }),
    ],
  });
};
