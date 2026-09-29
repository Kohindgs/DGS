import fs from "fs";

const defsPath = "data/forms/definitions.approved.json";
const defs = JSON.parse(fs.readFileSync(defsPath, "utf8"));

// 1. Update Form 6 sourceRoutes
const f6 = defs.forms.find((f) => f.fluentFormId === 6);
if (f6) {
  if (!f6.sourceRoutes) f6.sourceRoutes = [f6.sourceRoute];
  if (!f6.sourceRoutes.includes("/better-ceasons-case-study/")) {
    f6.sourceRoutes.push("/better-ceasons-case-study/");
  }
}

// 2. Update Form 9 sourceRoutes
const f9 = defs.forms.find((f) => f.fluentFormId === 9);
if (f9) {
  if (!f9.sourceRoutes) f9.sourceRoutes = [f9.sourceRoute];
  if (!f9.sourceRoutes.includes("/services/shirdi-se-sai-tak-case-study/")) {
    f9.sourceRoutes.push("/services/shirdi-se-sai-tak-case-study/");
  }
}

// Helper to clone base
const f1 = defs.forms.find((f) => f.fluentFormId === 1);
const f26 = defs.forms.find((f) => f.fluentFormId === 26);

// 3. Form 27 (Australia Page Form)
if (!defs.forms.some((f) => f.fluentFormId === 27)) {
  const f27 = JSON.parse(JSON.stringify(f1));
  f27.key = "fluentform-27";
  f27.title = "Australia Page Form";
  f27.fluentFormId = 27;
  f27.sourceRoute = "/australia-page/";
  f27.sourceRoutes = ["/australia-page/"];
  f27.activationEnabled = true;
  f27.approvalState = "APPROVED_FOR_IMPLEMENTATION";
  defs.forms.push(f27);
}

// Helper for Google Ads / Service variants cloning Form 26
function createForm26Clone(id, key, title, route) {
  if (defs.forms.some((f) => f.fluentFormId === id)) return;
  const clone = JSON.parse(JSON.stringify(f26));
  clone.key = key;
  clone.title = title;
  clone.fluentFormId = id;
  clone.sourceRoute = route;
  clone.sourceRoutes = [route];
  clone.activationEnabled = true;
  clone.approvalState = "APPROVED_FOR_IMPLEMENTATION";
  defs.forms.push(clone);
}

// 4. Form 28 (Website Development Pune)
createForm26Clone(28, "fluentform-28", "Website Development Pune Page Form", "/services/website-development-pune-page/");

// 5. Form 22 (SEO Mumbai Google Ads Landing Page)
createForm26Clone(22, "fluentform-22", "SEO Mumbai Google Ads Landing Page Form", "/seo-services-mumbai-google-ads-landing-page/");

// 6. Form 23 (AEO Mumbai Google Ads Landing Page)
createForm26Clone(23, "fluentform-23", "AEO Mumbai Google Ads Landing Page Form", "/aeo-services-mumbai-google-ads-landing-page/");

// 7. Form 24 (AI Production Google Ads Landing Page)
createForm26Clone(24, "fluentform-24", "AI Production Google Ads Landing Page Form", "/ai-production-videos-google-ads-landing-page/");

// 8. Form 50 (US Landing Page Form)
if (!defs.forms.some((f) => f.fluentFormId === 50)) {
  const f50 = {
    key: "fluentform-50",
    title: "US Landing Page Growth Form",
    fluentFormId: 50,
    sourceRoute: "/us-landing-page/",
    sourceRoutes: ["/us-landing-page/"],
    approvalState: "APPROVED_FOR_IMPLEMENTATION",
    activationEnabled: true,
    fields: [
      {
        name: "name",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Your name",
        defaultValue: "",
        options: [],
        validationMessages: { required: "This field is required" },
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "company",
        label: "Company",
        type: "text",
        required: false,
        placeholder: "Company name",
        defaultValue: "",
        options: [],
        validationMessages: {},
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "work@email.com",
        defaultValue: "",
        options: [],
        validationMessages: {
          required: "This field is required",
          email: "This field must contain a valid email"
        },
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "phone",
        label: "Phone",
        type: "tel",
        required: true,
        placeholder: "+1 555 000 0000",
        defaultValue: "",
        options: [],
        validationMessages: { required: "This field is required" },
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "website",
        label: "Website",
        type: "url",
        required: false,
        placeholder: "https://yourwebsite.com",
        defaultValue: "",
        options: [],
        validationMessages: {},
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "service",
        label: "Primary Requirement",
        type: "select",
        required: false,
        placeholder: "Select one",
        defaultValue: "",
        options: [
          { label: "SEO services in the US", value: "SEO services in the US" },
          { label: "Local SEO for multiple US cities", value: "Local SEO for multiple US cities" },
          { label: "AEO, GEO and LLM SEO for AI search", value: "AEO, GEO and LLM SEO for AI search" },
          { label: "Website development and landing pages", value: "Website development and landing pages" },
          { label: "Google Ads or Meta Ads campaign flow", value: "Google Ads or Meta Ads campaign flow" },
          { label: "Content creation, branding and social media", value: "Content creation, branding and social media" },
          { label: "Full digital growth system", value: "Full digital growth system" }
        ],
        validationMessages: {},
        conditionalLogic: { enabled: false },
        hidden: false
      },
      {
        name: "message",
        label: "Tell us more",
        type: "textarea",
        required: false,
        placeholder: "Target cities, services, competitors...",
        defaultValue: "",
        options: [],
        validationMessages: {},
        conditionalLogic: { enabled: false },
        hidden: false
      }
    ],
    allowedFieldKeys: ["name", "company", "email", "phone", "website", "service", "message"],
    captcha: {
      enabled: false,
      provider: "none"
    },
    submitButtonText: "Send Growth Enquiry",
    confirmation: {
      type: "message",
      message: "Thank you for your enquiry. Our US growth consulting team will reach out shortly."
    },
    backend: {
      adapter: "fluent-forms-wordpress",
      submissionEndpointClass: "public-admin-ajax",
      submissionEndpoint: "https://www.dgeniussolutions.com/wp-admin/admin-ajax.php",
      submissionAction: "fluentform_submit",
      restFormSubmitEndpoint: "https://www.dgeniussolutions.com/wp-json/fluentform/v1/form-submit",
      wordpressPageIds: {
        "/us-landing-page/": 63974
      }
    }
  };
  defs.forms.push(f50);
}

fs.writeFileSync(defsPath, JSON.stringify(defs, null, 2), "utf8");
console.log("Successfully updated definitions.approved.json. Total forms:", defs.forms.length);
