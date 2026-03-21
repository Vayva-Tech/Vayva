export const INDUSTRY_PROFILES = {
  fashion: {
    steps: ["basics", "branding", "collections", "shipping"],
    requiredFields: ["brandColor", "logo"],
  },
  food: {
    steps: ["basics", "menu", "delivery", "hours"],
    requiredFields: ["menu_pdf", "hygiene_rating"],
  },
  services: {
    steps: ["basics", "services", "availability", "booking_policy"],
    requiredFields: ["service_list"],
  },
  digital: {
    steps: ["basics", "file_setup", "delivery_email"],
    requiredFields: ["download_limit"],
  },
  default: {
    steps: ["basics", "branding", "products", "payments"],
    requiredFields: [],
  },
};

export function getProfileForIndustry(industry: string) {
  return (
    (INDUSTRY_PROFILES as Record<string, unknown>)[industry] ||
    INDUSTRY_PROFILES.default
  );
}
