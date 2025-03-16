"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const registerSW = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // Register the service worker for offline support
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered successfully:", registration);
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    // Register service worker when the window loads
    window.addEventListener("load", registerSW);

    // Clean up
    return () => {
      window.removeEventListener("load", registerSW);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
