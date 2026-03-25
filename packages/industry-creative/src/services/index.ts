/**
 * Creative Industry Services
 */

export { PortfolioManagementService } from './portfolio.service';
export type { PortfolioItem, PortfolioFilter } from './portfolio.service';

export { ClientProofingService } from './proofing.service';
export type {
  ProofingRequest,
  ProofingItem,
  Annotation,
  AnnotationReply,
} from './proofing.service';

export { RevisionControlService } from './revision.service';
export type {
  Revision,
  Change,
  RevisionFile,
} from './revision.service';

export { ProjectWorkflowService } from './workflow.service';
export type {
  WorkflowBoard,
  WorkflowColumn,
  WorkflowTask,
  TaskAttachment,
  TaskComment,
} from './workflow.service';
