// @vayva/security - SAML SSO, fraud detection and security utilities

// SAML SSO
export {
  SamlSsoProvider,
  samlSsoProvider,
  registerIdentityProvider,
  createAuthRequest,
  processSamlResponse,
  initiateLogout,
  getServiceProviderMetadata,
  type SamlIdentityProvider,
  type SamlServiceProvider,
  type SamlUser,
  type SamlAuthRequest,
  type SamlAuthResponse,
  type SsoSession,
} from "./saml/sso";

// Fraud Detection
export {
  FraudDetectionService,
  fraudDetectionService,
  type FraudAssessment,
  type FraudCheck,
  type FraudRule,
  type FraudStats,
} from "./fraud-detection.service";

export { mlRiskScorer } from "./fraud/ml-scorer";

export { roleMappingService } from "./saml/role-mapping";
export {
  scimService,
  type ScimPatchOperation,
} from "./scim/scim-service";
