export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT - Abuja",
];

export interface Address {
  addressLine1: string;
  city: string; // Used for "City / LGA"
  state: string;
  landmark?: string;
}

export function validateAddressNG(addr: Partial<Address>): {
  valid: boolean;
  error?: string;
} {
  if (!addr.addressLine1 || addr.addressLine1.length < 5)
    return { valid: false, error: "Address line too short" };
  if (!addr.city) return { valid: false, error: "City / LGA is required" };
  if (!addr.state || !NIGERIAN_STATES.includes(addr.state))
    return { valid: false, error: "Valid State is required" };
  if (!addr.landmark || addr.landmark.length < 3)
    return { valid: false, error: "Nearest Landmark is required" };

  return { valid: true };
}
