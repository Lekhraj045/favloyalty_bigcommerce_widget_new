/**
 * FavLoyalty BigCommerce Widget Loader
 * Embed this script in your BigCommerce storefront
 */

(function () {
  "use strict";
  console.log("FavLoyalty widget loaded");
  // Configuration
  const DEFAULT_CONFIG = {
    widgetUrl: "https://4ac7-122-160-14-227.ngrok-free.app", // Update with your deployed widget URL
    position: "bottom-right",
    apiUrl: "https://favbigcommerce.share.zrok.io", // Your backend API URL
    storeId: "",
    storeHash: "",
    appClientId: "",
    channelId: "",
    customerId: "",
    customerEmail: "",
    theme: {
      primaryColor: "#A0522D",
      headerColor: "#A0522D",
    },
  };

  // Prefer a script tag whose src contains store/channel params (from Script Manager); avoids wrong config when multiple widget-loader scripts exist
  function findScriptWithParams(scripts) {
    if (!scripts || !scripts.length) return null;
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = (scripts[i].src || "").toLowerCase();
      if (
        src.indexOf("store_hash=") !== -1 ||
        src.indexOf("channel_id=") !== -1 ||
        src.indexOf("app_client_id=") !== -1
      ) {
        return scripts[i];
      }
    }
    return null;
  }

  // Get configuration from script tag data attributes or global config
  function getConfig() {
    var scripts = document.querySelectorAll('script[src*="widget-loader.js"]');
    // Prefer the script that has store/channel params in URL so config is consistent across all pages
    let scriptTag = findScriptWithParams(scripts);
    if (!scriptTag) {
      scriptTag =
        document.currentScript ||
        document.querySelector("script[data-widget-loader]");
    }
    if (!scriptTag && scripts.length) {
      scriptTag = scripts[scripts.length - 1];
    }
    // If we have currentScript but it has no params, prefer a script with params (e.g. theme loads one copy, Script Manager injects another)
    if (scriptTag && scripts.length > 1) {
      var hasParams =
        scriptTag.src &&
        (scriptTag.src.indexOf("store_hash=") !== -1 ||
          scriptTag.src.indexOf("channel_id=") !== -1);
      if (!hasParams) {
        var withParams = findScriptWithParams(scripts);
        if (withParams) scriptTag = withParams;
      }
    }

    const config = { ...DEFAULT_CONFIG };

    if (scriptTag) {
      config.widgetUrl =
        scriptTag.getAttribute("data-widget-url") || config.widgetUrl;
      config.position =
        scriptTag.getAttribute("data-position") || config.position;
      config.apiUrl = scriptTag.getAttribute("data-api-url") || config.apiUrl;
      config.storeId =
        scriptTag.getAttribute("data-store-id") || config.storeId;
      config.storeHash =
        scriptTag.getAttribute("data-store-hash") || config.storeHash;
      config.appClientId =
        scriptTag.getAttribute("data-app-client-id") || config.appClientId;
      config.channelId =
        scriptTag.getAttribute("data-channel-id") || config.channelId;
      // Also read from script src query (e.g. when injected by backend: widget-loader.js?store_hash=xxx&app_client_id=yyy&channel_id=zzz)
      if (scriptTag.src) {
        try {
          var u = new URL(scriptTag.src);
          var p = u.searchParams;
          function getParam(name) {
            var v = p.get(name);
            return v !== null && v !== undefined && String(v).trim() !== ""
              ? v
              : null;
          }
          config.storeHash = config.storeHash || getParam("store_hash");
          config.appClientId = config.appClientId || getParam("app_client_id");
          config.channelId = config.channelId || getParam("channel_id");
          config.apiUrl = config.apiUrl || getParam("api_url");
          config.position = config.position || getParam("position");
        } catch (e) {}
      }
    }

    // Check for global config object
    if (window.FavLoyaltyWidgetConfig) {
      Object.assign(config, window.FavLoyaltyWidgetConfig);
    }

    // Fallback: reuse store config from session (saved on a page where script had params) so widget works on all pages
    try {
      var key = "favLoyaltyStoreConfig_" + (document.location.origin || "");
      if (!config.storeHash || !config.channelId) {
        var stored = sessionStorage.getItem(key);
        if (stored) {
          var parsed = JSON.parse(stored);
          if (parsed.storeHash)
            config.storeHash = config.storeHash || parsed.storeHash;
          if (parsed.channelId)
            config.channelId = config.channelId || parsed.channelId;
          if (parsed.appClientId)
            config.appClientId = config.appClientId || parsed.appClientId;
          if (parsed.apiUrl) config.apiUrl = config.apiUrl || parsed.apiUrl;
        }
      }
      if (config.storeHash || config.channelId) {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            storeHash: config.storeHash || "",
            channelId: config.channelId || "",
            appClientId: config.appClientId || "",
            apiUrl: config.apiUrl || "",
          })
        );
      }
    } catch (e) {}

    // Store origin (for login/create account links in widget) — loader runs on storefront so this is the store's URL
    if (typeof document !== "undefined" && document.location) {
      config.storeOrigin = document.location.origin;
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

    console.log("[FavLoyalty] getConfig: resolved", {
      storeHash: config.storeHash || "(missing)",
      appClientId: config.appClientId ? "(set)" : "(missing)",
      apiUrl: config.apiUrl || "(missing)",
      channelId: config.channelId || "(missing)",
      customerId: config.customerId ?? "(missing)",
      widgetUrl: config.widgetUrl ? "(set)" : "(missing)",
    });
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
      background-color: ${
        config.theme?.primaryColor || config.theme?.headerColor || "#A0522D"
      };
      color: white;
      border: none !important;
      outline: none !important;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease;
      font-size: 24px;
      opacity: 0;
      pointer-events: none;
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

    // Fallback icon: first icon from Customise Widget page (gift box), same as widget-icon1.svg (uses currentColor)
    var defaultFallbackSvg =
      '<svg width="28" height="28" viewBox="0 0 26 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#fav-fallback-clip)"><path d="M25.5988 5.24611H23.4818C23.5437 5.15958 23.5992 5.06868 23.6479 4.97412C23.7865 4.70265 23.8673 4.40539 23.8852 4.10112C23.9031 3.79684 23.8577 3.49216 23.7519 3.20632L23.1103 1.48214C23.004 1.19671 22.8395 0.936456 22.6274 0.71783C22.4153 0.499204 22.1601 0.326962 21.8781 0.211993C21.5955 0.0975015 21.2922 0.0428996 20.9874 0.0516406C20.6827 0.0603816 20.383 0.132275 20.1075 0.262774L15.0305 2.67388C14.7713 2.48814 14.4603 2.38838 14.1415 2.38864H11.8586C11.5397 2.38845 11.2287 2.48828 10.9694 2.67408L5.89263 0.262571C5.61704 0.132155 5.3174 0.0603249 5.01263 0.0516191C4.70787 0.0429134 4.40461 0.0975216 4.12203 0.211993C3.55292 0.443251 3.10361 0.906276 2.88977 1.48193L2.24825 3.20647C2.1424 3.4923 2.09701 3.79698 2.11493 4.10125C2.13286 4.40552 2.21372 4.70276 2.3524 4.97418C2.401 5.06878 2.4565 5.15967 2.51846 5.24611H0.401275C0.348581 5.2461 0.296402 5.25648 0.247718 5.27664C0.199033 5.2968 0.154796 5.32635 0.117534 5.36361C0.0802713 5.40087 0.0507128 5.4451 0.0305462 5.49378C0.0103797 5.54246 -4.22051e-10 5.59464 0 5.64733L0 8.53614C2.69238e-05 8.64255 0.0423126 8.74461 0.11756 8.81985C0.192808 8.8951 0.294859 8.93739 0.401275 8.93741C0.5077 8.9374 0.609764 8.89512 0.685022 8.81987C0.760281 8.74462 0.802574 8.64256 0.802601 8.53614V6.04841H3.58974C3.63443 6.0641 3.67962 6.07857 3.72543 6.09127L7.09427 7.01864C6.34491 8.1677 5.68486 9.37259 5.11994 10.6227H0.802499V10.1411C0.802486 10.0884 0.792096 10.0362 0.771923 9.98757C0.75175 9.9389 0.722188 9.89469 0.684926 9.85744C0.647665 9.8202 0.603432 9.79066 0.554754 9.77051C0.506077 9.75036 0.453907 9.74 0.401224 9.74001C0.348541 9.74001 0.296373 9.75038 0.247698 9.77053C0.199023 9.79069 0.154794 9.82023 0.117537 9.85748C0.0802798 9.89473 0.050724 9.93895 0.0305569 9.98762C0.0103899 10.0363 6.66829e-06 10.0885 0 10.1411L0 11.0241C2.69238e-05 11.1305 0.0423126 11.2325 0.11756 11.3078C0.192808 11.383 0.294859 11.4253 0.401275 11.4253H1.8323V25.6317C1.83229 25.6844 1.84266 25.7365 1.86283 25.7852C1.88299 25.8339 1.91255 25.8782 1.94981 25.9154C1.98708 25.9527 2.03131 25.9822 2.08 26.0024C2.12869 26.0226 2.18087 26.0329 2.23357 26.0329H23.7665C23.8192 26.0329 23.8714 26.0226 23.9201 26.0024C23.9688 25.9822 24.013 25.9527 24.0503 25.9154C24.0876 25.8782 24.1171 25.8339 24.1373 25.7852C24.1574 25.7365 24.1678 25.6844 24.1678 25.6317V23.3017C24.1678 23.1952 24.1255 23.0932 24.0502 23.0179C23.975 22.9427 23.8729 22.9004 23.7665 22.9004C23.7138 22.9004 23.6616 22.9107 23.6129 22.9309C23.5643 22.9511 23.52 22.9806 23.4827 23.0179C23.4455 23.0551 23.4159 23.0994 23.3957 23.1481C23.3756 23.1968 23.3652 23.249 23.3652 23.3017V25.2306H15.4074V11.6721C16.544 13.825 17.3135 16.1659 17.6676 18.5845C17.6815 18.6799 17.7293 18.767 17.8022 18.83C17.8752 18.893 17.9683 18.9276 18.0647 18.9275C18.1268 18.9276 18.1881 18.9131 18.2437 18.8854C18.2993 18.8577 18.3477 18.8175 18.3851 18.7678C18.9619 18.0026 19.4983 17.1833 19.9825 16.3279C20.7934 16.8802 21.5807 17.4959 22.3278 18.1624C22.3893 18.2172 22.4662 18.2518 22.548 18.2614C22.6298 18.271 22.7126 18.2552 22.7851 18.2162C22.8576 18.1771 22.9164 18.1167 22.9534 18.0431C22.9904 17.9695 23.0038 17.8863 22.9919 17.8048C22.6715 15.6194 22.0743 13.4703 21.2277 11.4253H23.3651V21.6965C23.365 21.7492 23.3754 21.8014 23.3956 21.8501C23.4157 21.8988 23.4453 21.943 23.4826 21.9803C23.5198 22.0175 23.5641 22.0471 23.6128 22.0672C23.6614 22.0874 23.7136 22.0978 23.7663 22.0978C23.819 22.0978 23.8712 22.0874 23.9199 22.0673C23.9686 22.0471 24.0128 22.0176 24.0501 21.9803C24.0874 21.943 24.1169 21.8988 24.1371 21.8501C24.1573 21.8014 24.1676 21.7492 24.1676 21.6965V11.4253H25.5988C25.6515 11.4253 25.7037 11.4149 25.7523 11.3948C25.801 11.3746 25.8452 11.345 25.8825 11.3078C25.9197 11.2705 25.9493 11.2263 25.9694 11.1776C25.9895 11.1289 25.9999 11.0768 25.9999 11.0241V5.64733C26 5.59464 25.9896 5.54246 25.9695 5.49376C25.9493 5.44507 25.9198 5.40083 25.8826 5.36356C25.8453 5.32629 25.8011 5.29674 25.7524 5.27659C25.7037 5.25643 25.6515 5.24608 25.5988 5.24611ZM20.4516 0.987578C20.8097 0.817764 21.2088 0.806288 21.5759 0.955433C21.9426 1.10443 22.2202 1.39063 22.3581 1.76184L22.9995 3.48582C23.1375 3.85714 23.1139 4.25587 22.9334 4.60835C22.7531 4.96067 22.4434 5.21254 22.0617 5.31751L15.6742 7.07602V5.14749C17.11 4.26836 20.6893 2.45506 21.5801 3.71251C21.6105 3.75552 21.6491 3.79211 21.6937 3.82019C21.7383 3.84827 21.788 3.8673 21.8399 3.87618C21.8918 3.88505 21.945 3.88362 21.9964 3.87194C22.0478 3.86027 22.0963 3.83858 22.1393 3.80813C22.3202 3.68001 22.3631 3.42945 22.2349 3.24877C21.5474 2.27814 20.0985 2.23096 17.9282 3.10872C17.0342 3.47013 16.2088 3.91127 15.6742 4.21738V3.92122C15.6742 3.70642 15.6296 3.50167 15.5494 3.31581L20.4516 0.987578ZM11.8586 3.19104H14.1415C14.5442 3.19104 14.8716 3.51878 14.8716 3.92127V7.23811C14.8716 7.64081 14.5441 7.96835 14.1415 7.96835H11.8586C11.4559 7.96835 11.1285 7.64081 11.1285 7.23811V3.92127C11.1285 3.51858 11.456 3.19104 11.8586 3.19104ZM11.1843 10.6226C11.5687 9.98403 11.9863 9.36594 12.4353 8.7709H13.5644C14.0135 9.36584 14.4311 9.98394 14.8155 10.6226H11.1843ZM3.06669 4.60835C2.88616 4.25587 2.86255 3.85714 3.00042 3.48597L3.64215 1.76159C3.77976 1.39068 4.05754 1.10443 4.42408 0.955433C4.79108 0.806288 5.19037 0.817815 5.54823 0.987578L10.4506 3.31621C10.3681 3.50731 10.3257 3.71328 10.3258 3.92142V4.24033C9.79305 3.93371 8.94901 3.47947 8.03215 3.10872C5.86201 2.23096 4.41296 2.27814 3.72543 3.24877C3.59731 3.42945 3.64012 3.68001 3.82105 3.80813C3.86404 3.8386 3.91261 3.8603 3.96398 3.87198C4.01536 3.88367 4.06854 3.88511 4.12047 3.87623C4.17241 3.86735 4.22208 3.84832 4.26666 3.82023C4.31124 3.79214 4.34984 3.75553 4.38026 3.71251C5.27944 2.44318 8.91763 4.30264 10.3258 5.17192V7.07602L3.93856 5.31771C3.55668 5.21259 3.24697 4.96067 3.06669 4.60835ZM10.506 7.95789C10.7057 8.33164 11.0556 8.61353 11.4748 8.72205C9.59805 11.3404 8.30607 14.349 7.70009 17.5114C7.27 16.8825 6.87292 16.2316 6.51049 15.5614C6.48414 15.5126 6.44795 15.4698 6.4042 15.4357C6.36045 15.4015 6.31009 15.3769 6.25632 15.3632C6.20254 15.3496 6.14652 15.3472 6.09179 15.3564C6.03706 15.3655 5.98483 15.3859 5.93838 15.4162C5.2701 15.8521 4.61573 16.3301 3.9837 16.8435C4.63457 13.4273 5.97926 10.1332 7.90759 7.24263L10.506 7.95789ZM2.63485 11.4253H4.77244C3.92586 13.4703 3.32857 15.6192 3.00799 17.8048C2.99603 17.8863 3.00945 17.9695 3.04643 18.0431C3.08341 18.1167 3.14215 18.1771 3.21467 18.2162C3.28722 18.2552 3.37003 18.271 3.45186 18.2614C3.5337 18.2518 3.61059 18.2172 3.67211 18.1624C4.41915 17.4959 5.20647 16.8802 6.0176 16.3279C6.5018 17.1833 7.038 18.0024 7.61503 18.7678C7.65241 18.8175 7.70081 18.8577 7.7564 18.8855C7.812 18.9132 7.87328 18.9277 7.93541 18.9277C7.96852 18.9277 8.00184 18.9235 8.03479 18.915C8.11146 18.8954 8.18062 18.8536 8.23357 18.7948C8.28652 18.736 8.32088 18.6629 8.33232 18.5846C8.68662 16.1658 9.45606 13.8248 10.5925 11.6719V25.2306H2.6349L2.63485 11.4253ZM11.3951 25.2306V11.4253H14.6049V25.2306H11.3951ZM20.0616 15.4163C20.0151 15.386 19.9629 15.3657 19.9082 15.3566C19.8535 15.3475 19.7975 15.3499 19.7437 15.3635C19.69 15.3772 19.6397 15.4018 19.5959 15.4359C19.5521 15.47 19.5159 15.5127 19.4895 15.5615C19.1271 16.2317 18.73 16.8825 18.2999 17.5114C17.6939 14.3488 16.402 11.3404 14.525 8.72225C14.9442 8.61394 15.2943 8.33184 15.494 7.95794L18.093 7.24243C20.0209 10.1336 21.3656 13.4276 22.0165 16.8435C21.3843 16.3301 20.7299 15.8521 20.0616 15.4163ZM25.1974 10.6227H20.8803C20.3154 9.37269 19.6554 8.1678 18.9062 7.01869L22.2746 6.09132C22.3204 6.07862 22.3657 6.06415 22.4103 6.04846H25.1975L25.1974 10.6227Z"/></g><defs><clipPath id="fav-fallback-clip"><rect width="26" height="26" fill="white"/></clipPath></defs></svg>';
    button.innerHTML = defaultFallbackSvg;
    button._defaultCoinSvg = defaultFallbackSvg;

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
      box-shadow: 0 0 80px 0 rgba(0, 0, 0, 0.12);
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
        // Send resolved customer to iframe now that it is ready (avoids race on first open where postMessage was sent before listener existed)
        if (pendingCustomerPromise) {
          pendingCustomerPromise
            .then(function (resolved) {
              if (
                !widgetIframe ||
                widgetIframe !== iframe ||
                !iframe.contentWindow ||
                !isWidgetOpen
              )
                return;
              try {
                var cid = resolved.customerId || "";
                var cem = resolved.customerEmail || "";
                lastSentCustomerId = cid;
                iframe.contentWindow.postMessage(
                  {
                    type: "fav-loyalty-customer",
                    customerId: cid,
                    customerEmail: cem,
                  },
                  "*"
                );
                if (resolved.customerId) {
                  console.log(
                    "[FavLoyalty] openWidget: background customerId=",
                    resolved.customerId
                  );
                }
              } catch (e) {}
            })
            .catch(function () {});
          pendingCustomerPromise = null;
        }
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

      // Handle theme from widget: Widget Color = button background, Widget Icon Color = icon color, Select Widget Icon = which icon, placement
      if (event.data.type === "fav-loyalty-widget-theme") {
        applyThemeToButton(toggleButton, event.data, config);
        var pos = event.data.position || event.data.widgetButton;
        if (pos) {
          effectivePosition = normalizePosition(pos);
          applyPosition(toggleButton, widgetContainer, effectivePosition);
        }
      }

      // Subscribe to newsletter via storefront API (so subscription is for this store/storefront)
      if (event.data.type === "fav-loyalty-subscribe-newsletter") {
        var email = event.data.email;
        if (!email || typeof email !== "string" || !email.trim()) {
          try {
            event.source.postMessage(
              {
                type: "fav-loyalty-subscribe-newsletter-result",
                success: false,
                error: "Email is required",
              },
              "*"
            );
          } catch (e) {}
          return;
        }
        fetch("/api/storefront/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: String(email).trim(),
            acceptsMarketingNewsletter: true,
            acceptsAbandonedCartEmails: false,
          }),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              try {
                event.source.postMessage(
                  {
                    type: "fav-loyalty-subscribe-newsletter-result",
                    success: res.ok,
                    error: res.ok
                      ? undefined
                      : (data && (data.message || data.title || data.detail)) ||
                        "Subscription failed",
                  },
                  "*"
                );
              } catch (e) {}
            });
          })
          .catch(function (err) {
            try {
              event.source.postMessage(
                {
                  type: "fav-loyalty-subscribe-newsletter-result",
                  success: false,
                  error:
                    err && err.message ? err.message : "Subscription failed",
                },
                "*"
              );
            } catch (e) {}
          });
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
  // Effective placement from "Placement of widget on your website" (channel-settings); used for button and container
  let effectivePosition = null;
  // Resolved customer promise: send to iframe only after it signals "fav-loyalty-widget-loaded" so message is not lost on first open
  let pendingCustomerPromise = null;
  // Last customer id we sent to iframe (so we can detect sign-out and send empty)
  let lastSentCustomerId = "";
  let signOutCheckInterval = null;

  // Normalize position from API or URL (e.g. "Bottom-Left" or "bottom-left") to loader format
  function normalizePosition(val) {
    if (!val || typeof val !== "string") return "bottom-right";
    var s = String(val).trim().toLowerCase().replace(/\s+/g, "-");
    if (
      ["bottom-left", "bottom-right", "top-left", "top-right"].indexOf(s) !== -1
    )
      return s;
    return "bottom-right";
  }

  // Apply placement (bottom-left, bottom-right, top-left, top-right) to launcher button and widget container
  function applyPosition(btn, container, position) {
    var pos = normalizePosition(position) || "bottom-right";
    var positionStyles = {
      "bottom-right": {
        bottom: "20px",
        right: "20px",
        top: "auto",
        left: "auto",
      },
      "bottom-left": {
        bottom: "20px",
        left: "20px",
        top: "auto",
        right: "auto",
      },
      "top-right": { top: "20px", right: "20px", bottom: "auto", left: "auto" },
      "top-left": { top: "20px", left: "20px", bottom: "auto", right: "auto" },
    };
    var style = positionStyles[pos] || positionStyles["bottom-right"];
    if (btn) {
      Object.assign(btn.style, style);
    }
    if (container) {
      Object.assign(container.style, style);
      // When widget is open, container is offset from button (leave space for launcher)
      if (isWidgetOpen) {
        var offset = 60 + 40; // button height + margin
        if (pos === "bottom-right" || pos === "bottom-left") {
          container.style.bottom = offset + "px";
          container.style.top = "auto";
        } else if (pos === "top-right" || pos === "top-left") {
          container.style.top = offset + "px";
          container.style.bottom = "auto";
        }
      }
    }
  }

  // BigCommerce Current Customer API is not CORS-enabled for storefront origins,
  // so we do not fetch JWT from the loader. We rely on storeHash + channelId + customerId
  // (from storefront globals) and let the backend resolve the customer.
  function fetchCurrentCustomerJwt(config) {
    return Promise.resolve(null);
  }

  // Read logged-in customer from storefront (Stencil/Catalyst/theme globals and DOM). Call at widget open time.
  function getCustomerFromPage() {
    var id = null;
    var email = null;
    var source = "";
    try {
      if (window.BC && window.BC.customer) {
        id = window.BC.customer.id;
        email = window.BC.customer.email;
        if (id != null) source = "BC.customer";
      }
      if ((id === null || id === undefined) && window.customer) {
        id = window.customer.id;
        email = window.customer.email;
        if (id != null) source = "window.customer";
      }
      if (
        (id === null || id === undefined) &&
        window.__st &&
        window.__st.customer
      ) {
        id = window.__st.customer.id;
        email = window.__st.customer.email;
        if (id != null) source = "__st.customer";
      }
      if (
        (id === null || id === undefined) &&
        window.StorefrontConfig &&
        window.StorefrontConfig.customer
      ) {
        id = window.StorefrontConfig.customer.id;
        email = window.StorefrontConfig.customer.email;
        if (id != null) source = "StorefrontConfig.customer";
      }
      // Stencil: some themes put customer in a script tag (e.g. type="application/json" or embedded in template)
      if (id === null || id === undefined) {
        var scripts = document.querySelectorAll(
          'script[type="application/json"], script[data-customer]'
        );
        for (
          var i = 0;
          i < scripts.length && (id === null || id === undefined);
          i++
        ) {
          var raw = scripts[i].textContent || "";
          if (raw.indexOf("customer") === -1) continue;
          try {
            var data = JSON.parse(raw);
            var c = data.customer || (data.context && data.context.customer);
            if (c && (c.id != null || c.customer_id != null)) {
              id = c.id != null ? c.id : c.customer_id;
              email = c.email || (c.email_address && c.email_address) || "";
              if (id != null) source = "script JSON";
            }
          } catch (e2) {}
        }
      }
      // Data attributes (some themes set data-customer-id on body or main)
      if (id === null || id === undefined) {
        var el = document.querySelector("[data-customer-id]") || document.body;
        var dataId = el.getAttribute && el.getAttribute("data-customer-id");
        if (dataId) {
          id = dataId;
          source = "data-customer-id";
        }
      }
      if (id !== null && id !== undefined) id = String(id);
    } catch (e) {}

    if (!source && (id === null || id === undefined)) {
      console.log(
        "[FavLoyalty] getCustomerFromPage: no customer found. Checked:",
        "BC.customer=" +
          (window.BC && window.BC.customer ? "present" : "missing"),
        "window.customer=" + (window.customer ? "present" : "missing"),
        "__st.customer=" +
          (window.__st && window.__st.customer ? "present" : "missing"),
        "StorefrontConfig.customer=" +
          (window.StorefrontConfig && window.StorefrontConfig.customer
            ? "present"
            : "missing"),
        "| If logged in, your theme may expose customer elsewhere. Set window.FavLoyaltyWidgetConfig = { customerId: 'ID' } to test."
      );
    }

    return { customerId: id || "", customerEmail: email || "" };
  }

  // BigCommerce store hash is short alphanumeric (e.g. 7v0bcn6k91). Reject URLs or malformed values.
  function isValidStoreHash(val) {
    if (val == null || typeof val !== "string") return false;
    var s = val.trim();
    if (s.length === 0 || s.length > 64) return false;
    if (s.indexOf("//") !== -1 || s.indexOf("http") !== -1) return false;
    return true;
  }

  // Get storefront API token from page (Stencil may expose it) or from our backend
  function getStorefrontTokenFromPage(config) {
    try {
      if (
        window.StorefrontConfig &&
        window.StorefrontConfig.storefront_api &&
        window.StorefrontConfig.storefront_api.token
      )
        return window.StorefrontConfig.storefront_api.token;
      if (
        window.__st &&
        window.__st.storefront_api &&
        window.__st.storefront_api.token
      )
        return window.__st.storefront_api.token;
      if (
        window.FavLoyaltyWidgetConfig &&
        window.FavLoyaltyWidgetConfig.storefrontApiToken
      )
        return window.FavLoyaltyWidgetConfig.storefrontApiToken;
    } catch (e) {}
    return null;
  }

  // Get CSRF / request-verification token from page (some BigCommerce themes require it for GraphQL)
  function getCsrfTokenFromPage() {
    try {
      var meta =
        document.querySelector('meta[name="csrf-token"]') ||
        document.querySelector('meta[name="csrfToken"]') ||
        document.querySelector('meta[name="request-verification-token"]');
      if (meta && meta.getAttribute("content"))
        return meta.getAttribute("content");
      if (window.StorefrontConfig && window.StorefrontConfig.csrf_token)
        return window.StorefrontConfig.csrf_token;
      if (window.__st && window.__st.csrf_token) return window.__st.csrf_token;
      if (
        window.FavLoyaltyWidgetConfig &&
        window.FavLoyaltyWidgetConfig.csrfToken
      )
        return window.FavLoyaltyWidgetConfig.csrfToken;
    } catch (e) {}
    return null;
  }

  // Call the store's GraphQL (same origin) with storefront token + credentials to get logged-in customer
  async function getCustomerViaGraphQL(config) {
    var storefrontToken = getStorefrontTokenFromPage(config);
    if (
      !storefrontToken &&
      config.apiUrl &&
      isValidStoreHash(config.storeHash)
    ) {
      try {
        var tokenUrl =
          config.apiUrl.replace(/\/$/, "") +
          "/api/widget/storefront-token?storeHash=" +
          encodeURIComponent(String(config.storeHash).trim()) +
          "&origin=" +
          encodeURIComponent(document.location.origin);
        if (config.channelId)
          tokenUrl += "&channelId=" + encodeURIComponent(config.channelId);
        var tokenRes = await fetch(tokenUrl, { credentials: "omit" });
        if (tokenRes.ok) {
          var data = await tokenRes.json();
          if (data.token) storefrontToken = data.token;
        }
      } catch (e) {
        console.warn(
          "[FavLoyalty] getCustomerViaGraphQL: storefront-token fetch failed",
          e
        );
      }
    }
    if (!storefrontToken) return { customerId: "", customerEmail: "" };
    var graphqlHeaders = {
      Authorization: "Bearer " + storefrontToken,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    var csrfToken = getCsrfTokenFromPage();
    if (csrfToken) {
      graphqlHeaders["X-CSRF-Token"] = csrfToken;
      graphqlHeaders["Request-Verification-Token"] = csrfToken;
    }
    try {
      var graphqlUrl = document.location.origin + "/graphql";
      var res = await fetch(graphqlUrl, {
        method: "POST",
        headers: graphqlHeaders,
        credentials: "include",
        body: JSON.stringify({
          query: "query { customer { entityId email } }",
        }),
      });
      if (!res.ok) return { customerId: "", customerEmail: "" };
      var json = await res.json();
      var customer = json.data && json.data.customer;
      if (customer && (customer.entityId != null || customer.id != null)) {
        var id = String(
          customer.entityId != null ? customer.entityId : customer.id
        );
        var email = customer.email || "";
        console.log(
          "[FavLoyalty] getCustomerViaGraphQL: customer from GraphQL entityId=",
          id
        );
        return { customerId: id, customerEmail: email };
      }
    } catch (e) {
      console.warn(
        "[FavLoyalty] getCustomerViaGraphQL: GraphQL request failed",
        e
      );
    }
    return { customerId: "", customerEmail: "" };
  }

  // Open widget immediately; resolve customer in background and send to iframe via postMessage
  function openWidget(config) {
    console.log(
      "[FavLoyalty] openWidget called, config keys:",
      Object.keys(config || {}),
      "storeHash=",
      config?.storeHash,
      "apiUrl=",
      config?.apiUrl
    );
    const finalConfig = { ...config };
    finalConfig.currentCustomerJwt = null;
    // Use placement from "Placement of widget on your website" (channel-settings) so container and offset match the launcher
    finalConfig.position =
      effectivePosition || finalConfig.position || "bottom-right";

    // Use only sync customer from page globals so we can open the widget immediately
    var customer = getCustomerFromPage();
    if (customer.customerId) {
      finalConfig.customerId = customer.customerId;
      if (customer.customerEmail)
        finalConfig.customerEmail = customer.customerEmail;
      lastSentCustomerId = String(customer.customerId);
    } else {
      finalConfig.customerId = finalConfig.customerId || "";
      lastSentCustomerId = "";
    }

    // Create container/iframe only on first open; on reopen just show existing iframe so we keep
    // the same React state (including customerId set via postMessage) and avoid reload with empty config
    var iframeJustCreated = false;
    if (!widgetContainer) {
      widgetContainer = createWidgetContainer(finalConfig);
      widgetBackdrop = createBackdrop(closeWidget);
      widgetIframe = createWidgetIframe(finalConfig);
      widgetContainer.appendChild(widgetIframe);
      iframeJustCreated = true;
    }
    // On reopen we do NOT set widgetIframe.src — that would reload the iframe with URL config
    // (customerId '') and lose the previously resolved customer; we just show the container

    // Adjust widget position to avoid overlapping with button
    // Move widget up by button height (60px) + increased margin (40px) = 100px
    const buttonHeight = 60;
    const margin = 40; // Increased gap between widget and icon
    const offset = buttonHeight + margin;

    // Adjust position based on widget position to leave space for button
    if (
      finalConfig.position === "bottom-right" ||
      finalConfig.position === "bottom-left"
    ) {
      // For bottom positions, move widget up
      widgetContainer.style.bottom = offset + "px";
      widgetContainer.style.top = "auto";
    } else if (
      finalConfig.position === "top-right" ||
      finalConfig.position === "top-left"
    ) {
      // For top positions, move widget down
      widgetContainer.style.top = offset + "px";
      widgetContainer.style.bottom = "auto";
    }

    widgetContainer.style.display = "block";
    widgetContainer.style.pointerEvents = "auto";
    widgetBackdrop.style.display = "block";
    isWidgetOpen = true;

    // Tell iframe "widget was opened" so it can refetch customer data (latest from DB on reopen)
    if (widgetIframe && widgetIframe.contentWindow) {
      try {
        widgetIframe.contentWindow.postMessage(
          { type: "fav-loyalty-widget-opened" },
          "*"
        );
      } catch (e) {}
    }

    // Ensure toggle button stays visible and on top
    if (toggleButton) {
      toggleButton.style.zIndex = "10000";
      toggleButton.style.pointerEvents = "auto";
    }

    // Resolve customer in background (GraphQL)
    // First open: send to iframe only when it signals "fav-loyalty-widget-loaded" so message is not lost
    // Reopen: iframe already has listener, postMessage when resolved
    if (!customer.customerId && finalConfig.apiUrl && finalConfig.storeHash) {
      var customerPromise = getCustomerViaGraphQL(finalConfig);
      if (iframeJustCreated) {
        pendingCustomerPromise = customerPromise;
      } else {
        customerPromise
          .then(function (resolved) {
            if (!widgetIframe || !widgetIframe.contentWindow || !isWidgetOpen)
              return;
            try {
              var cid = resolved.customerId || "";
              var cem = resolved.customerEmail || "";
              lastSentCustomerId = cid;
              widgetIframe.contentWindow.postMessage(
                {
                  type: "fav-loyalty-customer",
                  customerId: cid,
                  customerEmail: cem,
                },
                "*"
              );
              if (resolved.customerId) {
                console.log(
                  "[FavLoyalty] openWidget: background customerId=",
                  resolved.customerId
                );
              }
            } catch (e) {}
          })
          .catch(function () {});
      }
    }

    // Periodic sign-out check: when widget is open, re-check customer so we clear widget if user signed out on store
    if (signOutCheckInterval) clearInterval(signOutCheckInterval);
    signOutCheckInterval = setInterval(function () {
      if (
        !isWidgetOpen ||
        !widgetIframe ||
        !widgetIframe.contentWindow ||
        !lastSentCustomerId
      )
        return;
      var c = getCustomerFromPage();
      if (c.customerId) return;
      var cfg = {
        apiUrl: finalConfig.apiUrl,
        storeHash: finalConfig.storeHash,
        channelId: finalConfig.channelId,
      };
      if (!cfg.apiUrl || !cfg.storeHash) {
        sendSignOutToIframe();
        return;
      }
      getCustomerViaGraphQL(cfg)
        .then(function (resolved) {
          if (
            !isWidgetOpen ||
            !widgetIframe ||
            !widgetIframe.contentWindow ||
            !lastSentCustomerId
          )
            return;
          if (resolved.customerId) return;
          sendSignOutToIframe();
        })
        .catch(function () {});
    }, 10000);

    function sendSignOutToIframe() {
      try {
        lastSentCustomerId = "";
        widgetIframe.contentWindow.postMessage(
          { type: "fav-loyalty-customer", customerId: "", customerEmail: "" },
          "*"
        );
        // Reset launcher and position to default when signed out so they stay correct on this page and on navigation
        applyDefaultThemeToButton(toggleButton);
        effectivePosition = "bottom-right";
        applyPosition(toggleButton, widgetContainer, effectivePosition);
      } catch (e) {}
    }
  }

  // Close widget
  function closeWidget() {
    if (signOutCheckInterval) {
      clearInterval(signOutCheckInterval);
      signOutCheckInterval = null;
    }
    if (widgetContainer) {
      widgetContainer.style.display = "none";
      widgetContainer.style.pointerEvents = "none";

      // Keep container at placement from "Placement of widget on your website"
      var pos = effectivePosition || "bottom-right";
      var positionClasses = {
        "bottom-right": {
          bottom: "20px",
          right: "20px",
          top: "auto",
          left: "auto",
        },
        "bottom-left": {
          bottom: "20px",
          left: "20px",
          top: "auto",
          right: "auto",
        },
        "top-right": {
          top: "20px",
          right: "20px",
          bottom: "auto",
          left: "auto",
        },
        "top-left": {
          top: "20px",
          left: "20px",
          bottom: "auto",
          right: "auto",
        },
      };
      Object.assign(
        widgetContainer.style,
        positionClasses[pos] || positionClasses["bottom-right"]
      );
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
      try {
        openWidget(config);
      } catch (err) {
        console.error("FavLoyalty: openWidget failed", err);
      }
    }
  }

  // Apply theme from Customise Widget (Widget Color = button bg, Widget Icon Color = icon, Launcher: IconOnly | LabelOnly | Icon&Label, Label text)
  function applyThemeToButton(btn, theme, cfg) {
    if (!btn) return;
    var widgetBgColor = theme.widgetBgColor;
    var widgetIconColor = theme.widgetIconColor;
    var widgetIconUrlId = theme.widgetIconUrlId;
    var launcherType = theme.launcherType || "IconOnly";
    var label =
      theme.label != null && String(theme.label).trim() !== ""
        ? String(theme.label).trim()
        : "Reward";
    var widgetUrl =
      cfg && cfg.widgetUrl ? cfg.widgetUrl.replace(/\/$/, "") : "";

    if (widgetBgColor) btn.style.backgroundColor = widgetBgColor;
    if (widgetIconColor) btn.style.color = widgetIconColor;

    var iconColor = widgetIconColor || "#ffffff";
    var iconHtml = "";
    if (launcherType !== "LabelOnly") {
      if (widgetIconUrlId && widgetUrl) {
        var iconUrl = widgetUrl + "/images/" + widgetIconUrlId + ".svg";
        iconHtml =
          '<span style="display:inline-block;width:28px;height:28px;flex-shrink:0;background-color:' +
          iconColor +
          ";mask:url(" +
          iconUrl +
          ") center/contain no-repeat;-webkit-mask:url(" +
          iconUrl +
          ') center/contain no-repeat;-webkit-mask-size:contain;mask-size:contain;"></span>';
      } else if (btn._defaultCoinSvg) {
        iconHtml = btn._defaultCoinSvg;
      }
    }

    if (launcherType === "LabelOnly") {
      btn.style.width = "auto";
      btn.style.minWidth = "80px";
      btn.style.height = "48px";
      btn.style.borderRadius = "999px";
      btn.style.padding = "0 20px";
      btn.style.fontSize = "15px";
      btn.style.fontWeight = "500";
      btn.style.fontFamily = "inherit";
      btn.innerHTML =
        '<span style="white-space:nowrap;">' + escapeHtml(label) + "</span>";
    } else if (launcherType === "Icon&Label") {
      btn.style.width = "auto";
      btn.style.minWidth = "100px";
      btn.style.height = "48px";
      btn.style.borderRadius = "999px";
      btn.style.padding = "0 16px 0 12px";
      btn.style.gap = "10px";
      btn.style.fontSize = "15px";
      btn.style.fontWeight = "500";
      btn.style.fontFamily = "inherit";
      btn.innerHTML =
        (iconHtml.indexOf("<svg") !== -1
          ? '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex-shrink:0;">' +
            iconHtml +
            "</span>"
          : iconHtml) +
        '<span style="white-space:nowrap;">' +
        escapeHtml(label) +
        "</span>";
    } else {
      // IconOnly (default)
      btn.style.width = "60px";
      btn.style.height = "60px";
      btn.style.borderRadius = "50%";
      btn.style.padding = "0";
      btn.style.minWidth = "";
      btn.style.gap = "";
      btn.style.fontSize = "24px";
      btn.innerHTML = iconHtml || btn._defaultCoinSvg || "";
    }
  }

  // Show launcher button only after final position/theme is decided (avoids visible position jump on load)
  function showLauncherButton() {
    if (toggleButton) {
      toggleButton.style.opacity = "1";
      toggleButton.style.pointerEvents = "auto";
    }
  }

  // Reset launcher to default (green, gift icon, circular) when signed out — matches widget DEFAULT_THEME
  var DEFAULT_LAUNCHER_BG = "#62a63f";
  var DEFAULT_LAUNCHER_ICON_COLOR = "#ffffff";
  function applyDefaultThemeToButton(btn) {
    if (!btn) return;
    btn.style.backgroundColor = DEFAULT_LAUNCHER_BG;
    btn.style.color = DEFAULT_LAUNCHER_ICON_COLOR;
    btn.style.width = "60px";
    btn.style.height = "60px";
    btn.style.borderRadius = "50%";
    btn.style.padding = "0";
    btn.style.minWidth = "";
    btn.style.gap = "";
    btn.style.fontSize = "24px";
    btn.innerHTML = btn._defaultCoinSvg || "";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Fetch channel-settings (theme) and apply to launcher button so it shows Widget Color + icon before user opens widget
  function fetchAndApplyTheme(config) {
    var apiUrl =
      config && config.apiUrl ? config.apiUrl.replace(/\/$/, "") : "";
    var storeHash =
      config && config.storeHash ? String(config.storeHash).trim() : "";
    var channelId =
      config && config.channelId != null ? String(config.channelId) : "";
    if (
      !apiUrl ||
      !isValidStoreHash(storeHash) ||
      !channelId ||
      !toggleButton
    ) {
      // Still show launcher with initial config so widget is visible on all pages (e.g. when params missing on some pages)
      showLauncherButton();
      return;
    }
    var url =
      apiUrl +
      "/api/widget/channel-settings?storeHash=" +
      encodeURIComponent(storeHash) +
      "&channelId=" +
      encodeURIComponent(channelId);
    fetch(url, { method: "GET" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data.success || !toggleButton) {
          showLauncherButton();
          return;
        }
        // Always apply channel-settings first so signed-in users keep correct theme/position on page navigation
        // (getCustomerFromPage() is often empty on new page load because store globals aren't set yet)
        applyThemeToButton(
          toggleButton,
          {
            widgetBgColor: data.widgetBgColor,
            widgetIconColor: data.widgetIconColor,
            widgetIconUrlId: data.widgetIconUrlId,
            launcherType: data.launcherType,
            label: data.label,
          },
          config
        );
        var pos = data.position || data.widgetButton;
        if (pos) {
          effectivePosition = normalizePosition(pos);
        }
        applyPosition(toggleButton, widgetContainer, effectivePosition);
        // Only switch to default if we confirm user is signed out (async check; sync getCustomerFromPage can be empty on load)
        getCustomerViaGraphQL(config)
          .then(function (resolved) {
            if (!resolved.customerId && toggleButton) {
              applyDefaultThemeToButton(toggleButton);
              effectivePosition = "bottom-right";
              applyPosition(toggleButton, widgetContainer, effectivePosition);
            }
            showLauncherButton();
          })
          .catch(function () {
            showLauncherButton();
          });
      })
      .catch(function () {
        // Channel-settings failed; show button at initial position so launcher is still visible
        showLauncherButton();
      });
  }

  // Initialize widget
  function initWidget() {
    const config = getConfig();

    if (!config.widgetUrl) {
      console.error(
        "FavLoyalty Widget: widgetUrl is required. Set it via data-widget-url attribute or FavLoyaltyWidgetConfig."
      );
      return;
    }

    // Position from URL (when script has ?position=bottom-left) or default; fetchAndApplyTheme may update later
    effectivePosition = normalizePosition(config.position) || "bottom-right";
    config.position = effectivePosition;

    // Create toggle button only; container/iframe created on first open (with Current Customer JWT)
    toggleButton = createToggleButton(config, function (e) {
      console.log("Widget toggle button clicked");
      toggleWidget(config);
    });

    // Apply theme from Customise Widget so launcher shows correct Widget Color and icon from first paint
    fetchAndApplyTheme(config);
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
