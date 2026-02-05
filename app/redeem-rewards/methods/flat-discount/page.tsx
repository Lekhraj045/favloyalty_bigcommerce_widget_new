"use client";

import WidgetWrapper from "@/components/WidgetWrapper";
import { getHeaderStyle, useWidgetTheme } from "@/contexts/WidgetThemeContext";
import { ArrowLeft, Copy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
};

type RedeemCoupon = {
  _id?: string;
  redeemType?: string;
  coupon?: {
    active?: boolean;
    value?: number;
    discountAmount?: number;
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

export default function FlatDiscountPage() {
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
        offerLabel: data.offerLabel ?? "Loyalty reward",
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
  const pointsRequired = redeemSetting?.coupon?.value ?? 0;
  const offerLabel =
    redeemSetting?.coupon?.name ??
    (redeemSetting?.coupon?.discountAmount != null
      ? `Flat ${redeemSetting.coupon.discountAmount}% off`
      : "Discount");
  const restrictionItems =
    redeemSetting?.coupon?.restriction?.selectedItems?.items ?? [];
  const hasProductRestriction =
    redeemSetting?.coupon?.restriction?.selectedItems?.status === true &&
    restrictionItems.length > 0;

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
              Coupon Code
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
          {/* Confirm Discount Creation Modal */}
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
                  <div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-[#303030]">
                        Confirm Discount Creation
                      </h3>
                      <p className="text-sm text-[#616161] mt-2">
                        Are you sure you want to create this discount coupon?
                      </p>
                      <p className="text-sm text-[#62a63f] mt-3">
                        Points to be deducted:{" "}
                        <span className="font-semibold">{pointsRequired}</span>
                      </p>
                      {redeemError && (
                        <p className="text-sm text-red-600 mt-2">
                          {redeemError}
                        </p>
                      )}
                    </div>
                    {hasProductRestriction && restrictionItems.length > 0 && (
                      <div className="bg-[#fafafa] border-[#e5e5e5] border-t p-3">
                        <p className="text-sm font-medium text-[#303030] mb-2">
                          Applies to {restrictionItems.length} selected product
                          {restrictionItems.length !== 1 ? "s" : ""}:
                        </p>
                        <div className="max-h-[200px] overflow-y-auto custom-scroller">
                          <div className="flex flex-col gap-2">
                            {restrictionItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e5e5] bg-white"
                              >
                                {item.imgUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.imgUrl}
                                    alt={item.value ?? "Product"}
                                    width={40}
                                    height={40}
                                    className="w-12 h-12 min-w-12 min-h-12 object-cover rounded-lg shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 min-w-12 min-h-12 bg-linear-to-br from-green-50 to-emerald-50 rounded-lg border border-[#e5e5e5] shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-medium text-[#303030] truncate">
                                    {item.value ?? "Product"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 p-4 border-t border-[#e5e5e5] justify-center">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="custom-btn-default"
                      disabled={redeeming}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="custom-btn"
                      disabled={redeeming}
                    >
                      {redeeming ? "Creating…" : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* Success view after Confirm */}
          {confirmed && result && (
            <>
              <div className="card flex flex-col gap-4">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-[#303030] leading-tight">
                      {result.offerLabel}
                    </h3>
                    <p className="text-[13px] text-[#616161] mt-0.5">
                      FOR INDIVIDUAL ORDER
                    </p>
                  </div>
                </div>
                <div className="border-t border-dashed border-[#d4d4d4]" />
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="border border-dashed border-[#a3a3a3] rounded-lg bg-[#f5f5f5] px-4 py-2 flex items-center gap-2 w-full max-w-[260px] justify-center">
                      <span className="text-[13px] font-medium text-[#303030] truncate">
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
                    className="custom-btn shrink-0 inline-flex items-center justify-center"
                  >
                    View My Coupons
                  </Link>
                </div>
              </div>

              <div className="card">
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
