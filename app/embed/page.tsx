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
  storeHash?: string;
  storeOrigin?: string;
  appClientId?: string;
  channelId?: string;
  customerId?: string;
  customerEmail?: string;
  currentCustomerJwt?: string | null;
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

const STORAGE_KEY_PREFIX = "favloyalty_customer";

function getStorageKey(storeHash?: string, channelId?: string): string {
  if (storeHash && channelId)
    return `${STORAGE_KEY_PREFIX}_${storeHash}_${channelId}`;
  if (storeHash) return `${STORAGE_KEY_PREFIX}_${storeHash}`;
  return STORAGE_KEY_PREFIX;
}

function getPersistedCustomer(
  storeHash?: string,
  channelId?: string
): { customerId?: string; customerEmail?: string } | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  try {
    const raw = sessionStorage.getItem(getStorageKey(storeHash, channelId));
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      customerId?: string;
      customerEmail?: string;
    };
    return data && (data.customerId != null || data.customerEmail != null)
      ? data
      : null;
  } catch {
    return null;
  }
}

function setPersistedCustomer(
  storeHash: string | undefined,
  channelId: string | undefined,
  customerId: string,
  customerEmail?: string
): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    sessionStorage.setItem(
      getStorageKey(storeHash, channelId),
      JSON.stringify({ customerId, customerEmail: customerEmail ?? "" })
    );
  } catch {
    // ignore
  }
}

function clearPersistedCustomer(storeHash?: string, channelId?: string): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    sessionStorage.removeItem(getStorageKey(storeHash, channelId));
  } catch {
    // ignore
  }
}

function getInitialConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  const urlParams = new URLSearchParams(window.location.search);
  const config = safeParseConfig(urlParams.get("config"));
  // Restore persisted customer so returning to Home (e.g. from Transaction History) still shows customer details
  const persisted = getPersistedCustomer(config.storeHash, config.channelId);
  if (persisted?.customerId) {
    return {
      ...config,
      customerId: persisted.customerId,
      customerEmail: persisted.customerEmail ?? config.customerEmail,
    };
  }
  return config;
}

export default function EmbedPage() {
  // Initialize from URL; parent may send customerId later via postMessage
  const [config, setConfig] = useState<WidgetConfig>(() => getInitialConfig());

  const isInIframe = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.parent && window.parent !== window;
    } catch {
      return true;
    }
  }, []);

  // Listen for customer data from widget loader (resolved in background after open)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        const customerId = data.customerId ?? "";
        const customerEmail = data.customerEmail ?? "";
        setConfig((prev) => {
          const next = { ...prev, customerId, customerEmail };
          if (next.customerId && (next.storeHash ?? prev.storeHash) != null) {
            setPersistedCustomer(
              next.storeHash ?? prev.storeHash,
              next.channelId ?? prev.channelId,
              String(next.customerId),
              next.customerEmail
            );
          } else {
            clearPersistedCustomer(
              next.storeHash ?? prev.storeHash,
              next.channelId ?? prev.channelId
            );
          }
          return next;
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
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
        { type: "fav-loyalty-widget-height", height: 586 },
        "*"
      );
    }
  }, [config, isInIframe]);

  return (
    <div
      style={{
        height: "586px",
        minHeight: "586px",
        maxHeight: "586px",
        background: "transparent",
        padding: "0",
        margin: "0",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <HomePage config={config} />
    </div>
  );
}
