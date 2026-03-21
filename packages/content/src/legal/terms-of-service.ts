import { LegalDocument } from "../types";

export const termsOfService: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "These comprehensive terms govern use of the Vayva platform, including merchant tools, storefronts, and related services. Please read carefully as they affect your legal rights.",
  sections: [
    {
      heading: "1. Introduction and Acceptance",
      content: [
        "Welcome to Vayva. These Terms of Service ('Terms') constitute a legally binding agreement between you and Vayva Tech ('Vayva', 'we', 'us', or 'our') governing your access to and use of the Vayva platform, websites, applications, and related services (collectively, the 'Service').",
        "By accessing, browsing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use the Service.",
        "These Terms apply to all users, including merchants, customers, visitors, and anyone else who accesses the Service. Additional terms may apply to specific features or services, and those will be provided at the time of use.",
      ],
      type: "text",
    },
    {
      heading: "2. Eligibility and Account Registration",
      content: [
        "You must be at least 18 years old, have legal capacity to enter into contracts, and be legally permitted to operate a business in your jurisdiction to use the Vayva platform. By using the Service, you represent and warrant that you meet these eligibility requirements.",
        "You must provide accurate, current, and complete registration information including your legal name, valid email address, business details, and keep this information updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
        "You may not transfer, sell, or assign your account to another party without our prior written consent. We reserve the right to require re-verification of account information at any time.",
      ],
    },
    {
      heading: "3. Service Overview and Scope",
      content: [
        "Vayva provides comprehensive e-commerce software solutions including but not limited to: online store creation and customization, inventory management, order processing, payment facilitation, customer relationship management, analytics and reporting, marketing automation, and related business tools.",
        "Vayva operates as a technology platform provider. We do not buy, sell, manufacture, warehouse, or broker goods or services offered through the Service. All transactions are conducted directly between merchants and their customers. Vayva is not a party to any sales contract between merchants and customers unless expressly stated otherwise in writing.",
        "We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, including availability of features, databases, or content, with or without notice. We are not liable for any modifications, suspensions, or discontinuations of the Service.",
      ],
    },
    {
      heading: "4. Verification, KYC and Compliance Obligations",
      content: [
        "To maintain platform security, prevent fraud, and comply with legal obligations including anti-money laundering (AML) and counter-terrorism financing (CTF) regulations, Vayva requires identity and business verification (Know Your Customer - KYC).",
        "Verification Requirements May Include: National Identity Number (NIN) verified through YouVerify or equivalent government-issued identification; Bank Verification Number (BVN) validated through Paystack or Central Bank of Nigeria database; Corporate Affairs Commission (CAC) documentation for registered businesses including certificate of incorporation, memorandum and articles of association; Proof of address such as utility bills or bank statements issued within the last 90 days; Tax identification numbers and relevant tax clearance certificates; Additional documentation as required based on transaction volume, risk profile, or regulatory requirements.",
        "Verification Process: We may use third-party verification services including YouVerify for NIN checks, Paystack for BVN validation, and manual review for CAC documents through our Operations Console. You authorize Vayva and our service providers to verify your identity using available databases and records.",
        "You agree to provide accurate, complete documentation and promptly update any changes to verification information. Failure to complete verification may result in restricted account functionality including inability to withdraw funds, receive payments, or access certain features.",
      ],
    },
    {
      heading: "5. Merchant Responsibilities and Code of Conduct",
      content: [
        "As a merchant using the Vayva platform, you are solely responsible for: The quality, safety, and legality of all goods and services you offer; Accurate product descriptions, images, pricing, and availability information; Timely fulfillment of orders and delivery within promised timeframes; Providing professional, responsive customer support; Processing returns, refunds, and exchanges in accordance with your posted policies and applicable consumer protection laws; Compliance with all applicable laws, regulations, industry standards, and these Terms including but not limited to advertising standards, product safety regulations, labeling requirements, and intellectual property laws.",
        "You warrant that you have all necessary licenses, permits, and authorizations to operate your business and sell your products or services. You must maintain appropriate insurance coverage including general liability, product liability, and professional indemnity insurance as appropriate for your business activities.",
        "You agree to treat customers fairly, respond to inquiries within 48 hours, resolve disputes in good faith, and maintain high service standards. Repeated customer complaints, negative reviews, or failure to meet performance benchmarks may result in account review, suspension, or termination.",
      ],
    },
    {
      heading: "6. Prohibited Uses and Unacceptable Activities",
      content: [
        "You agree NOT to use the Service for any illegal, fraudulent, or harmful purposes. Prohibited activities include but are not limited to:",
        "Illegal Activities: Selling prohibited items as defined in our Prohibited Items Policy; Engaging in fraud, scams, pyramid schemes, or deceptive practices; Money laundering, terrorist financing, or sanctions evasion; Identity theft, phishing, or social engineering; Harassment, discrimination, hate speech, or threats; Spamming, unsolicited commercial communications, or malware distribution.",
        "Platform Integrity: Attempting to circumvent security measures, access controls, or authentication systems; Using bots, scrapers, or automated means to access the Service without authorization; Interfering with or disrupting the Service, servers, or networks; Reverse engineering, decompiling, or attempting to derive source code from the Service; Collecting or harvesting user data without consent.",
        "Intellectual Property: Infringing copyrights, trademarks, patents, or other proprietary rights; Selling counterfeit goods or unauthorized replicas; Misappropriating trade secrets or confidential information.",
        "We reserve the right to investigate violations, suspend or terminate accounts, and report illegal activities to law enforcement authorities. We cooperate fully with legal investigations and may disclose account information as required by law.",
      ],
    },
    {
      heading: "7. Fees, Payments and Financial Terms",
      content: [
        "Subscription Fees: Vayva offers various subscription plans with different features and pricing. Fees are billed in advance on a monthly or annual basis as selected during signup. Subscription fees are non-refundable except as expressly stated in these Terms or required by law. We may change subscription fees upon 30 days' notice. Continued use after the effective date of a fee change constitutes acceptance of the new fees.",
        "Transaction Fees: Depending on your subscription plan, additional transaction fees may apply to each sale processed through Vayva Payments or integrated payment gateways. Transaction fee schedules are published at vayva.ng/pricing and may be updated periodically.",
        "Taxes: All fees are exclusive of taxes. You are responsible for paying all applicable sales taxes, VAT, GST, or similar taxes associated with your use of the Service and your sales to customers. Vayva will collect and remit applicable taxes as required by law.",
        "Payment Methods: You must provide valid payment method information such as credit card details or bank account information. You authorize Vayva to charge your payment method for all applicable fees. If payment cannot be processed, we may suspend or terminate your access to paid features until outstanding balances are settled.",
        "Fee Disputes: If you believe a charge was made in error, contact billing@vayva.ng within 7 days of the charge. Chargebacks filed without first contacting us may result in immediate account suspension. Vayva reserves the right to recover amounts reversed through chargebacks if we determine the chargeback was unjustified.",
      ],
    },
    {
      heading: "8. Data, Content and Intellectual Property Rights",
      content: [
        "Your Data Ownership: You retain all ownership rights and title to your business data, product information, customer lists, and content uploaded to the Service ('Merchant Data'). Subject to these Terms, you have the right to export, download, or transfer your Merchant Data at any time using tools provided within the Service.",
        "Limited License to Vayva: By uploading Merchant Data to the Service, you grant Vayva a worldwide, non-exclusive, royalty-free license to host, store, process, transmit, and display such data solely for the purpose of providing and improving the Service. This license includes the right to create backup copies, perform analytics on aggregated anonymized data, and use data as necessary to comply with legal obligations.",
        "Vayva Intellectual Property: All rights, title, and interest in and to the Vayva platform, including software, technology, designs, logos, trademarks, and related intellectual property, remain exclusively with Vayva. Nothing in these Terms grants you any right to use Vayva's trademarks, logos, or branding except as expressly authorized for promoting your store.",
        "Feedback and Suggestions: Any feedback, suggestions, or ideas you submit to Vayva become our sole property without compensation to you. We may use such feedback for any purpose including product development, marketing, and improvements to the Service.",
      ],
    },
    {
      heading: "9. Suspension, Termination and Account Closure",
      content: [
        "Termination by You: You may close your Vayva account at any time through the account settings or by contacting support@vayva.ng. Upon voluntary termination, you retain the right to export your data for 30 days after account closure. After this period, data may be permanently deleted in accordance with our data retention policies.",
        "Termination by Vayva: We reserve the right to suspend or terminate your access to the Service immediately, with or without notice, for conduct that we believe violates these Terms, is harmful to other users, merchants, customers, or third parties, or is otherwise unlawful, fraudulent, or objectionable. Specific grounds for termination include but are not limited to: Violation of these Terms, Privacy Policy, or other published policies; Fraudulent, deceptive, or illegal activities; Excessive chargebacks, disputes, or customer complaints; Failure to maintain required verification standards; Bankruptcy, insolvency, or cessation of business operations; Threats to platform security or integrity.",
        "Effect of Termination: Upon termination, your right to use the Service immediately ceases. All outstanding fees become immediately due and payable. We may withhold payouts for a reasonable period to cover potential chargebacks, refunds, or damages. Termination does not relieve you of obligations accrued prior to termination including payment obligations, confidentiality, and indemnification provisions.",
        "Appeal Process: If you believe your account was terminated in error, you may appeal the decision by contacting appeals@vayva.ng within 14 days of termination. Appeals are reviewed by our Trust & Safety team. Reinstatement is at Vayva's sole discretion.",
      ],
    },
    {
      heading: "10. Disclaimers and No Warranties",
      content: [
        "AS-IS SERVICE: The Vayva platform is provided on an 'as is' and 'as available' basis without warranties of any kind, whether express, implied, statutory, or otherwise. To the fullest extent permitted by law, Vayva disclaims all warranties including but not limited to: Merchantability; Fitness for a particular purpose; Non-infringement; Accuracy, reliability, completeness, or timeliness of information or content; Uninterrupted, secure, or error-free operation; Correction of defects or errors.",
        "NO GUARANTEES: We do not warrant that the Service will meet your requirements, achieve specific business outcomes, generate sales or profits, or prevent all security incidents. Your use of the Service is at your own risk and discretion.",
        "THIRD-PARTY SERVICES: The Service may integrate with or link to third-party services, applications, websites, or resources. We have no control over such third-party services and are not responsible for their availability, content, accuracy, legality, quality, or practices. Your interactions with third parties are solely between you and the third party.",
        "SOME JURISDICTIONS DO NOT ALLOW DISCLAIMER OF IMPLIED WARRANTIES. IN SUCH CASES, THE ABOVE DISCLAIMERS MAY NOT APPLY TO YOU, BUT WILL APPLY TO THE MAXIMUM EXTENT PERMITTED BY LAW.",
      ],
    },
    {
      heading: "11. Limitation of Liability",
      content: [
        "EXCLUSION OF CONSEQUENTIAL DAMAGES: TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL VAYVA, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR: LOSS OF PROFITS, REVENUE, SALES, OR BUSINESS OPPORTUNITIES; LOSS OF CUSTOMER DATA, GOODWILL, OR BUSINESS RELATIONSHIPS; LOSS OF USE, INTERRUPTION, OR DOWNTIME; COST OF SUBSTITUTE GOODS OR SERVICES; PERSONAL INJURY OR PROPERTY DAMAGE; OR ANY OTHER LOSS ARISING FROM YOUR USE OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
        "CAP ON LIABILITY: NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, VAYVA'S TOTAL AGGREGATE LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE TOTAL FEES PAID BY YOU TO VAYVA IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM; OR (B) ONE HUNDRED US DOLLARS ($100 USD). THIS CAP DOES NOT APPLY TO LIABILITY RESULTING FROM GROSS NEGLIGENCE, WILLFUL MISCONDUCT, FRAUD, OR BREACH OF CONFIDENTIALITY OBLIGATIONS.",
        "BASIS OF BARGAIN: THE LIMITATIONS AND EXCLUSIONS OF LIABILITY SET FORTH IN THESE TERMS FORM AN ESSENTIAL BASIS OF THE BARGAIN BETWEEN YOU AND VAYVA. WITHOUT THESE LIMITATIONS, THE ECONOMICS OF PROVIDING THE SERVICE WOULD BE SUBSTANTIALLY DIFFERENT.",
      ],
    },
    {
      heading: "12. Indemnification and Hold Harmless",
      content: [
        "You agree to indemnify, defend, and hold harmless Vayva, its parent company, affiliates, subsidiaries, officers, directors, employees, agents, licensors, suppliers, and partners from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees and court costs) arising out of or relating to:
        - Your use of the Service in violation of these Terms;
        - Your content, product listings, or intellectual property infringement;
        - Your goods, services, or business practices including product liability, consumer protection violations, or misrepresentation;
        - Your violation of any law, regulation, or third-party rights;
        - Claims by your customers, employees, or other third parties related to your business;
        - Your breach of any representation, warranty, or covenant in these Terms.",
        "Vayva reserves the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you shall cooperate with Vayva in asserting any available defenses. You may not settle any claim on Vayva's behalf without our prior written consent.",
      ],
    },
    {
      heading: "13. Modifications to Terms and Service",
      content: [
        "We reserve the right to modify, amend, or replace these Terms at any time at our sole discretion. When we make material changes to these Terms, we will provide you with notice appropriate to the significance of the change. Notice may be provided through: Email to the address associated with your account; Prominent notices posted on the Service; Updated 'Last Updated' date at the top of these Terms; In-app notifications or banners.",
        "Material changes typically include modifications to: Fees or payment terms; Your rights or obligations; Liability limitations; Dispute resolution procedures; Intellectual property rights; Privacy or data use practices. Minor changes such as clarifications, formatting, grammatical corrections, or non-substantive updates may be made without advance notice.",
        "Your continued use of the Service after the effective date of updated Terms constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must discontinue use of the Service before the changes take effect and close your account if necessary.",
      ],
    },
    {
      heading: "14. Governing Law, Jurisdiction and Dispute Resolution",
      content: [
        "Governing Law: These Terms and your use of the Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. The United Nations Convention on Contracts for the International Sale of Goods (CISG) does not apply.",
        "Mandatory Arbitration: Except as provided below, any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be finally resolved by binding arbitration administered by the Lagos Court of Arbitration (LCA) in accordance with its Arbitration Rules. The arbitration shall be conducted by a single arbitrator appointed in accordance with the Rules. The place of arbitration shall be Lagos, Nigeria. The language of arbitration shall be English. Judgment on the award may be entered in any court having jurisdiction.",
        "Class Action Waiver: YOU AND VAYVA AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. UNLESS BOTH YOU AND VAYVA AGREE OTHERWISE, THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON'S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF A REPRESENTATIVE OR CLASS PROCEEDING.",
        "Small Claims Exception: Notwithstanding the foregoing, either party may bring an individual action in small claims court if the claim qualifies for small claims court jurisdiction and the party provides 30 days' prior written notice. This exception does not permit class actions or representative proceedings in small claims court.
        "Court Jurisdiction: If the arbitration agreement is found unenforceable or does not apply to a particular claim, you and Vayva agree that any legal proceeding must be brought in the Federal High Court of Nigeria, Lagos Division. Both parties consent to venue and personal jurisdiction there.",
      ],
    },
    {
      heading: "15. General Provisions and Miscellaneous",
      content: [
        "Entire Agreement: These Terms, together with the Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and Vayva regarding the subject matter hereof and supersede all prior and contemporaneous agreements, proposals, or representations, whether written or oral.",
        "Severability: If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.",
        "Waiver: No waiver by Vayva of any term or condition in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition. Failure to enforce any right or remedy does not waive that right or remedy.",
        "Assignment: You may not assign or transfer your rights or obligations under these Terms without Vayva's prior written consent. Vayva may freely assign these Terms in connection with a merger, acquisition, sale of assets, financing, or other business transaction.",
        "Relationship of Parties: Nothing in these Terms creates a partnership, joint venture, agency, franchise, or employment relationship between you and Vayva. Neither party has authority to bind or obligate the other except as expressly stated.",
        "Notices: All notices to Vayva should be sent to: Legal Department, Vayva Tech, Email: legal@vayva.ng. Notices to you will be sent to your registered email address or displayed on the Service.",
        "Survival: Provisions that by their nature should survive termination shall survive termination including but not limited to: Ownership of data; Intellectual property rights; Payment obligations; Disclaimers; Limitations of liability; Indemnification; Governing law; Dispute resolution.",
      ],
    },
  ],
};

    {
      heading: "16. Contact Information and Customer Support",
      content: [
        "For general inquiries, technical support, or questions about these Terms, please contact us:",
        "Email: support@vayva.ng (Customer Support), legal@vayva.ng (Legal Department), privacy@vayva.ng (Data Protection), billing@vayva.ng (Billing Questions)",
        "Address: Vayva Tech Limited, Lagos, Nigeria",
        "Business Hours: Monday - Friday, 9:00 AM - 6:00 PM West Africa Time (WAT)",
        "Response Times: We aim to respond to all inquiries within 24-48 hours during business days. Urgent matters will be prioritized accordingly.",
      ],
      type: "text",
    },
  ],
};
