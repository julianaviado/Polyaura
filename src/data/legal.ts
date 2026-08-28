/**
 * Boilerplate legal copy for the Terms of Service and Privacy Policy modals.
 * Placeholder text for the portfolio demo; a real deployment would replace it
 * with counsel-reviewed documents.
 */

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalDocument = {
  id: "terms" | "privacy";
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export const TERMS_OF_SERVICE: LegalDocument = {
  id: "terms",
  title: "Terms of Service",
  effectiveDate: "January 1, 2026",
  sections: [
    {
      heading: "1. Acceptance of terms",
      body: "By accessing or using Polyaura (the Service), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. We may update these terms from time to time; continued use after changes take effect constitutes acceptance of the revised terms.",
    },
    {
      heading: "2. Description of the service",
      body: "Polyaura provides an assistant interface for exploring design documentation and answering questions about design systems. The Service is provided on an as-is and as-available basis. We do not guarantee that responses are accurate, complete, or fit for any particular purpose, and you should verify important information independently.",
    },
    {
      heading: "3. Your account and content",
      body: "You are responsible for the content you submit, including messages and uploaded documents. You retain ownership of your content. By submitting content you grant us a limited license to process it solely to operate the Service. You agree not to upload content that is unlawful, infringing, or that you do not have the right to share.",
    },
    {
      heading: "4. Acceptable use",
      body: "You agree not to misuse the Service, including attempting to disrupt its operation, accessing it by automated means outside documented interfaces, reverse engineering its components, or using it to generate content that violates applicable law.",
    },
    {
      heading: "5. Limitation of liability",
      body: "To the maximum extent permitted by law, Polyaura and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of data or profits, even if advised of the possibility of such damages.",
    },
    {
      heading: "6. Termination",
      body: "We may suspend or terminate access to the Service at any time for conduct that violates these terms. You may stop using the Service at any time. Sections that by their nature should survive termination will survive, including limitations of liability.",
    },
    {
      heading: "7. Contact",
      body: "Questions about these terms can be sent to legal@polyaura.example. This address is a placeholder for the demonstration build.",
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Privacy Policy",
  effectiveDate: "January 1, 2026",
  sections: [
    {
      heading: "1. Information we collect",
      body: "The Service stores the conversations you create, the documents you upload, and your workspace preferences. In this demonstration build, all of that data stays in your browser's local storage and is never transmitted to a server.",
    },
    {
      heading: "2. How we use information",
      body: "Conversation content is used to generate responses and to power features you invoke, such as search and saved memories. Preferences are used to restore your workspace between visits. We do not sell personal information and we do not use your content for advertising.",
    },
    {
      heading: "3. Data retention and deletion",
      body: "Data persists until you delete it. You can remove individual conversations from the sidebar, or clear everything at once from the account menu. Clearing your browser's site data for this origin also removes all stored content.",
    },
    {
      heading: "4. Cookies and local storage",
      body: "The Service uses browser local storage to keep your conversations and settings on your device. It does not set tracking cookies and does not embed third-party analytics.",
    },
    {
      heading: "5. Security",
      body: "Because data in this build never leaves your device, its security depends on the security of your browser profile and device. On shared machines, use the clear-all control before handing the device to someone else.",
    },
    {
      heading: "6. Changes to this policy",
      body: "If we change this policy, we will update the effective date above. Material changes will be highlighted in the interface before they take effect.",
    },
    {
      heading: "7. Contact",
      body: "Privacy questions can be sent to privacy@polyaura.example. This address is a placeholder for the demonstration build.",
    },
  ],
};
