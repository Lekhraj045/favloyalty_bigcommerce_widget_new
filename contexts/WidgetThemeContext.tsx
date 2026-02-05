"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LauncherType = "IconOnly" | "LabelOnly" | "Icon&Label";

export type WidgetTheme = {
  headerColor: string;
  headingColor: string; // Heading text color (e.g. for "150 Points" on home)
  iconColor: string;
  headerBgImage: string | null; // url for background pattern, or null
  launcherIconId: string | null; // e.g. "widget-icon1" from Select Widget Icon
  launcherType: LauncherType; // IconOnly | LabelOnly | Icon&Label
  label: string; // Label text when launcher shows label (from Customise Widget)
};

const DEFAULT_THEME: WidgetTheme = {
  headerColor: "#62a63f",
  headingColor: "#ffffff",
  iconColor: "#ffffff",
  headerBgImage: null,
  launcherIconId: null,
  launcherType: "IconOnly",
  label: "Reward",
};

// Pattern SVGs are 70x36; tile at natural size so repeat looks correct (not stretched by "cover")
const PATTERN_TILE_WIDTH = 70;
const PATTERN_TILE_HEIGHT = 36;

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace(/^#/, "");
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Returns the header style object: solid color + optional pattern with subtle overlay (like second screenshot). */
export function getHeaderStyle(theme: WidgetTheme): CSSProperties {
  const base: CSSProperties = {
    backgroundColor: theme.headerColor,
  };
  if (!theme.headerBgImage) return base;
  // Layer: semi-transparent header color overlay on top of pattern so pattern is subtle, not harsh
  return {
    ...base,
    backgroundImage: `linear-gradient(${hexToRgba(
      theme.headerColor,
      0.45
    )}, ${hexToRgba(theme.headerColor, 0.45)}), url(${theme.headerBgImage})`,
    backgroundSize: `auto, ${PATTERN_TILE_WIDTH}px ${PATTERN_TILE_HEIGHT}px`,
    backgroundRepeat: "repeat, repeat",
  };
}

// Map pattern id from backend to image filename (same as frontend customise-widget)
const PATTERN_ID_TO_IMAGE: Record<string, string> = {
  pattern1: "wizard-pattern1.svg",
  pattern2: "wizard-pattern2.svg",
  pattern3: "wizard-pattern3.svg",
  pattern4: "wizard-pattern4.svg",
};

function safeParseConfig(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
  } catch {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

function getConfig(): {
  apiUrl?: string;
  storeHash?: string;
  channelId?: string;
  customerId?: string;
} {
  if (typeof window === "undefined") return {};
  const c = (
    window as unknown as {
      FavLoyaltyWidgetConfig?: {
        apiUrl?: string;
        storeHash?: string;
        channelId?: string;
        customerId?: string;
      };
    }
  ).FavLoyaltyWidgetConfig;
  const fromWindow = c ?? {};
  // In embed iframe, config is in URL (?config=...) and may be set after first paint; read from URL so theme fetch runs
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = safeParseConfig(urlParams.get("config"));
  const apiUrl = (fromWindow.apiUrl ?? fromUrl.apiUrl) as string | undefined;
  const storeHash = (fromWindow.storeHash ?? fromUrl.storeHash) as
    | string
    | undefined;
  const channelId = fromWindow.channelId ?? fromUrl.channelId;
  const channelIdStr = channelId != null ? String(channelId) : undefined;
  const customerId = fromWindow.customerId ?? fromUrl.customerId;
  const customerIdStr =
    customerId != null && customerId !== ""
      ? String(customerId).trim()
      : undefined;
  return {
    apiUrl,
    storeHash,
    channelId: channelIdStr,
    customerId: customerIdStr,
  };
}

function isInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.parent && window.parent !== window;
  } catch {
    return true;
  }
}

export type WidgetThemeContextValue = WidgetTheme & {
  resetThemeToDefault?: () => void;
};

const WidgetThemeContext =
  createContext<WidgetThemeContextValue>(DEFAULT_THEME);

export function WidgetThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<WidgetTheme>(DEFAULT_THEME);

  const resetThemeToDefault = useCallback(() => {
    setTheme(DEFAULT_THEME);
    if (isInIframe()) {
      try {
        window.parent.postMessage(
          {
            type: "fav-loyalty-widget-theme",
            widgetBgColor: DEFAULT_THEME.headerColor,
            widgetIconColor: DEFAULT_THEME.iconColor,
            widgetIconUrlId: DEFAULT_THEME.launcherIconId,
            launcherType: DEFAULT_THEME.launcherType,
            label: DEFAULT_THEME.label,
            position: "bottom-right",
          },
          "*"
        );
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    function doFetch() {
      const config = getConfig();
      const apiUrl = config?.apiUrl?.replace(/\/$/, "");
      const storeHash = config?.storeHash;
      const channelId = config?.channelId;
      if (!apiUrl || !storeHash || !channelId) return;

      const url = `${apiUrl}/api/widget/channel-settings?storeHash=${encodeURIComponent(
        storeHash
      )}&channelId=${encodeURIComponent(String(channelId))}`;
      fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          if (cancelled || !data.success) return;
          // When signed out (no customerId), always use default theme so we don't overwrite resetThemeToDefault
          const currentConfig = getConfig();
          if (!currentConfig.customerId || currentConfig.customerId === "") {
            setTheme(DEFAULT_THEME);
            if (isInIframe()) {
              try {
                window.parent.postMessage(
                  {
                    type: "fav-loyalty-widget-theme",
                    widgetBgColor: DEFAULT_THEME.headerColor,
                    widgetIconColor: DEFAULT_THEME.iconColor,
                    widgetIconUrlId: DEFAULT_THEME.launcherIconId,
                    launcherType: DEFAULT_THEME.launcherType,
                    label: DEFAULT_THEME.label,
                    position: "bottom-right",
                  },
                  "*"
                );
              } catch (_) {}
            }
            return;
          }
          const headerColor =
            data.widgetBgColor && typeof data.widgetBgColor === "string"
              ? data.widgetBgColor
              : DEFAULT_THEME.headerColor;
          const headingColor =
            data.headingColor != null && typeof data.headingColor === "string"
              ? data.headingColor
              : DEFAULT_THEME.headingColor;
          const iconColor =
            data.widgetIconColor != null &&
            typeof data.widgetIconColor === "string"
              ? data.widgetIconColor
              : DEFAULT_THEME.iconColor;
          const launcherIconId =
            data.widgetIconUrlId && typeof data.widgetIconUrlId === "string"
              ? data.widgetIconUrlId
              : null;
          const launcherType =
            data.launcherType === "LabelOnly" ||
            data.launcherType === "Icon&Label"
              ? data.launcherType
              : "IconOnly";
          const label =
            data.label != null && String(data.label).trim() !== ""
              ? String(data.label).trim()
              : "Reward";
          let headerBgImage: string | null = null;
          if (data.backgroundPatternEnabled && data.backgroundPatternUrlId) {
            const imageName = PATTERN_ID_TO_IMAGE[data.backgroundPatternUrlId];
            if (imageName) {
              const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
              headerBgImage = `${base}/images/${imageName}`;
            }
          }
          setTheme({
            headerColor,
            headingColor,
            iconColor,
            headerBgImage,
            launcherIconId,
            launcherType,
            label,
          });

          if (isInIframe()) {
            try {
              const position =
                data.position &&
                typeof data.position === "string" &&
                [
                  "bottom-left",
                  "bottom-right",
                  "top-left",
                  "top-right",
                ].includes(data.position)
                  ? data.position
                  : "bottom-right";
              window.parent.postMessage(
                {
                  type: "fav-loyalty-widget-theme",
                  widgetBgColor: headerColor,
                  widgetIconColor: iconColor,
                  widgetIconUrlId: launcherIconId,
                  launcherType,
                  label,
                  position,
                },
                "*"
              );
            } catch (_) {}
          }
        })
        .catch(() => {});
    }

    doFetch();
    const t = setTimeout(doFetch, 200);

    // On widget reopen, refetch channel settings so header color and background pattern (and icon) reflect latest from DB
    function onWidgetOpened() {
      doFetch();
    }
    // When loader sends sign-out (customerId ""), reset theme immediately so default is never overwritten by a late channel-settings response
    function onCustomerMessage(event: MessageEvent) {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        const customerId = data.customerId ?? "";
        if (customerId === "" || String(customerId).trim() === "") {
          setTheme(DEFAULT_THEME);
          if (isInIframe()) {
            try {
              window.parent.postMessage(
                {
                  type: "fav-loyalty-widget-theme",
                  widgetBgColor: DEFAULT_THEME.headerColor,
                  widgetIconColor: DEFAULT_THEME.iconColor,
                  widgetIconUrlId: DEFAULT_THEME.launcherIconId,
                  launcherType: DEFAULT_THEME.launcherType,
                  label: DEFAULT_THEME.label,
                  position: "bottom-right",
                },
                "*"
              );
            } catch (_) {}
          }
        }
      }
    }
    function onMessage(event: MessageEvent) {
      if (event.data?.type === "fav-loyalty-widget-opened") {
        onWidgetOpened();
      }
      onCustomerMessage(event);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("message", onMessage);
    }

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (typeof window !== "undefined") {
        window.removeEventListener("message", onMessage);
      }
    };
  }, []);

  return (
    <WidgetThemeContext.Provider value={{ ...theme, resetThemeToDefault }}>
      {children}
    </WidgetThemeContext.Provider>
  );
}

export function useWidgetTheme(): WidgetThemeContextValue {
  const context = useContext(WidgetThemeContext);
  return context ?? { ...DEFAULT_THEME, resetThemeToDefault: undefined };
}
