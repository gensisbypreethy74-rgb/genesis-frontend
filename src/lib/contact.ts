/**
 * The studio's contact details, in one place.
 *
 * The WhatsApp number was previously declared privately in three files — the
 * footer, the product detail page and the order tracker — with a comment telling
 * the next reader to "change both together". They had already drifted: the footer
 * pointed at one line and the other two at a different one, so a shopper got a
 * different number depending on which page they asked from. One export, no drift.
 */

/** Digits only, country code first — the form wa.me expects. */
export const WHATSAPP_NUMBER = "917736605422";

/** Human-readable, for anywhere the number is shown rather than linked. */
export const WHATSAPP_DISPLAY = "+91 77366 05422";

/** Canonical chat link. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Statutory company identity, from the Website Specification (Vol. One,
 * Module 4 §1 / §11 / §12). The Consumer Protection (E-Commerce) Rules, 2020
 * require the legal name, registered address and a working grievance contact to
 * be displayed, which is why these live in the footer rather than only in the
 * Terms page.
 *
 * DELIBERATELY ABSENT — the specification marks each of these [TO BE CONFIRMED],
 * so there is no value to publish. They are NOT invented here: a fabricated
 * GSTIN or grievance officer is a false regulatory statement, and a grievance
 * address that routes nowhere is worse than none at all, because a customer's
 * complaint disappears silently. Supply the real values and add them below:
 *
 *   GSTIN            — Module 4 §1
 *   GRIEVANCE_OFFICER— Module 4 §11 (name; designation is "Director")
 *   GRIEVANCE_EMAIL  — Module 4 §11 (spec suggests grievance@genesisbypreethy.com)
 *   PRIVACY_EMAIL    — Module 5 §7 (spec suggests privacy@genesisbypreethy.com)
 */
export const COMPANY = {
  legalName: "Genesis by Preethy Private Limited",
  cin: "U47710KL2024PTC090362",
  registeredOffice:
    "Vallikkad House, Ayswarya, Azad Road, Kaloor, Ernakulam, Kerala 682017, India",
  /** Module 4 §12 — exclusive jurisdiction. */
  jurisdiction: "Ernakulam, Kerala",
} as const;

/** Customer care address, already used across the policy pages. */
export const CARE_EMAIL = "care@genesisbypreethy.com";
