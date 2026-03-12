/**
 * Automotive Industry Services
 */

export { VehicleGalleryService } from './vehicle-gallery.service.js';
export type { 
  Vehicle, 
  VehicleFilter, 
  VehicleGalleryConfig 
} from './vehicle-gallery.service.js';

export { TestDriveCoordinatorService } from './test-drive-coordinator.service.js';
export type { 
  TestDrive, 
  TestDriveFeedback, 
  TestDriveSchedule, 
  TimeSlot,
  TestDriveConfig 
} from './test-drive-coordinator.service.js';

export { CRMConnectorService } from './crm-connector.service.js';
export type { 
  Customer, 
  Lead, 
  Interaction, 
  CRMConfig 
} from './crm-connector.service.js';
