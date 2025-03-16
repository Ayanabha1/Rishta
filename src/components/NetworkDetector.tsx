"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

interface NetworkDetectorProps {
  children: ReactNode;
}

export default function NetworkDetector({ children }: NetworkDetectorProps) {
  // Start with assuming we're online (optimistic initial state)
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Set initial state based on browser's navigator.onLine
    setIsOnline(navigator.onLine);
    console.log("Initial online status:", navigator.onLine);

    // Event handlers for online/offline events
    const handleOnline = () => {
      console.log("Browser reports online");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("Browser reports offline");
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);

    // Simple timeout to simulate checking connection
    setTimeout(() => {
      // Check if browser reports online
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  // If browser reports we're online, render children
  if (isOnline) {
    return <>{children}</>;
  }

  // Otherwise show offline UI
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        background: "linear-gradient(to bottom right, #e6d3ff, #c4b0ff)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "60px",
          marginBottom: "40px",
        }}
      >
        <svg
          style={{
            width: "120px",
            height: "120px",
            marginBottom: "30px",
            color: "#8844ee",
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <div
          style={{
            textAlign: "center",
            color: "#8844ee",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            RISHTA
          </h1>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          borderRadius: "20px",
          padding: "30px",
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#333",
          }}
        >
          No Connection
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: "#555",
            marginBottom: "30px",
          }}
        >
          Please check your internet connection to continue
        </p>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          style={{
            width: "100%",
            padding: "15px",
            background: "#8844ee",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: isRetrying ? "not-allowed" : "pointer",
            opacity: isRetrying ? 0.7 : 1,
          }}
        >
          {isRetrying ? "Trying to reconnect..." : "Try Again"}
        </button>
      </div>
    </div>
  );
}
