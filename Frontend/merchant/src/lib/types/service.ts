export interface ServiceProductMetadata {
  durationMinutes: number;
  bufferTimeMinutes?: number;
  location:
    | "IN_STORE"
    | "HOME_SERVICE"
    | "VIRTUAL"
    | "ONLINE"
    | "ON_SITE"
    | "CLIENT_LOCATION";
  isBookingRequired?: boolean;
}
