"use client";

import { ReactNode } from "react";
import NetworkDetector from "@/components/NetworkDetector";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <NetworkDetector>{children}</NetworkDetector>;
}
