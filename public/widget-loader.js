/**
 * FavLoyalty BigCommerce Widget Loader
 * Embed this script in your BigCommerce storefront
 */

(function () {
  "use strict";
  console.log("FavLoyalty widget loaded");
  // Configuration
  const DEFAULT_CONFIG = {
    widgetUrl: "https://ddc7aee02935.ngrok-free.app/", // Update with your deployed widget URL
    position: "bottom-right",
    apiUrl: "https://favbigcommerce.share.zrok.io", // Your backend API URL
    storeId: "",
    customerId: "",
    customerEmail: "",
    theme: {
      primaryColor: "#A0522D",
      headerColor: "#A0522D",
    },
  };

  // Get configuration from script tag data attributes or global config
  function getConfig() {
    const scriptTag =
      document.currentScript ||
      document.querySelector("script[data-widget-loader]");

    const config = { ...DEFAULT_CONFIG };

    if (scriptTag) {
      config.widgetUrl =
        scriptTag.getAttribute("data-widget-url") || config.widgetUrl;
      config.position =
        scriptTag.getAttribute("data-position") || config.position;
      config.apiUrl = scriptTag.getAttribute("data-api-url") || config.apiUrl;
      config.storeId =
        scriptTag.getAttribute("data-store-id") || config.storeId;
    }

    // Check for global config object
    if (window.FavLoyaltyWidgetConfig) {
      Object.assign(config, window.FavLoyaltyWidgetConfig);
    }

    // Try to get customer info from BigCommerce global objects
    if (window.BC && window.BC.customer) {
      config.customerId = config.customerId || window.BC.customer.id;
      config.customerEmail = config.customerEmail || window.BC.customer.email;
    }

    // Check for Stencil theme customer data
    if (window.customer && window.customer.id) {
      config.customerId = config.customerId || window.customer.id;
      config.customerEmail = config.customerEmail || window.customer.email;
    }

    return config;
  }

  // Create floating toggle button
  function createToggleButton(config, onClick) {
    // Remove existing button if present
    const existing = document.getElementById("fav-loyalty-widget-toggle");
    if (existing) {
      existing.remove();
    }

    // Add global style to remove outline from button
    if (!document.getElementById("fav-loyalty-widget-button-styles")) {
      const style = document.createElement("style");
      style.id = "fav-loyalty-widget-button-styles";
      style.textContent = `
        #fav-loyalty-widget-toggle:focus,
        #fav-loyalty-widget-toggle:active,
        #fav-loyalty-widget-toggle:focus-visible {
          outline: none !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        #fav-loyalty-widget-toggle::-moz-focus-inner {
          border: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    const button = document.createElement("button");
    button.id = "fav-loyalty-widget-toggle";
    button.setAttribute("aria-label", "Open Loyalty Widget");
    button.style.cssText = `
      position: fixed;
      z-index: 10000;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${config.theme?.primaryColor || "#A0522D"};
      color: white;
      border: none !important;
      outline: none !important;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 24px;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
      -webkit-focus-ring-color: transparent;
      -moz-outline: none;
    `;

    // Remove focus outline completely
    button.addEventListener("focus", function (e) {
      e.preventDefault();
      this.style.outline = "none !important";
      this.style.border = "none !important";
      this.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      this.blur(); // Remove focus immediately
    });

    // Prevent focus outline on mousedown (but don't prevent default to allow click)
    button.addEventListener("mousedown", function (e) {
      this.style.outline = "none";
      this.style.border = "none";
      // Blur immediately to prevent focus
      setTimeout(() => this.blur(), 0);
    });

    // Handle click - blur immediately to prevent focus outline
    button.onclick = function (e) {
      console.log("Button onclick fired");
      e.stopPropagation();
      this.blur();
      // Call the original onClick handler
      if (onClick) {
        console.log("Calling onClick handler");
        onClick(e);
      } else {
        console.error("onClick handler is not defined!");
      }
    };

    // Also prevent focus on touch devices
    button.addEventListener("touchstart", function (e) {
      this.blur();
      // Don't prevent default to allow click to fire
    });

    // Ensure click works on touch devices too
    button.addEventListener("touchend", function (e) {
      e.preventDefault(); // Prevent double-tap zoom
      this.click(); // Trigger click event
    });

    // Set position
    const positionClasses = {
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
    };

    const position =
      positionClasses[config.position] || positionClasses["bottom-right"];
    Object.assign(button.style, position);

    // Add hover effect
    button.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.1)";
      this.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
    });
    button.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });

    // Add icon (money/coin icon)
    button.innerHTML = `
      <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;

    // Append button to body
    document.body.appendChild(button);
    console.log("Toggle button created and appended to body");

    return button;
  }

  // Create widget container (hidden initially)
  function createWidgetContainer(config) {
    // Remove existing container if present
    const existing = document.getElementById("fav-loyalty-widget-container");
    if (existing) {
      existing.remove();
    }

    const container = document.createElement("div");
    container.id = "fav-loyalty-widget-container";
    container.style.cssText = `
      position: fixed;
      z-index: 9999;
      width: 390px;
      max-width: 85vw;
      max-height: 85vh;
      display: none;
      pointer-events: none;
    `;

    // Set position
    const positionClasses = {
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
    };

    const position =
      positionClasses[config.position] || positionClasses["bottom-right"];
    Object.assign(container.style, position);

    document.body.appendChild(container);
    return container;
  }

  // Create backdrop
  function createBackdrop(onClick) {
    const backdrop = document.createElement("div");
    backdrop.id = "fav-loyalty-widget-backdrop";
    // backdrop.style.cssText = `
    //   position: fixed;
    //   top: 0;
    //   left: 0;
    //   right: 0;
    //   bottom: 0;
    //   background-color: rgba(0, 0, 0, 0.3);
    //   z-index: 9997;
    //   display: none;
    // `;
    backdrop.addEventListener("click", onClick);
    document.body.appendChild(backdrop);
    return backdrop;
  }

  // Create iframe for widget
  function createWidgetIframe(config) {
    const iframe = document.createElement("iframe");
    const configParam = encodeURIComponent(JSON.stringify(config));
    iframe.src = `${config.widgetUrl}/embed?config=${configParam}`;
    iframe.style.cssText = `
      border: none;
      width: 100%;
      height: calc(100vh - 120px);
      // min-height: 480px;
      max-height: 586px;
      background: transparent;
      display: block;
      overflow: hidden;
      border-radius: 17px;
    `;
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("frameborder", "0");

    // Handle messages from iframe
    const messageHandler = function (event) {
      // Only process messages with our expected types
      if (!event.data || !event.data.type) {
        return;
      }

      // Verify message is from widget iframe
      if (event.source !== iframe.contentWindow) {
        return;
      }

      if (event.data.type === "fav-loyalty-widget-loaded") {
        iframe.style.pointerEvents = "auto";
      }

      // Keep iframe height fixed at 586px (ignore height updates)
      if (event.data.type === "fav-loyalty-widget-height") {
        // Don't update height - keep it fixed at 590px
        // iframe.style.height = "586px";
        // iframe.style.minHeight = "586px";
        // iframe.style.maxHeight = "586px";
      }

      // Handle close message from widget
      if (event.data.type === "fav-loyalty-widget-close") {
        closeWidget();
      }
    };

    window.addEventListener("message", messageHandler);

    // Store handler for cleanup if needed
    iframe._messageHandler = messageHandler;

    return iframe;
  }

  // Widget state
  let isWidgetOpen = false;
  let widgetContainer = null;
  let widgetBackdrop = null;
  let widgetIframe = null;
  let toggleButton = null;

  // Open widget
  function openWidget(config) {
    console.log("openWidget called");
    if (!widgetContainer) {
      widgetContainer = createWidgetContainer(config);
      widgetBackdrop = createBackdrop(closeWidget);

      if (!widgetIframe) {
        widgetIframe = createWidgetIframe(config);
        widgetContainer.appendChild(widgetIframe);
      }
    }

    // Adjust widget position to avoid overlapping with button
    // Move widget up by button height (60px) + increased margin (40px) = 100px
    const buttonHeight = 60;
    const margin = 40; // Increased gap between widget and icon
    const offset = buttonHeight + margin;

    // Adjust position based on widget position to leave space for button
    if (
      config.position === "bottom-right" ||
      config.position === "bottom-left"
    ) {
      // For bottom positions, move widget up
      widgetContainer.style.bottom = offset + "px";
      widgetContainer.style.top = "auto";
    } else if (
      config.position === "top-right" ||
      config.position === "top-left"
    ) {
      // For top positions, move widget down
      widgetContainer.style.top = offset + "px";
      widgetContainer.style.bottom = "auto";
    }

    widgetContainer.style.display = "block";
    widgetContainer.style.pointerEvents = "auto";
    widgetBackdrop.style.display = "block";
    isWidgetOpen = true;

    // Ensure toggle button stays visible and on top
    if (toggleButton) {
      toggleButton.style.zIndex = "10000";
      toggleButton.style.pointerEvents = "auto";
    }
  }

  // Close widget
  function closeWidget() {
    if (widgetContainer) {
      widgetContainer.style.display = "none";
      widgetContainer.style.pointerEvents = "none";

      // Reset widget position to original
      const config = getConfig();
      const positionClasses = {
        "bottom-right": { bottom: "20px", right: "20px" },
        "bottom-left": { bottom: "20px", left: "20px" },
        "top-right": { top: "20px", right: "20px" },
        "top-left": { top: "20px", left: "20px" },
      };

      const position =
        positionClasses[config.position] || positionClasses["bottom-right"];
      Object.assign(widgetContainer.style, position);
    }
    if (widgetBackdrop) {
      widgetBackdrop.style.display = "none";
    }
    isWidgetOpen = false;

    // Ensure toggle button stays visible
    if (toggleButton) {
      toggleButton.style.zIndex = "10000";
      toggleButton.style.pointerEvents = "auto";
    }
  }

  // Toggle widget
  function toggleWidget(config) {
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget(config);
    }
  }

  // Initialize widget
  function initWidget() {
    const config = getConfig();

    if (!config.widgetUrl) {
      console.error(
        "FavLoyalty Widget: widgetUrl is required. Set it via data-widget-url attribute or FavLoyaltyWidgetConfig.",
      );
      return;
    }

    // Create toggle button and store reference
    toggleButton = createToggleButton(config, function (e) {
      console.log("Widget toggle button clicked");
      toggleWidget(config);
    });

    // Pre-create widget container (but keep it hidden)
    widgetContainer = createWidgetContainer(config);
    widgetBackdrop = createBackdrop(closeWidget);
    widgetIframe = createWidgetIframe(config);
    widgetContainer.appendChild(widgetIframe);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  // Export global API
  window.FavLoyaltyWidgetLoader = {
    init: initWidget,
    getConfig: getConfig,
  };
})();
