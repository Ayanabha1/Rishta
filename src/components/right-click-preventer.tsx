"use client";

import { useEffect } from "react";

const RightClickPreventer = () => {
  useEffect(() => {
    // Prevent right click
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent text selection
    const preventSelection = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent drag start
    const preventDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Add event listeners
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("selectstart", preventSelection);
    document.addEventListener("dragstart", preventDragStart);

    // Add CSS to prevent text selection
    const style = document.createElement("style");
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("selectstart", preventSelection);
      document.removeEventListener("dragstart", preventDragStart);
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default RightClickPreventer;
