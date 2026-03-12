/**
 * Events Industry Features
 */

export class EventTimelineBuilderFeature {
  constructor(timelineService) {
    this.timelineService = timelineService;
  }
  
  async initialize() {
    await this.timelineService.initialize();
  }
  
  async createEventTimeline(eventData) {
    return this.timelineService.createTimeline(eventData);
  }
  
  async getEventTimelines(filters) {
    return this.timelineService.getTimelines(filters);
  }
}

export class VendorCoordinatorFeature {
  constructor(vendorService) {
    this.vendorService = vendorService;
  }
  
  async initialize() {
    await this.vendorService.initialize();
  }
  
  async addVendor(vendorData) {
    return this.vendorService.addVendor(vendorData);
  }
  
  async getVendors(filters) {
    return this.vendorService.getVendors(filters);
  }
}

export class SeatingChartDesignerFeature {
  constructor(seatingService) {
    this.seatingService = seatingService;
  }
  
  async initialize() {
    await this.seatingService.initialize();
  }
  
  async createSeatingChart(chartData) {
    return this.seatingService.createSeatingChart(chartData);
  }
  
  async getSeatingCharts() {
    return this.seatingService.getSeatingCharts();
  }
}

export class GuestListManagerFeature {
  constructor(guestService) {
    this.guestService = guestService;
  }
  
  async initialize() {
    await this.guestService.initialize();
  }
  
  async addGuest(guestData) {
    return this.guestService.addGuest(guestData);
  }
  
  async getGuests(filters) {
    return this.guestService.getGuests(filters);
  }
  
  getGuestStats() {
    return this.guestService.getGuestStats();
  }
}