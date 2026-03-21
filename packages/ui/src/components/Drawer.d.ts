import { type ReactNode } from "react";
export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}
export declare function Drawer({ isOpen, onClose, title, children, className, }: DrawerProps): import("react/jsx-runtime").JSX.Element | null;
