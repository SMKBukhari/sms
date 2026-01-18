"use client";

import React from "react";
import { useProgressSteps } from "./ProgressStepsContext";

export function CurrentStepContent({
  fallback = null,
}: {
  fallback?: React.ReactNode;
}) {
  const { currentStep } = useProgressSteps();
  if (!currentStep?.content) return <>{fallback}</>;
  return <>{currentStep.content}</>;
}
