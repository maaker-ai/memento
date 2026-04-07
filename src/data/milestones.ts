import { Milestone } from "../types";

// Default milestone templates for user to pick from
export const MILESTONE_TEMPLATES: Omit<Milestone, "id" | "date">[] = [
  { name: "Graduation", emoji: "🎓" },
  { name: "First Job", emoji: "💼" },
  { name: "Marriage", emoji: "💍" },
  { name: "First Child", emoji: "👶" },
  { name: "Buy a House", emoji: "🏠" },
  { name: "Travel Abroad", emoji: "✈️" },
  { name: "Start Business", emoji: "🚀" },
  { name: "Retirement", emoji: "🌅" },
  { name: "Learn to Drive", emoji: "🚗" },
  { name: "First Pet", emoji: "🐕" },
  { name: "Published Work", emoji: "📖" },
  { name: "Marathon", emoji: "🏃" },
];
