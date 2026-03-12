// Global registry of all possible fields.
// Using Partial<Record<FieldKey...>> or just Record<string...> casted,
// strictly we want Record<FieldKey, FieldDefinition> but we might miss some in this file vs types.
export const FIELD_REGISTRY = {
  // --- CORE IDENTITY ---
  title: { label: "Title", type: "text", placeholder: "e.g. Summer Dress" },
  name: { label: "Name", type: "text", placeholder: "Item Name" },
  price: { label: "Price", type: "number", placeholder: "0.00" },
  sku: { label: "SKU", type: "text", helpText: "Stock Keeping Unit" },
  stock: { label: "Stock Quantity", type: "number" },
  // --- DESCRIPTION & CONTENT ---
  description: { label: "Description", type: "textarea" },
  content: { label: "Content", type: "textarea" },
  // --- IMAGES & MEDIA ---
  images: {
    label: "Images",
    type: "image",
    helpText: "Upload high-quality images",
  },
  media: { label: "Media", type: "image", helpText: "Portfolio images/videos" },
  file_upload: {
    label: "Digital File",
    type: "file",
    helpText: "Downloadable asset",
  },
  preview_file: {
    label: "Preview File",
    type: "file",
    helpText: "Public preview",
  },
  // --- ATTRIBUTES ---
  weight: { label: "Weight (kg)", type: "number" },
  barcode: { label: "Barcode", type: "text" },
  brand: { label: "Brand", type: "text" },
  model_number: { label: "Model Number", type: "text" },
  warranty: { label: "Warranty Info", type: "textarea" },
  // --- FASHION ---
  size_guide: { label: "Size Guide", type: "image" },
  material: { label: "Material", type: "text" },
  care_instructions: { label: "Care Instructions", type: "textarea" },
  // --- FOOD ---
  prep_time: { label: "Prep Time (mins)", type: "number" },
  veg_non_veg: {
    label: "Dietary",
    type: "select",
    options: [
      { label: "Vegetarian", value: "veg" },
      { label: "Non-Vegetarian", value: "non_veg" },
      { label: "Vegan", value: "vegan" },
    ],
  },
  calories: { label: "Calories", type: "number" },
  allergens: { label: "Allergens", type: "tags" },
  spice_level: {
    label: "Spice Level",
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Mild", value: "mild" },
      { label: "Hot", value: "hot" },
    ],
  },
  ingredients: { label: "Ingredients", type: "textarea" },
  // --- SERVICES ---
  duration_min: { label: "Duration (mins)", type: "number" },
  provider_id: { label: "Provider", type: "text" },
  buffer: { label: "Buffer Time", type: "number" },
  remote_link: { label: "Meeting Link", type: "text" },
  // --- EVENTS ---
  event_date: { label: "Event Date", type: "date" },
  venue: { label: "Venue", type: "text" },
  ticket_quota: { label: "Capacity", type: "number" },
  seat_map: { label: "Seat Map", type: "image" },
  // --- EDUCATION ---
  curriculum: { label: "Curriculum", type: "textarea" },
  instructor: { label: "Instructor", type: "text" },
  certificate: { label: "Certificate", type: "boolean" },
  // --- REAL ESTATE ---
  location: { label: "Location", type: "text" },
  sqft: { label: "Square Footage", type: "number" },
  rooms: { label: "Rooms", type: "number" },
  virtual_tour: { label: "Virtual Tour", type: "text" },
  // --- AUTOMOTIVE ---
  make: { label: "Make", type: "text" },
  model: { label: "Model", type: "text" },
  year: { label: "Year", type: "number" },
  vin: { label: "VIN", type: "text" },
  mileage: { label: "Mileage", type: "number" },
  history_report: { label: "History Report", type: "file" },
  // --- TRAVEL ---
  dates: { label: "Dates", type: "text" },
  amenities: { label: "Amenities", type: "tags" },
  house_rules: { label: "House Rules", type: "textarea" },
  // --- GENERIC / OTHER ---
  cause: { label: "Cause", type: "text" },
  goal: { label: "Goal Funding", type: "number" },
  tags: { label: "Tags", type: "tags" },
  author: { label: "Author", type: "text" },
  client: { label: "Client", type: "text" },
  // --- B2B / MARKETPLACE ---
  vendor_id: { label: "Vendor ID", type: "text" },
  commission_rate: { label: "Commission %", type: "number" },
  vendor_sku: { label: "Vendor SKU", type: "text" },
  moq: { label: "MOQ", type: "number" },
  tier_pricing: { label: "Tier Pricing", type: "textarea" },
  lead_time: { label: "Lead Time", type: "text" },
  packaging: { label: "Packaging", type: "text" },
  // --- MISC ---
  access_settings: { label: "Access Settings", type: "text" },
  origin: { label: "Origin", type: "text" },
  nutritional_info: { label: "Nutrition Info", type: "textarea" },
  unit_weight: { label: "Unit Weight", type: "number" },
  expiry_date: { label: "Expiry Date", type: "date" },
  batch_code: { label: "Batch Code", type: "text" },
  expiry: { label: "Expiry", type: "text" },
  usage: { label: "Usage", type: "textarea" },
  specs_map: { label: "Specifications", type: "textarea" },
};
