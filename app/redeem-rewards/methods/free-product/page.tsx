"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Copy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type WidgetConfig = {
  apiUrl?: string;
  channelId?: string;
  storeHash?: string;
  customerId?: string | number;
};

function getConfig(): WidgetConfig {
  if (typeof window === "undefined") return {};
  return (
    (window as unknown as { FavLoyaltyWidgetConfig?: WidgetConfig })
      .FavLoyaltyWidgetConfig ?? {}
  );
}

type RestrictionItem = {
  value?: string;
  imgUrl?: string;
  pointRequired?: string;
};

type RedeemCoupon = {
  _id?: string;
  coupon?: {
    active?: boolean;
    value?: number;
    name?: string;
    restriction?: {
      selectedItems?: {
        status?: boolean;
        items?: RestrictionItem[];
      };
    };
  };
};

function fallbackCopyText(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

async function copyToClipboard(
  text: string,
  onSuccess: () => void
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      onSuccess();
      return;
    }
  } catch {
    // Clipboard API blocked (e.g. in iframe) — use fallback
  }
  if (fallbackCopyText(text)) onSuccess();
}

export default function FreeProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId") ?? "";

  const [config, setConfig] = useState<WidgetConfig>(() => getConfig());
  const [redeemSetting, setRedeemSetting] = useState<RedeemCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<{
    couponCode: string;
    offerLabel: string;
    expiresAt: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data?.type === "fav-loyalty-customer") {
        setConfig((prev) => ({
          ...prev,
          customerId:
            (data as { customerId?: string }).customerId ?? prev.customerId,
        }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const fetchRedeemSettings = useCallback(async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (!apiUrl || !storeHash || !channelId || !couponId) {
      setRedeemSetting(null);
      setLoading(false);
      if (couponId && (!apiUrl || !storeHash || !channelId)) {
        setLoadError("Widget configuration missing");
      }
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        storeHash: String(storeHash),
        channelId: String(channelId),
      });
      if (customerId != null && String(customerId).trim() !== "") {
        params.set("customerId", String(customerId).trim());
      }
      const url = `${apiUrl}/api/widget/redeem-settings?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Failed to load redeem method (${res.status})`
        );
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const found = list.find(
        (c: RedeemCoupon) => (c._id ?? "").toString() === couponId
      );
      setRedeemSetting(found ?? null);
      if (!found) setLoadError("Redeem method not found");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
      setRedeemSetting(null);
    } finally {
      setLoading(false);
    }
  }, [
    config?.apiUrl,
    config?.storeHash,
    config?.channelId,
    config?.customerId,
    couponId,
  ]);

  useEffect(() => {
    fetchRedeemSettings();
  }, [fetchRedeemSettings]);

  const handleCancel = () => {
    router.push("/redeem-rewards");
  };

  const handleConfirm = async () => {
    const apiUrl = config?.apiUrl?.replace(/\/$/, "");
    const storeHash = config?.storeHash;
    const channelId = config?.channelId;
    const customerId = config?.customerId;
    if (
      !apiUrl ||
      !storeHash ||
      !channelId ||
      customerId == null ||
      String(customerId).trim() === "" ||
      !couponId
    ) {
      setRedeemError("Missing store or customer. Please sign in.");
      return;
    }
    setRedeemError(null);
    setRedeeming(true);
    try {
      const res = await fetch(`${apiUrl}/api/widget/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeHash,
          channelId,
          customerId: String(customerId).trim(),
          redeemSettingId: couponId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Redemption failed (${res.status})`);
      }
      if (!data.success) {
        throw new Error(data?.message || "Redemption failed");
      }
      setResult({
        couponCode: data.couponCode ?? "",
        offerLabel: data.offerLabel ?? "Get Free Products",
        expiresAt: data.expiresAt ?? null,
      });
      setShowConfirmModal(false);
      setConfirmed(true);
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : "Redemption failed");
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopy = () => {
    const code = result?.couponCode ?? "";
    if (!code) return;
    copyToClipboard(code, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const theme = useWidgetTheme();
  const headerStyle = getHeaderStyle(theme);
  const offerLabel = redeemSetting?.coupon?.name ?? "Get Free Products";
  // Points: use coupon.value (set from product points in admin), else derive from selected items
  const pointsRequired = (() => {
    const v = redeemSetting?.coupon?.value;
    if (v != null && v > 0) return Number(v);
    const items =
      redeemSetting?.coupon?.restriction?.selectedItems?.items ?? [];
    const pts = items
      .map((i) => parseInt(String(i.pointRequired ?? "0"), 10))
      .filter((n) => !isNaN(n) && n > 0);
    return pts.length ? Math.min(...pts) : 0;
  })();
  const restrictionItems =
    redeemSetting?.coupon?.restriction?.selectedItems?.items ?? [];

  const header = (
    <div className="text-white p-4 relative rounded-t-2xl" style={headerStyle}>
      <div className="flex gap-2">
        <div className="mt-[5px]">
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{offerLabel}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] text-white">
              Free Product
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 flex items-center justify-center h-[calc(100vh-84px)]">
          <p className="text-sm text-[#616161]">Loading…</p>
        </div>
      </WidgetWrapper>
    );
  }

  if (loadError && !redeemSetting) {
    return (
      <WidgetWrapper header={header}>
        <div className="p-4 flex flex-col gap-4">
          <p className="text-sm text-red-600">{loadError}</p>
          <button
            type="button"
            className="custom-btn"
            onClick={() => router.push("/redeem-rewards")}
          >
            Back to Rewards
          </button>
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper header={header}>
      <div className="p-4 relative z-10 h-[calc(100vh-84px)] overflow-y-auto custom-scroller">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          {/* Confirm Free Product Modal */}
          {showConfirmModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
                style={{ zIndex: 99999 }}
                aria-modal="true"
                role="dialog"
              >
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-base font-bold text-[#303030]">
                      Confirm Free Product
                    </h3>
                    <p className="text-sm text-[#616161] mt-2">
                      Are you sure you want to redeem points for this free
                      product reward?
                    </p>
                    <p className="text-sm text-[#303030] mt-3">
                      Points to be deducted:{" "}
                      <span className="font-semibold text-[#14b8a6]">
                        {pointsRequired}
                      </span>
                    </p>
                    {restrictionItems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-[#616161] mb-2">
                          Applies to:
                        </p>
                        <ul className="text-sm text-[#303030] space-y-1 max-h-24 overflow-y-auto">
                          {restrictionItems.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              {item.imgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imgUrl}
                                  alt={item.value ?? "Product"}
                                  width={24}
                                  height={24}
                                  className="rounded object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded bg-[#f0f0f0] shrink-0" />
                              )}
                              <span className="truncate">
                                {item.value ?? "Product"}
                                {item.pointRequired
                                  ? ` (${item.pointRequired} pts)`
                                  : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {redeemError && (
                      <p className="text-sm text-red-600 mt-2">{redeemError}</p>
                    )}
                  </div>
                  <div className="flex gap-3 p-4 border-t border-[#e5e5e5]">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border-2 border-[#dc2626] text-[#dc2626] bg-white hover:bg-[#fef2f2] transition-colors disabled:opacity-50"
                      disabled={redeeming}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-[#14b8a6] text-white hover:bg-[#0d9488] transition-colors disabled:opacity-50"
                      disabled={redeeming}
                    >
                      {redeeming ? "Redeeming…" : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Success view after Confirm */}
          {confirmed && result && (
            <>
              <div className="card flex flex-col gap-4 items-center text-center">
                <div className="flex flex-col items-center gap-1 w-full">
                  <h3 className="text-base font-medium text-[#303030] leading-tight">
                    {result.offerLabel}
                  </h3>
                  <p className="text-[13px] text-[#616161] mt-0.5 uppercase">
                    Free product coupon
                  </p>
                </div>
                <div className="border-t border-dashed border-[#d4d4d4] w-full" />
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                  <div className="flex items-center gap-2 justify-center flex-wrap">
                    <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-3 py-2 flex items-center gap-2">
                      <span className="text-[13px] text-[#303030]">Code: </span>
                      <span className="text-[13px] font-semibold text-[#14b8a6] truncate max-w-[180px]">
                        {result.couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="shrink-0 p-0.5 rounded text-[#737373] hover:text-[#303030] hover:bg-[#e5e5e5] transition-colors"
                        aria-label="Copy code"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copied && (
                      <span className="text-xs text-[#16a34a] font-medium">
                        Copied!
                      </span>
                    )}
                  </div>
                  <Link
                    href="/redeem-rewards?tab=coupons"
                    className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium border-2 border-[#14b8a6] text-[#14b8a6] bg-white hover:bg-[#f0fdfa] transition-colors inline-flex items-center justify-center"
                  >
                    View My Coupons
                  </Link>
                </div>
              </div>

              <div className="card text-center">
                <h3 className="text-sm font-medium text-[#303030]">
                  Please be ensured that:
                </h3>
                <div className="flex flex-col gap-1.5 mt-2">
                  <p className="text-xs text-[#616161]">
                    {result.expiresAt
                      ? `The discount code expires on ${new Date(
                          result.expiresAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`
                      : "The discount code does not expire"}
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </WidgetWrapper>
  );
}
