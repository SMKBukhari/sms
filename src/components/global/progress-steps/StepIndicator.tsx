"use client";

import React from "react";
import { useProgressSteps } from "./ProgressStepsContext";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function StepIndicator({ className }: Props) {
  const { currentIndex, steps } = useProgressSteps();

  return (
    <div
      className={cn(
        "md:text-base text-xs font-medium text-muted-foreground",
        className
      )}
    >
      Step {currentIndex + 1}/{steps.length}
    </div>
  );
}
