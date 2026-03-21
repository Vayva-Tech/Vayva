import * as React from "react";
import { IconName } from "../components/Icon";
interface SuccessStateProps {
    title: string;
    description: string;
    action?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    icon?: IconName;
}
export declare function SuccessState({ title, description, action, actionLabel, onAction, icon, }: SuccessStateProps): import("react/jsx-runtime").JSX.Element;
export {};
