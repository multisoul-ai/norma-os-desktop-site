export const cloudActivities = [
  "calm",
  "voice",
  "collaboration",
  "focus",
  "done",
  "rain",
  "storm",
] as const;
export type CloudActivity = (typeof cloudActivities)[number];
