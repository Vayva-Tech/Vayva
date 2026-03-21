interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    count?: number;
}
export declare function Skeleton({ className, variant, width, height, count, }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
export declare function ProductCardSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function OrderRowSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function DashboardCardSkeleton(): import("react/jsx-runtime").JSX.Element;
export declare function TableSkeleton({ rows }: {
    rows?: number;
}): import("react/jsx-runtime").JSX.Element;
export {};
