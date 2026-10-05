/**
 * DGS V8.12.7A — Actionability Engine & Evidence Evaluator
 *
 * Implements the mandatory Actionability Test before qualification:
 *  - WHAT exactly can DGS do?
 *  - WHO accepts the action?
 *  - WHERE does DGS perform it?
 *  - WHAT outcome could reasonably result?
 *
 * Ensures that every qualified opportunity has clear, explainable, and verifiable
 * instructions for the execution team and manager.
 */

import type { PageIntent } from "./page-intent";

export type ActionRequired =
  | "SUBMIT_LISTING"
  | "CREATE_PROFILE"
  | "PITCH_ARTICLE"
  | "SEND_OUTREACH"
  | "CONTACT_JOURNALIST"
  | "REQUEST_BACKLINK"
  | "RECLAIM_LINK"
  | "APPLY"
  | "NOMINATE"
  | "VERIFY"
  | "MONITOR"
  | "NO_ACTION";

export interface ActionableEvidence {
  evidence_type: string;
  evidence_text: string;
  evidence_url: string;
  evidence_context: string;
  action_required: ActionRequired;
  action_destination: string;
  validation_timestamp: string;
}

export interface ActionabilityResult {
  actionable: boolean;
  actionRequired: ActionRequired;
  actionRecipient: string;
  actionDestination: string;
  expectedOutcome: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  actionabilityScore: number; // 0 - 100
  evidence: ActionableEvidence;
  reasons: string[];
}

export function evaluateActionability(params: {
  url: string;
  title: string;
  laneId: string;
  pageIntent: PageIntent;
  hasForm: boolean;
  formCount: number;
  text: string;
  signals: string[];
  relevanceScore: number;
}): ActionabilityResult {
  const { url, title, laneId, pageIntent, hasForm, formCount, text, signals, relevanceScore } = params;
  const reasons: string[] = [];

  let actionRequired: ActionRequired = "NO_ACTION";
  let actionRecipient = "Webmaster / Directory Administrator";
  let actionDestination = url;
  let expectedOutcome = "Backlink / Listing for D'Genius Solutions";
  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";

  // Score components
  let explicitCtaScore = 0; // 0 - 25
  let submissionMechanismScore = 0; // 0 - 25
  let eligibilityScore = 0; // 0 - 20
  let relevanceComponent = Math.min(15, Math.round(relevanceScore * 0.15)); // 0 - 15
  let intentMatchScore = 0; // 0 - 15

  const urlLower = url.toLowerCase();
  const textLower = text.toLowerCase();

  // Helper keyword presence
  const hasInText = (terms: string[]) => terms.some((t) => textLower.includes(t));

  switch (laneId) {
    case "AGENCY_DIRECTORIES": {
      actionRequired = "SUBMIT_LISTING";
      actionRecipient = "Agency Directory Editorial Team";
      expectedOutcome = "Verified agency profile listing DGS services in Dubai / India / Global";

      if (pageIntent === "BUSINESS_DIRECTORY") {
        intentMatchScore = 15;
      }

      if (
        hasInText([
          "add your agency",
          "submit your agency",
          "add company",
          "submit company",
          "create company profile",
          "get listed",
          "claim profile",
          "join the directory",
          "register your business",
          "add your business",
        ])
      ) {
        explicitCtaScore = 25;
      }

      if (hasForm || urlLower.includes("/add") || urlLower.includes("/submit") || urlLower.includes("/join") || urlLower.includes("/get-listed")) {
        submissionMechanismScore = 25;
      } else if (hasInText(["sign up", "registration form", "fill out this form"])) {
        submissionMechanismScore = 15;
      }

      if (hasInText(["free listing", "free profile", "join for free", "list your business", "agencies can submit"])) {
        eligibilityScore = 20;
      } else {
        eligibilityScore = 10;
      }
      break;
    }

    case "BUSINESS_CITATIONS":
    case "LOCAL_LISTINGS": {
      actionRequired = "CREATE_PROFILE";
      actionRecipient = "Business Directory Team";
      expectedOutcome = "NAP Citation & business profile for DGS";

      if (pageIntent === "BUSINESS_DIRECTORY") intentMatchScore = 15;

      if (hasInText(["add your business", "add a business", "add business", "add listing", "free listing", "create profile", "claim your listing", "register your business", "create your free business listing"])) {
        explicitCtaScore = 25;
      }

      if (hasForm || urlLower.includes("/add") || urlLower.includes("/listing") || urlLower.includes("/register")) {
        submissionMechanismScore = 25;
      }

      eligibilityScore = 20;
      break;
    }

    case "ARTICLE_CONTRIBUTIONS":
    case "EXPERT_CONTRIBUTIONS": {
      actionRequired = "PITCH_ARTICLE";
      actionRecipient = "Publication Managing Editor / Contributor Desk";
      expectedOutcome = "Guest article published with contextual editorial link to DGS";

      if (pageIntent === "EDITORIAL_GUIDELINES") intentMatchScore = 15;

      if (hasInText(["write for us", "become a contributor", "contributor guidelines", "submit an article", "pitch us", "guest post guidelines"])) {
        explicitCtaScore = 25;
      }

      if (hasForm || hasInText(["editor@", "submissions@", "pitch@", "submit your draft", "fill out the contributor form"])) {
        submissionMechanismScore = 25;
      } else if (hasInText(["contact us to pitch", "email us your idea"])) {
        submissionMechanismScore = 15;
      }

      if (hasInText(["we accept guest", "accepting guest", "guidelines for guest authors", "contribute an article"])) {
        eligibilityScore = 20;
      }
      break;
    }

    case "DIGITAL_PR": {
      actionRequired = "CONTACT_JOURNALIST";
      actionRecipient = "Journalist / Press Reporter";
      expectedOutcome = "Expert quote citation and brand mention in news publication";

      if (pageIntent === "JOURNALIST_REQUEST" || pageIntent === "EDITORIAL_GUIDELINES") intentMatchScore = 15;
      if (hasInText(["journalist request", "source request", "seeking experts", "media request", "press query"])) explicitCtaScore = 25;
      if (hasInText(["deadline", "submit response", "respond to journalist"])) submissionMechanismScore = 20;
      eligibilityScore = 20;
      break;
    }

    case "PARTNERSHIPS": {
      actionRequired = "SEND_OUTREACH";
      actionRecipient = "Partnerships / Alliance Director";
      expectedOutcome = "Agency partner directory listing and co-marketing agreement";

      if (pageIntent === "PARTNERSHIP_PAGE") intentMatchScore = 15;
      if (hasInText(["partner program", "become a partner", "apply to become a partner", "agency partner"])) explicitCtaScore = 25;
      if (hasForm || urlLower.includes("/partner")) submissionMechanismScore = 25;
      eligibilityScore = 20;
      break;
    }

    case "COMMUNITIES_QA": {
      actionRequired = "CREATE_PROFILE";
      actionRecipient = "Community Platform";
      expectedOutcome = "Profile link & authoritative answer participation";

      if (pageIntent === "COMMUNITY_FORUM") intentMatchScore = 15;
      explicitCtaScore = 20;
      submissionMechanismScore = 20;
      eligibilityScore = 20;
      break;
    }

    case "RESOURCE_PAGES": {
      actionRequired = "SEND_OUTREACH";
      actionRecipient = "Resource Page Curator / Author";
      expectedOutcome = "Inclusion of DGS service or tool in curated resource list";

      if (pageIntent === "RESOURCE_PAGE") intentMatchScore = 15;
      if (hasInText(["suggest a resource", "submit a tool", "recommend a site", "contact the author"])) explicitCtaScore = 25;
      else explicitCtaScore = 10;
      submissionMechanismScore = hasForm ? 20 : 10;
      eligibilityScore = 15;
      break;
    }

    case "BROKEN_LINKS": {
      actionRequired = "RECLAIM_LINK";
      actionRecipient = "Site Owner / Editor";
      expectedOutcome = "Dead link replaced with relevant DGS asset";
      intentMatchScore = 15;
      explicitCtaScore = 20;
      submissionMechanismScore = 15;
      eligibilityScore = 20;
      break;
    }

    case "UNLINKED_MENTIONS": {
      actionRequired = "REQUEST_BACKLINK";
      actionRecipient = "Author / Editor";
      expectedOutcome = "Unlinked mention of D'Genius Solutions converted into live hyperlink";
      intentMatchScore = 15;
      explicitCtaScore = 25;
      submissionMechanismScore = 20;
      eligibilityScore = 20;
      break;
    }

    default: {
      actionRequired = "SEND_OUTREACH";
      intentMatchScore = 10;
      explicitCtaScore = 10;
      submissionMechanismScore = 10;
      eligibilityScore = 10;
      break;
    }
  }

  const totalScore = explicitCtaScore + submissionMechanismScore + eligibilityScore + relevanceComponent + intentMatchScore;

  // Determine Confidence
  if (totalScore >= 75 && explicitCtaScore >= 20 && submissionMechanismScore >= 15 && intentMatchScore >= 10) {
    confidence = "HIGH";
  } else if (totalScore >= 50 && explicitCtaScore >= 10 && intentMatchScore >= 10) {
    confidence = "MEDIUM";
  } else {
    confidence = "LOW";
  }

  const isActionable = confidence === "HIGH" || confidence === "MEDIUM";

  if (!isActionable) {
    reasons.push(`INSUFFICIENT_ACTIONABILITY: Score ${totalScore}/100, confidence ${confidence}`);
  }

  const evidenceText = signals.slice(0, 5).join(", ") || (hasForm ? "Has submission form" : "Guidelines present");

  const evidence: ActionableEvidence = {
    evidence_type: `${laneId}_ACTIONABILITY`,
    evidence_text: evidenceText,
    evidence_url: url,
    evidence_context: `Identified ${pageIntent} with CTA score ${explicitCtaScore}/25, mechanism score ${submissionMechanismScore}/25. Action: ${actionRequired} to ${actionRecipient}.`,
    action_required: actionRequired,
    action_destination: actionDestination,
    validation_timestamp: new Date().toISOString(),
  };

  return {
    actionable: isActionable,
    actionRequired,
    actionRecipient,
    actionDestination,
    expectedOutcome,
    confidence,
    actionabilityScore: totalScore,
    evidence,
    reasons,
  };
}
