export type CommerceBlockPropType = "string" | "number" | "boolean" | "select" | "list";
export interface CommerceBlockPropDef {
    key: string;
    name: string;
    type: CommerceBlockPropType;
    description?: string;
    options?: {
        label: string;
        value: string | number;
    }[];
    defaultValue?: any;
}
export interface CommerceBlockDef {
    key: string;
    name: string;
    description: string;
    icon?: string;
    props: CommerceBlockPropDef[];
}
export declare const COMMERCE_BLOCKS: CommerceBlockDef[];
//# sourceMappingURL=registry.d.ts.map