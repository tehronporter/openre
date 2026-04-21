export const propertyTypes = [
  "single_family",
  "condo",
  "townhouse",
  "multi_family",
  "land",
] as const;

export const propertyTypeLabels: Record<(typeof propertyTypes)[number], string> = {
  single_family: "Single family",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-family",
  land: "Land",
};

export const propertyConditions = [
  "move_in_ready",
  "minor_updates",
  "needs_work",
  "investment",
] as const;

export const propertyConditionLabels: Record<
  (typeof propertyConditions)[number],
  string
> = {
  move_in_ready: "Move-in ready",
  minor_updates: "Minor updates",
  needs_work: "Needs work",
  investment: "Investment opportunity",
};

export const financingTypes = [
  "cash",
  "conventional",
  "fha_va",
  "other",
] as const;

export const financingTypeLabels: Record<(typeof financingTypes)[number], string> = {
  cash: "Cash",
  conventional: "Conventional",
  fha_va: "FHA/VA",
  other: "Other",
};

export const offerStatuses = ["pending", "accepted", "rejected", "withdrawn"] as const;

export const offerStatusLabels: Record<(typeof offerStatuses)[number], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Declined",
  withdrawn: "Withdrawn",
};

export const listingStatusLabels: Record<
  "draft" | "published" | "under_contract" | "archived",
  string
> = {
  draft: "Draft",
  published: "Active",
  under_contract: "Under contract",
  archived: "Archived",
};

export const MAX_LISTING_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
