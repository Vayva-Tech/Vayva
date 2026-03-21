import { LegalDocument } from "../types";

export const prohibitedItems: LegalDocument = {
  slug: "prohibited-items",
  title: "Prohibited Items Policy",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary:
    "Comprehensive list of items, products, and activities that are strictly prohibited on the Vayva platform to ensure user safety and legal compliance.",
  sections: [
    {
      heading: "1. Overview and Zero-Tolerance Categories",
      content: [
        "Vayva maintains strict prohibitions on certain items to protect users, comply with laws, and maintain platform integrity. Merchants found listing prohibited items face immediate suspension, product removal, account termination, and potential reporting to law enforcement.",
        "This policy applies to all listings, products, services, digital goods, and content offered through Vayva stores and marketplace. It is your responsibility to understand and comply with these restrictions.",
      ],
    },
    {
      heading: "2. Absolutely Prohibited - Illegal Items",
      content: [
        "The following items are strictly prohibited and may result in immediate account termination and law enforcement referral:",
        "Controlled Substances: Illegal drugs, narcotics, controlled substances without prescription, drug paraphernalia, precursor chemicals, synthetic drugs, substances banned under Nigerian Dangerous Drugs Act or international conventions.",
        "Weapons and Explosives: Firearms, ammunition, explosives, grenades, landmines, bombs, incendiary devices, silencers, firearm parts and accessories, replica weapons designed to appear real, switchblades, ballistic knives, nunchucks, martial arts weapons.",
        "Hazardous Materials: Toxic substances, radioactive materials, biological hazards, chemical weapons, asbestos, lead-painted items, recalled consumer products posing safety risks.",
        "Counterfeit and Stolen Goods: Fake designer products, unauthorized replicas, stolen property, items with removed serial numbers, bootleg recordings, pirated software or media.",
        "Human Trafficking and Exploitation: Any items or services involving human trafficking, forced labor, sexual exploitation, or modern slavery.",
      ],
    },
    {
      heading: "3. Prohibited - Regulated Items Without Authorization",
      content: [
        "These items require specific licenses, permits, or regulatory approval. Listing without proper authorization is prohibited:",
        "Alcohol and Tobacco: Alcoholic beverages, cigarettes, cigars, vaping products, e-cigarettes, loose tobacco, hookah products. Licensed retailers must provide valid permits and comply with age verification requirements.",
        "Pharmaceuticals and Medical Devices: Prescription medications, over-the-counter drugs, medical equipment, diagnostic tests, contact lenses, hearing aids. Licensed pharmacies must provide pharmacy license and pharmacist credentials.",
        "Financial Services: Investment products, securities, cryptocurrencies, money transmission, payday loans, credit repair services, debt collection. Must comply with SEC Nigeria, Central Bank regulations.",
        "Food and Supplements: Unapproved food additives, contaminated products, misbranded items, unregistered health supplements, weight loss products making medical claims, bodybuilding substances containing controlled ingredients.",
        "Animals and Wildlife: Endangered species, protected wildlife products (ivory, rhino horn, tiger products), live animals, pets, exotic animals, animal testing products, fur from endangered species, items violating CITES treaty.",
      ],
    },
    {
      heading: "4. Prohibited - Adult and Offensive Content",
      content: [
        "The following adult-oriented and offensive materials are prohibited:",
        "Pornography and Adult Content: Pornographic materials, sexually explicit images or videos, sex toys and adult novelties, erotic literature, webcam services, escort services, prostitution.",
        "Offensive Materials: Hate speech materials, racist propaganda, items promoting discrimination based on race, ethnicity, religion, gender, sexual orientation, disability; Nazi memorabilia, Confederate flags, extremist materials.",
        "Violence and Harm: Depictions of extreme violence, gore, torture, animal cruelty, snuff films, instructional materials for self-harm or suicide, glorification of violent extremism.",
      ],
    },
    {
      heading: "5. Prohibited - Fraudulent and Deceptive Items",
      content: [
        "Items designed to deceive, defraud, or mislead consumers are strictly prohibited:",
        "Fraudulent Documents: Fake IDs, counterfeit currency, forged documents, fake diplomas and certificates, fraudulent tax forms, stolen credit card information, bank dumps, CVV shops.",
        "Deceptive Products: Miracle cures, snake oil remedies, products with false advertising, bait-and-switch schemes, pyramid schemes, Ponzi schemes, get-rich-quick systems.",
        "Gaming and Gambling: Lottery tickets, sweepstakes entries, slot machines, roulette wheels, loaded dice, marked cards, devices designed to cheat casinos or gambling operations.",
      ],
    },
    {
      heading: "6. Prohibited - Privacy and Security Violations",
      content: [
        "Items that violate privacy or enable unauthorized access are prohibited:",
        "Surveillance Equipment: Hidden cameras, wiretap devices, phone tapping equipment, GPS trackers intended for stalking, spyware, keyloggers when marketed for unauthorized surveillance.",
        "Hacking Tools: Malware, viruses, ransomware, DDoS tools, phishing kits, credential stuffing software, darknet market access, stolen database access.",
        "Personal Information: Social Security numbers, driver's license data, passport information, medical records, financial account details, email lists harvested without consent, doxxing packages.",
      ],
    },
    {
      heading: "7. Prohibited - Intellectual Property Infringement",
      content: [
        "Items infringing intellectual property rights are prohibited:",
        "Copyright Violation: Bootleg DVDs, pirated software, unauthorized music downloads, ebook piracy, streaming devices preloaded with illegal addons, torrent sites access.",
        "Trademark Violation: Unauthorized use of brand names, logos, character likenesses, sports team merchandise without licensing, celebrity name misuse, domain names infringing trademarks.",
        "Patent Violation: Products infringing valid patents, knockoff designs, unauthorized manufacturing of patented inventions.",
      ],
    },
    {
      heading: "8. Restricted Items Requiring Special Handling",
      content: [
        "These items may be listed only if you meet specific requirements and obtain prior approval:",
        "Cosmetics and Beauty: Must comply with FDA/Nigeria NAFDAC regulations, proper ingredient labeling, no animal testing, accurate claims substantiation.",
        "Children's Products: Must meet safety standards, CPSIA compliance (or equivalent), proper age grading, lead and phthalate testing, tracking labels.",
        "Electronics: Must have proper safety certifications (CE, FCC, UL), accurate specifications, battery safety compliance, proper voltage ratings.",
        "Supplements and Vitamins: Must be manufactured in GMP-certified facilities, accurate ingredient disclosure, no unapproved disease claims, proper dosage instructions.",
      ],
    },
    {
      heading: "9. Digital Goods and Services Restrictions",
      content: [
        "Digital products and services must comply with these restrictions:",
        "Software: Must be legitimate copies with proper licensing, no cracks or keygens, no malware or spyware, accurate functionality descriptions.",
        "Online Courses: Must provide actual educational value, no plagiarism, accurate instructor credentials, refund policy compliance.",
        "Templates and Themes: Must be original work or properly licensed, no nulled premium themes, no GPL violations.",
      ],
    },
    {
      heading: "10. Enforcement and Reporting Mechanisms",
      content: [
        "Detection Methods: We use automated scanning, image recognition, AI-powered content analysis, manual reviews, user reports, and law enforcement tips to identify prohibited items.",
        "Enforcement Actions: Upon detecting prohibited items, we may: Remove listings immediately; Issue warnings and require policy acknowledgment; Suspend selling privileges temporarily; Permanently terminate accounts for repeat or egregious violations; Withhold funds to cover chargebacks and refunds; Report illegal activity to authorities; Cooperate with investigations.",
        "Appeals Process: If you believe an enforcement action was mistaken, submit an appeal to compliance-appeals@vayva.ng within 14 days with supporting documentation. Appeals are reviewed by our Trust & Safety team.",
      ],
    },
    {
      heading: "11. Merchant Responsibilities and Best Practices",
      content: [
        "You are responsible for understanding what you sell. Before listing, ask yourself: Is this item legal in my jurisdiction and my customer's jurisdiction? Does it comply with safety standards? Am I authorized to sell branded items? Are my product descriptions accurate and truthful? Would a reasonable person find this item offensive or harmful?",
        "When in doubt, do not list the item. Contact compliance@vayva.ng for clarification. Policies are updated periodically; check for changes regularly.",
      ],
    },
    {
      heading: "12. Reporting Prohibited Items",
      content: [
        "If you encounter suspected prohibited items on Vayva, please report them:",
        "Email: abuse@vayva.ng or compliance@vayva.ng\nInclude: URL of the listing, product name, merchant name, description of violation, any evidence such as screenshots.",
        "We take all reports seriously and investigate promptly. Reporters' identities are kept confidential to the extent permitted by law. We appreciate your help in keeping the Vayva community safe.",
      ],
      type: "callout-important",
    },
  ],
};
