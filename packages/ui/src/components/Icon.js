import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
export const Icon = ({ name, size = 24, ...props }) => {
    const kebabName = useMemo(() => {
        return name
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/([a-zA-Z])(\d)/g, "$1-$2")
            .toLowerCase();
    }, [name]);
    const LucideIcon = useMemo(() => {
        const dynamicIcon = dynamicIconImports[kebabName];
        if (!dynamicIcon)
            return null;
        return dynamic(dynamicIcon);
    }, [kebabName]);
    if (!LucideIcon) {
        if (process.env.NODE_ENV === "development") {
            console.warn(`Icon ${name} (as ${kebabName}) not found`);
        }
        return null;
    }
    return _jsx(LucideIcon, { size: size, ...props });
};
