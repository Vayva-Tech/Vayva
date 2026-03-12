export interface FoodProductMetadata {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: "MILD" | "MEDIUM" | "HOT" | "EXTRA_HOT";
  prepTimeMinutes: number;
  calories: number;
}
