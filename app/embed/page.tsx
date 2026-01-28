"use client";

import HomePage from "@/app/home/page";
import { useEffect, useMemo, useState } from "react";

type WidgetTheme = {
  primaryColor?: string;
  headerColor?: string;
};

type WidgetConfig = {
  widgetUrl?: string;
  position?: string;
  apiUrl?: string;
  storeId?: string;
  channelId?: string;
  customerId?: string;
  customerEmail?: string;
  theme?: WidgetTheme;
};

function safeParseConfig(raw: string | null): WidgetConfig {
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as WidgetConfig;
  } catch {
    try {
      return JSON.parse(raw) as WidgetConfig;
    } catch {
      return {};
    }
  }
}

function getInitialConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  const urlParams = new URLSearchParams(window.location.search);
  return safeParseConfig(urlParams.get("config"));
}

export default function EmbedPage() {
  // Initialize from URL once (avoid setState inside effect)
  const [config] = useState<WidgetConfig>(() => getInitialConfig());

  const isInIframe = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.parent && window.parent !== window;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    // Expose config for any components that read it from window (optional)
    (
      window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig }
    ).FavLoyaltyWidgetConfig = config;
    // Mark this session as "embedded" so UI can avoid rendering launcher/container twice
    (
      window as unknown as { __FAVLOYALTY_EMBEDDED__?: boolean }
    ).__FAVLOYALTY_EMBEDDED__ = true;

    // Notify parent that iframe is ready (widget-loader.js listens for these)
    if (isInIframe) {
      window.parent.postMessage({ type: "fav-loyalty-widget-loaded" }, "*");
      window.parent.postMessage(
        { type: "fav-loyalty-widget-height", height: 580 },
        "*",
      );
    }
  }, [config, isInIframe]);

  return (
    <div
      style={{
        height: "580px",
        minHeight: "580px",
        maxHeight: "580px",
        background: "transparent",
        padding: "0",
        margin: "0",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <HomePage />
    </div>
  );
}
