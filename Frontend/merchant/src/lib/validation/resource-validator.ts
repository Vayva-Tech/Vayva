import { INDUSTRY_CONFIG } from "@/config/industry";

interface ValidationErrors {
    [key: string]: string;
}

interface FormConfig {
    requiredFields: string[];
    validation?: {
        minImages?: number;
        minDescriptionLength?: number;
        requiredGroups?: string[];
        requireDate?: boolean;
    };
}

interface IndustryConfig {
    forms: Record<string, FormConfig>;
}

interface ValidationData {
    images?: { length: number };
    description?: string;
    specs_map?: unknown;
    sqft?: unknown;
    make?: unknown;
    location?: unknown;
    venue?: unknown;
    event_date?: unknown;
    dates?: unknown;
    file_upload?: unknown;
    [key: string]: unknown;
}

interface ValidationResult {
    valid: boolean;
    errors: ValidationErrors;
}

export function validateResource(
    industrySlug: string, 
    primaryObject: string, 
    data: ValidationData
): ValidationResult {
    const errors: ValidationErrors = {};
    
    const config = INDUSTRY_CONFIG[industrySlug as keyof typeof INDUSTRY_CONFIG] as IndustryConfig | undefined;
    if (!config)
        return { valid: false, errors: { form: "Config error" } };
    
    const formConfig = config.forms[primaryObject];
    if (!formConfig)
        return { valid: true, errors: {} };
    
    const { requiredFields, validation } = formConfig;
    
    requiredFields.forEach((field: string) => {
        const val = data[field];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
            errors[field] = "Required";
        }
    });
    
    if (validation) {
        if (validation.minImages && (!data.images || data.images?.length < validation.minImages)) {
            errors["images"] = `Min ${validation.minImages} images`;
        }
        if (validation.minDescriptionLength && data.description && data.description?.length < validation.minDescriptionLength) {
            errors["description"] = `Min ${validation.minDescriptionLength} chars`;
        }
        
        const groups = validation.requiredGroups || [];
        if (groups.includes("location") && !data.location && !data.venue) {
            errors["location"] = "Location required";
        }
        if (groups.includes("schedule") && !data.event_date && !data.dates) {
            errors["event_date"] = "Date/Schedule required";
        }
        if (groups.includes("files") && !data.file_upload) {
            errors["file_upload"] = "File required";
        }
        
        if (validation.requireDate && !data.event_date) {
            errors["event_date"] = "Date required";
        }
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}
