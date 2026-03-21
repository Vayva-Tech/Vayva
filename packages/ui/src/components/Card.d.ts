import * as React from "react";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}
export declare function Card({ children, className, ...props }: CardProps): React.JSX.Element;
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}
export declare function CardHeader({ children, className, ...props }: CardHeaderProps): React.JSX.Element;
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}
export declare function CardContent({ children, className, ...props }: CardContentProps): React.JSX.Element;
