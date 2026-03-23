// @ts-nocheck
/**
 * Automotive Industry Services
 */

export { VehicleGalleryService } from './vehicle-gallery.service';
export type { 
  Vehicle, 
  VehicleFilter, 
  VehicleGalleryConfig 
} from './vehicle-gallery.service';

export { TestDriveCoordinatorService } from './test-drive-coordinator.service';
export type { 
  TestDrive, 
  TestDriveFeedback, 
  TestDriveSchedule, 
  TimeSlot,
  TestDriveConfig 
} from './test-drive-coordinator.service';

export { CRMConnectorService } from './crm-connector.service';
export type { 
  Customer, 
  Lead, 
  Interaction, 
  CRMConfig 
} from './crm-connector.service';
