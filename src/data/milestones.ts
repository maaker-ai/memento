import { Milestone } from "../types";

// Default milestone templates for user to pick from
export const MILESTONE_TEMPLATES: Omit<Milestone, "id" | "date">[] = [
  { name: "Graduation", emoji: "", icon: "graduation-cap" },
  { name: "First Job", emoji: "", icon: "briefcase" },
  { name: "Marriage", emoji: "", icon: "heart" },
  { name: "First Child", emoji: "", icon: "baby" },
  { name: "Buy a House", emoji: "", icon: "home" },
  { name: "Travel Abroad", emoji: "", icon: "plane" },
  { name: "Start Business", emoji: "", icon: "rocket" },
  { name: "Retirement", emoji: "", icon: "sunset" },
  { name: "Learn to Drive", emoji: "", icon: "car" },
  { name: "First Pet", emoji: "", icon: "dog" },
  { name: "Published Work", emoji: "", icon: "book-open" },
  { name: "Marathon", emoji: "", icon: "trophy" },
];
