import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "../utils";
import { Icon } from "./Icon";
export function Stepper({ steps, currentStep, className }) {
    return (_jsx("div", { className: cn("flex items-center justify-between w-full", className), children: steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-200", isCompleted
                                    ? "bg-[#46EC13] border-[#46EC13] text-black"
                                    : isCurrent
                                        ? "border-[#46EC13] text-[#46EC13]"
                                        : "border-white/20 text-white/40"), children: isCompleted ? (_jsx(Icon, { name: "Check", size: 16 })) : (_jsx("span", { className: "text-sm font-bold", children: index + 1 })) }), step.label && (_jsx("span", { className: cn("text-xs font-medium hidden md:block", isCurrent || isCompleted ? "text-white" : "text-white/40"), children: step.label }))] }), index < steps.length - 1 && (_jsx("div", { className: cn("flex-1 h-[1px] mx-4 transition-colors duration-200", index < currentStep ? "bg-[#46EC13]" : "bg-white/10") }))] }, step.id));
        }) }));
}
