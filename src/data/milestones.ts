import { Milestone } from "../types";

// Default milestone templates for user to pick from.
// `key` is the i18n key (see src/i18n/locales/*.json → milestones.*).
// `name` is kept as the English fallback so legacy stored milestones
// (created before i18n keys existed) still render their template icon.
export type MilestoneTemplate = Omit<Milestone, "id" | "date"> & {
  key: string;
};

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { key: "graduation", name: "Graduation", emoji: "", icon: "graduation-cap" },
  { key: "firstJob", name: "First Job", emoji: "", icon: "briefcase" },
  { key: "marriage", name: "Marriage", emoji: "", icon: "heart" },
  { key: "firstChild", name: "First Child", emoji: "", icon: "baby" },
  { key: "buyHouse", name: "Buy a House", emoji: "", icon: "home" },
  { key: "travelAbroad", name: "Travel Abroad", emoji: "", icon: "plane" },
  { key: "startBusiness", name: "Start Business", emoji: "", icon: "rocket" },
  { key: "retirement", name: "Retirement", emoji: "", icon: "sunset" },
  { key: "learnToDrive", name: "Learn to Drive", emoji: "", icon: "car" },
  { key: "firstPet", name: "First Pet", emoji: "", icon: "dog" },
  { key: "publishedWork", name: "Published Work", emoji: "", icon: "book-open" },
  { key: "marathon", name: "Marathon", emoji: "", icon: "trophy" },
];
