/**
 * Creative Industry Services
 */

export { PortfolioManagementService } from './portfolio.service.js';
export type { PortfolioItem, PortfolioFilter } from './portfolio.service.js';

export { ClientProofingService } from './proofing.service.js';
export type {
  ProofingRequest,
  ProofingItem,
  Annotation,
  AnnotationReply,
} from './proofing.service.js';

export { RevisionControlService } from './revision.service.js';
export type {
  Revision,
  Change,
  RevisionFile,
} from './revision.service.js';

export { ProjectWorkflowService } from './workflow.service.js';
export type {
  WorkflowBoard,
  WorkflowColumn,
  WorkflowTask,
  TaskAttachment,
  TaskComment,
} from './workflow.service.js';
