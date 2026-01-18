import type { ReactNode } from "react";

export type ProgressStep = {
  id: string; // stable key
  title: string; // label
  subtitle?: string; // optional
  content?: ReactNode; // optional step content
  isOptional?: boolean;
  isDisabled?: boolean; // force disabled
};
