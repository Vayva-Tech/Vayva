import { LegalDocument } from "../types";

export const accessibilityStatement: LegalDocument = {
  slug: "accessibility",
  title: "Accessibility Statement",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "Our commitment to ensuring the Vayva platform is accessible to all users, including those with disabilities.",
  sections: [
    {
      heading: "1. Commitment to Accessibility",
      content: [
        "Vayva is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure we provide equal access to all users.",
        "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, developed by the World Wide Web Consortium (W3C). These guidelines explain how to make web content accessible to people with visual, auditory, motor, and cognitive impairments.",
      ],
      type: "text",
    },
    {
      heading: "2. Accessibility Features",
      content: [
        "The Vayva platform incorporates numerous accessibility features including: Keyboard navigation support allowing full functionality without a mouse; Screen reader compatibility optimized for JAWS, NVDA, VoiceOver, and TalkBack; Sufficient color contrast ratios meeting WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text); Alternative text for images enabling understanding of visual content; Clear heading structure and semantic HTML for easy navigation; Focus indicators showing which element has keyboard focus; Resizable text that remains functional when zoomed up to 200%; Consistent navigation and layout across all pages; Error identification and suggestions in forms; Captions and transcripts for video content; Plain language explanations avoiding unnecessary jargon.",
      ],
      type: "text",
    },
    {
      heading: "3. Conformance Status",
      content: [
        "The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Vayva is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.",
        "We have engaged external accessibility consultants to conduct regular audits using automated tools and manual testing with assistive technologies. Our most recent audit was conducted in Q1 2026.",
      ],
      type: "text",
    },
    {
      heading: "4. Known Limitations",
      content: [
        "Despite our best efforts to ensure accessibility, there may be some limitations. Below is a description of known limitations and potential solutions:",
        "Third-party content: Some third-party integrations may not be fully accessible. We work with vendors to improve their accessibility but cannot guarantee full compliance. Workaround: Contact support for assistance with inaccessible third-party features.",
        "Legacy content: Older content published before our current accessibility standards may lack some features such as alt text or captions. We are systematically reviewing and updating legacy content with priority given to frequently accessed materials.",
        "User-generated content: Product descriptions, images, and reviews uploaded by merchants may not meet accessibility standards. We provide guidance to merchants on creating accessible content and are developing automated tools to detect and remediate accessibility issues.",
        "PDF documents: Some PDFs may not be fully accessible. We are converting essential PDFs to accessible HTML format where possible and remediating remaining PDFs to meet PDF/UA standards.",
      ],
      type: "text",
    },
    {
      heading: "5. Feedback Mechanism",
      content: [
        "We welcome your feedback on the accessibility of Vayva. Please let us know if you encounter accessibility barriers when using our platform:",
        "Email: accessibility@vayva.ng; Phone: +234-XXX-XXX-XXXX (Monday-Friday, 9am-5pm WAT); Address: Accessibility Team, Vayva Tech, Lagos, Nigeria.",
        "We try to respond to feedback within 2 business days and provide realistic timelines for fixing identified issues. Your feedback helps us prioritize improvements.",
      ],
      type: "callout-important",
    },
    {
      heading: "6. Technical Requirements",
      content: [
        "Vayva is designed to be compatible with the following assistive technologies: Screen readers (JAWS 2020+, NVDA 2020+, VoiceOver iOS 13+, TalkBack Android 9+); Voice recognition software (Dragon NaturallySpeaking 13+); Screen magnification software (ZoomText, Magnifier); Alternative input devices (switch controls, eye tracking systems).",
        "For optimal accessibility, we recommend using modern browsers including Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Older browser versions may have reduced accessibility support.",
      ],
      type: "text",
    },
    {
      heading: "7. Assessment Methods",
      content: [
        "Vayva assessed the accessibility of this website by the following approaches: Self-evaluation using automated testing tools such as axe, WAVE, and Lighthouse; Manual testing by trained accessibility specialists; User testing involving people with disabilities; External audits conducted by independent accessibility consultants.",
        "Testing is integrated into our development process. Every new feature undergoes accessibility review before deployment. We maintain an accessibility issue tracker and publish quarterly progress reports on remediation efforts.",
      ],
      type: "text",
    },
    {
      heading: "8. Training and Awareness",
      content: [
        "All Vayva product managers, designers, and developers complete mandatory accessibility training. Training covers WCAG guidelines, assistive technology usage, inclusive design principles, and practical implementation techniques.",
        "Accessibility champions within each engineering team provide ongoing guidance and code review. We maintain an internal accessibility knowledge base with patterns, anti-patterns, and platform-specific guidance.",
      ],
      type: "text",
    },
    {
      heading: "9. Enforcement Procedure",
      content: [
        "If you are not satisfied with our response to your accessibility concern, you may escalate your complaint to: Head of Product, Vayva Tech, Email: product@vayva.ng.",
        "You also have the right to file a complaint with relevant disability rights organizations or government agencies. In Nigeria, complaints can be directed to the Joint National Association of Persons with Disabilities (JONAPWD). Users in other jurisdictions may contact their local civil rights enforcement agencies.",
      ],
      type: "text",
    },
    {
      heading: "10. Continuous Improvement",
      content: [
        "Accessibility is an ongoing commitment. We regularly review this statement and update it to reflect changes in our practices, technology, and user feedback.",
        "Our product roadmap includes dedicated accessibility initiatives each quarter. We allocate engineering resources specifically for accessibility improvements and maintain a public accessibility issue tracker showing our progress.",
        "We participate in the accessibility community through conferences, working groups, and open source contributions. We believe accessibility benefits everyone and drives innovation.",
      ],
      type: "text",
    },
    {
      heading: "11. Date of Statement",
      content: [
        "This statement was created on March 18, 2026. It was last updated on March 18, 2026. We review our accessibility statement annually or whenever significant changes are made to the platform.",
      ],
      type: "text",
    },
  ],
};
