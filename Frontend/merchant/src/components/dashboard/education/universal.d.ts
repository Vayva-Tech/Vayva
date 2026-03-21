interface UniversalSectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
}
export declare function UniversalSectionHeader({ title, subtitle, action, className }: UniversalSectionHeaderProps): import("react/jsx-runtime").JSX.Element;
export declare function UniversalCard({ title, subtitle, children, action, className }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
