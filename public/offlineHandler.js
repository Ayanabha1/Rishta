// public/offlineHandler.js
// This script handles offline detection and UI display
// Include this in all your HTML pages

(function () {
  // Create the offline UI if it doesn't exist already
  if (!document.getElementById("offline-container")) {
    // Create offline container
    const offlineContainer = document.createElement("div");
    offlineContainer.id = "offline-container";
    offlineContainer.style.display = "none";
    offlineContainer.style.position = "fixed";
    offlineContainer.style.top = "0";
    offlineContainer.style.left = "0";
    offlineContainer.style.right = "0";
    offlineContainer.style.bottom = "0";
    offlineContainer.style.background =
      "linear-gradient(to bottom right, #e6d3ff, #c4b0ff)";
    offlineContainer.style.zIndex = "9999";
    offlineContainer.style.display = "none";
    offlineContainer.style.flexDirection = "column";
    offlineContainer.style.alignItems = "center";
    offlineContainer.style.padding = "20px";
    offlineContainer.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';

    // Create header
    const header = document.createElement("div");
    header.className = "header";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "flex-start";
    header.style.width = "100%";
    header.style.maxWidth = "600px";
    header.style.marginBottom = "10px";
    header.style.padding = "10px 20px";

    // Create back button
    const backButton = document.createElement("a");
    backButton.className = "back-button";
    backButton.href = "/";
    backButton.style.background = "rgba(255, 255, 255, 0.5)";
    backButton.style.border = "none";
    backButton.style.borderRadius = "50px";
    backButton.style.padding = "10px 20px";
    backButton.style.display = "flex";
    backButton.style.alignItems = "center";
    backButton.style.gap = "10px";
    backButton.style.fontSize = "16px";
    backButton.style.fontWeight = "bold";
    backButton.style.color = "#333";
    backButton.style.cursor = "pointer";
    backButton.style.textDecoration = "none";

    const arrowSpan = document.createElement("span");
    arrowSpan.style.fontSize = "20px";
    arrowSpan.textContent = "←";
    backButton.appendChild(arrowSpan);
    backButton.appendChild(document.createTextNode(" Home"));

    header.appendChild(backButton);
    offlineContainer.appendChild(header);

    // Create logo container
    const logoContainer = document.createElement("div");
    logoContainer.className = "logo-container";
    logoContainer.style.display = "flex";
    logoContainer.style.flexDirection = "column";
    logoContainer.style.alignItems = "center";
    logoContainer.style.justifyContent = "center";
    logoContainer.style.marginTop = "60px";
    logoContainer.style.marginBottom = "40px";

    // Create WiFi icon SVG
    const wifiSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    wifiSvg.setAttribute("class", "wifi-icon");
    wifiSvg.setAttribute("viewBox", "0 0 24 24");
    wifiSvg.setAttribute("width", "120");
    wifiSvg.setAttribute("height", "120");
    wifiSvg.setAttribute("fill", "none");
    wifiSvg.setAttribute("stroke", "#8844ee");
    wifiSvg.setAttribute("stroke-width", "2");
    wifiSvg.setAttribute("stroke-linecap", "round");
    wifiSvg.setAttribute("stroke-linejoin", "round");
    wifiSvg.style.marginBottom = "30px";

    // Create SVG paths for WiFi icon
    const paths = [
      { type: "line", x1: "1", y1: "1", x2: "23", y2: "23" },
      { type: "path", d: "M16.72 11.06A10.94 10.94 0 0 1 19 12.55" },
      { type: "path", d: "M5 12.55a10.94 10.94 0 0 1 5.17-2.39" },
      { type: "path", d: "M10.71 5.05A16 16 0 0 1 22.58 9" },
      { type: "path", d: "M1.42 9a15.91 15.91 0 0 1 4.7-2.88" },
      { type: "path", d: "M8.53 16.11a6 6 0 0 1 6.95 0" },
      { type: "line", x1: "12", y1: "20", x2: "12.01", y2: "20" },
    ];

    paths.forEach((pathData) => {
      let element;
      if (pathData.type === "line") {
        element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        element.setAttribute("x1", pathData.x1);
        element.setAttribute("y1", pathData.y1);
        element.setAttribute("x2", pathData.x2);
        element.setAttribute("y2", pathData.y2);
      } else {
        element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        element.setAttribute("d", pathData.d);
      }
      wifiSvg.appendChild(element);
    });

    logoContainer.appendChild(wifiSvg);

    // Create brand name
    const brandName = document.createElement("div");
    brandName.className = "brand-name";
    brandName.textContent = "RISHTA";
    brandName.style.fontSize = "28px";
    brandName.style.fontWeight = "bold";
    brandName.style.color = "#8844ee";

    logoContainer.appendChild(brandName);
    offlineContainer.appendChild(logoContainer);

    // Create content card
    const contentCard = document.createElement("div");
    contentCard.className = "content-card";
    contentCard.style.background = "rgba(255, 255, 255, 0.6)";
    contentCard.style.borderRadius = "20px";
    contentCard.style.padding = "30px";
    contentCard.style.width = "100%";
    contentCard.style.maxWidth = "600px";
    contentCard.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";

    // Create heading
    const heading = document.createElement("h1");
    heading.textContent = "No Connection";
    heading.style.fontSize = "32px";
    heading.style.fontWeight = "bold";
    heading.style.marginBottom = "15px";
    heading.style.color = "#333";

    // Create paragraph
    const paragraph = document.createElement("p");
    paragraph.textContent = "Please check your internet connection to continue";
    paragraph.style.fontSize = "18px";
    paragraph.style.color = "#555";
    paragraph.style.marginBottom = "30px";

    // Create retry button
    const retryButton = document.createElement("button");
    retryButton.id = "retryButton";
    retryButton.className = "retry-button";
    retryButton.textContent = "Try Again";
    retryButton.style.width = "100%";
    retryButton.style.padding = "15px";
    retryButton.style.background = "#8844ee";
    retryButton.style.color = "white";
    retryButton.style.border = "none";
    retryButton.style.borderRadius = "10px";
    retryButton.style.fontSize = "18px";
    retryButton.style.fontWeight = "bold";
    retryButton.style.cursor = "pointer";

    // Add click event to retry button
    retryButton.addEventListener("click", function () {
      this.disabled = true;
      this.textContent = "Trying to reconnect...";
      window.location.reload();
    });

    contentCard.appendChild(heading);
    contentCard.appendChild(paragraph);
    contentCard.appendChild(retryButton);
    offlineContainer.appendChild(contentCard);

    // Append to document body
    document.body.appendChild(offlineContainer);
  }

  // Function to check connection and toggle offline UI visibility
  function checkConnection() {
    const offlineContainer = document.getElementById("offline-container");
    if (!offlineContainer) return;

    const isOffline = !navigator.onLine;
    if (isOffline) {
      offlineContainer.style.display = "flex";
    } else {
      offlineContainer.style.display = "none";
    }

    // If we're in a WebView, send connection status to native app
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "connectionStatus",
          online: navigator.onLine,
        })
      );
    }
  }

  // Set up event listeners
  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", checkConnection);
  window.addEventListener("load", checkConnection);

  // Check connection periodically
  setInterval(checkConnection, 3000);

  // Initial check
  checkConnection();
})();
