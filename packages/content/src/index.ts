export * from "./types";

// Legal Docs
import { termsOfService } from "./legal/terms-of-service";
import { privacyPolicy } from "./legal/privacy-policy";
import { cookiePolicy } from "./legal/cookie-policy";
import { acceptableUse } from "./legal/acceptable-use";
import { prohibitedItems } from "./legal/prohibited-items";
import { refundPolicy } from "./legal/refund-policy";
import { merchantAgreement } from "./legal/merchant-agreement";
import { kycExplainer } from "./legal/kyc-explainer";
import { eula } from "./legal/eula";
// New comprehensive legal documents
import { dataProcessingAgreement } from "./legal/data-processing-agreement";
import { copyrightPolicy } from "./legal/copyright-policy";
import { securityPolicy } from "./legal/security-policy";
import { accessibilityStatement } from "./legal/accessibility-statement";

// Templates
import {
  defaultReturnsPolicy,
  defaultShippingPolicy,
  defaultStorePrivacy,
  defaultStoreTerms,
} from "./templates/store-policies";
import { LegalRegistry } from "./types";

// Registry
export const legalRegistry: LegalRegistry = {
  [termsOfService.slug]: termsOfService,
  [privacyPolicy.slug]: privacyPolicy,
  [cookiePolicy.slug]: cookiePolicy,
  [acceptableUse.slug]: acceptableUse,
  [prohibitedItems.slug]: prohibitedItems,
  [refundPolicy.slug]: refundPolicy,
  [merchantAgreement.slug]: merchantAgreement,
  [kycExplainer.slug]: kycExplainer,
  [eula.slug]: eula,
  // New comprehensive legal documents
  [dataProcessingAgreement.slug]: dataProcessingAgreement,
  [copyrightPolicy.slug]: copyrightPolicy,
  [securityPolicy.slug]: securityPolicy,
  [accessibilityStatement.slug]: accessibilityStatement,
};

export const storeTemplates = {
  returns: defaultReturnsPolicy,
  shipping: defaultShippingPolicy,
  privacy: defaultStorePrivacy,
  terms: defaultStoreTerms,
};

// Helper
export const getLegalDocument = (slug: string) => legalRegistry[slug];
