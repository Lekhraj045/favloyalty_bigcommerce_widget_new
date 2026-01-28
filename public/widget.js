/**
 * FavLoyalty Widget Runtime
 * This file is loaded by widget-loader.js
 */

(function () {
  "use strict";

  // Check if React and ReactDOM are available
  if (
    typeof window.React === "undefined" ||
    typeof window.ReactDOM === "undefined"
  ) {
    console.error("FavLoyalty Widget: React and ReactDOM must be loaded first");
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;

  // Widget component (will be loaded from your Next.js app)
  function initWidget(container, config) {
    if (!container) {
      console.error("FavLoyalty Widget: Container not found");
      return;
    }

    // Fetch widget component from your Next.js app
    fetch(`${config.widgetUrl}/api/widget-component`)
      .then((response) => response.text())
      .then((componentCode) => {
        // This is a simplified version - in production, you'd bundle the component
        // For now, we'll use an iframe or load the widget page directly
        loadWidgetViaIframe(container, config);
      })
      .catch(() => {
        // Fallback: load widget via iframe
        loadWidgetViaIframe(container, config);
      });
  }

  function loadWidgetViaIframe(container, config) {
    const iframe = document.createElement("iframe");
    iframe.src = `${config.widgetUrl}/widget?config=${encodeURIComponent(JSON.stringify(config))}`;
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.overflow = "hidden";
    iframe.setAttribute("scrolling", "no");
    container.appendChild(iframe);
  }

  // Export global API
  window.FavLoyaltyWidget = {
    init: initWidget,
  };
})();
